"use client";

import { useEffect, useMemo, useState } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { AlertItemInfo } from "@/app/api/alert/util/types";
import { filterOptions } from "./Alert-Filter";
import { requestUserLocation } from "@/app/lib/permission/location";

interface AlertItemMapProps {
    alerts: AlertItemInfo[];
    activeFilter: string;
    focusedAlert?: AlertItemInfo | null;
    onPinClick?: (alert: AlertItemInfo) => void;
}

type RadiusCircleProps = {
    center: google.maps.LatLngLiteral;
    radius: number;
    strokeColor: string;
    fillColor: string;
};

type CircleCenter = {
    lat: number;
    lng: number;
};

// --- Alert Impact Radius (1km) ---
const ALERT_RADIUS_METERS = 1000;

// --- Helper: Distance Between Two Coordinates (Meters) ---
function getDistanceMeters(a: CircleCenter, b: CircleCenter) {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const earthRadius = 6371000;

    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const haversine = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

    return earthRadius * c;
}

// --- Merge Overlapping Alert Circles ---
// If two alert circles overlap, they will be grouped into one cluster circle.
// This also supports chain overlaps (A overlaps B, B overlaps C).
function mergeOverlappingCircles(points: CircleCenter[], baseRadius: number) {
    if (points.length === 0) return [];

    const visited = new Array(points.length).fill(false);
    const merged: Array<{ center: CircleCenter; radius: number }> = [];

    for (let i = 0; i < points.length; i++) {
        if (visited[i]) continue;

        const stack = [i];
        const clusterIndices: number[] = [];
        visited[i] = true;

        while (stack.length > 0) {
            const current = stack.pop()!;
            clusterIndices.push(current);

            for (let j = 0; j < points.length; j++) {
                if (visited[j]) continue;

                const distance = getDistanceMeters(points[current], points[j]);
                if (distance <= baseRadius * 2) {
                    visited[j] = true;
                    stack.push(j);
                }
            }
        }

        const clusterPoints = clusterIndices.map((index) => points[index]);
        const center = {
            lat: clusterPoints.reduce((sum, point) => sum + point.lat, 0) / clusterPoints.length,
            lng: clusterPoints.reduce((sum, point) => sum + point.lng, 0) / clusterPoints.length,
        };

        const maxDistanceToCenter = clusterPoints.reduce((maxDistance, point) => {
            const distance = getDistanceMeters(center, point);
            return Math.max(maxDistance, distance);
        }, 0);

        merged.push({
            center,
            radius: baseRadius + maxDistanceToCenter,
        });
    }

    return merged;
}

// --- Reusable Google Maps Circle Overlay ---
function RadiusCircle({ center, radius, strokeColor, fillColor }: RadiusCircleProps) {
    const map = useMap();

    useEffect(() => {
        if (!map || typeof google === "undefined") return;

        const circle = new google.maps.Circle({
            map,
            center,
            radius,
            strokeColor,
            strokeOpacity: 0.7,
            strokeWeight: 1.5,
            fillColor,
            fillOpacity: 0.15,
        });

        return () => {
            circle.setMap(null);
        };
    }, [map, center, radius, strokeColor, fillColor]);

    return null;
}

export default function AlertItemMap({ alerts, activeFilter, focusedAlert, onPinClick }: AlertItemMapProps) {
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null); // State to store user's current location.
    const [hoveredAlert, setHoveredAlert] = useState<AlertItemInfo | null>(null); // State to track which alert marker is being hovered for showing info window.
    const [hoveredUserPin, setHoveredUserPin] = useState(false); // State to track if user location pin is hovered for showing info window.

    // --- Get Current User Location ---
    useEffect(() => {
        requestUserLocation(true).then((location) => {
            if (location) setUserLocation(location);
        });
    }, []);

    // --- Filter Alerts Without Valid Coordinates ---
    const validAlerts = alerts.filter(alert => typeof alert.lat === "number" && typeof alert.lng === "number");

    // --- Filter Alerts by Category ---
    const filteredAlerts = validAlerts.filter((item) =>
        activeFilter === "all" ||
        (activeFilter === "other"
            ? !["flood", "landslide", "tidal"].includes(item.hazardType)
            : item.hazardType === activeFilter)
    );

    // --- Build Cluster Circles from Filtered Alert Pins ---
    const mergedAlertCircles = useMemo(() => {
        const points = filteredAlerts.map((alert) => ({ lat: alert.lat, lng: alert.lng }));
        return mergeOverlappingCircles(points, ALERT_RADIUS_METERS);
    }, [filteredAlerts]);

    // --- Map Center: Focused Alert > First Filtered > User Location > Borneo Default ---
    const defaultCenter = { lat: 1.5, lng: 113.0 };
    const mapCenter = focusedAlert
        ? { lat: focusedAlert.lat, lng: focusedAlert.lng }
        : filteredAlerts.length > 0
            ? { lat: filteredAlerts[0].lat, lng: filteredAlerts[0].lng }
            : userLocation ?? defaultCenter;
    const mapZoom = focusedAlert ? 12 : 6;

    return (
        <div className="w-full h-150 rounded-xl overflow-hidden shadow-md">
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_JS_API_KEY!}>
                <Map
                    key={`${mapCenter.lat}-${mapCenter.lng}-${mapZoom}`}
                    defaultCenter={mapCenter}
                    defaultZoom={mapZoom}
                    mapId="DEMO_MAP_ID"
                >
                    {/* --- Merged Alert Radius Circles (Red) --- */}
                    {mergedAlertCircles.map((circle, index) => (
                        <RadiusCircle
                            key={`alert-circle-cluster-${index}`}
                            center={circle.center}
                            radius={circle.radius}
                            strokeColor="#EF4444"
                            fillColor="#EF4444"
                        />
                    ))}

                    {/* --- Alert Markers (Red Pins) --- */}
                    {filteredAlerts.map((alert, index) => (
                        <AdvancedMarker
                            key={(alert as any).id || index}
                            position={{ lat: alert.lat, lng: alert.lng }}
                            onMouseEnter={() => setHoveredAlert(alert)}
                            onMouseLeave={() => setHoveredAlert(null)}
                            onClick={() => onPinClick?.(alert)}
                        >
                            <Pin background="#EF4444" borderColor="#B91C1C" glyphColor="#FFFFFF" />
                        </AdvancedMarker>
                    ))}

                    {/* --- Hovered Alert Info Window --- */}
                    {hoveredAlert && (() => {
                        const category = filterOptions.find(opt => opt.value === hoveredAlert.hazardType);
                        const priorityColor = hoveredAlert.severity === "priority" ? "text-priority" : hoveredAlert.severity === "warning" ? "text-warning" : hoveredAlert.severity === "monitor" ? "text-monitor" : "text-gray-300";
                        const priorityBg = hoveredAlert.severity === "priority" ? "bg-priority/10" : hoveredAlert.severity === "warning" ? "bg-warning/10" : hoveredAlert.severity === "monitor" ? "bg-monitor/10" : "bg-gray-300/10";
                        return (
                            <InfoWindow
                                position={{ lat: hoveredAlert.lat, lng: hoveredAlert.lng }}
                                pixelOffset={[0, -40]}
                                headerDisabled
                            >
                                <div className="flex flex-col gap-2 p-1">
                                    {/* --- Priority Badge --- */}
                                    <span className={`inline-flex items-center gap-1 rounded-full ${priorityBg} px-3 py-1 text-xs font-extrabold ${priorityColor} w-fit`}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>warning</span>
                                        <span className="uppercase">{hoveredAlert.severity}</span>
                                    </span>

                                    {/* --- Category Icon + Title --- */}
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined" style={{ fontSize: 20, color: category?.color }}>{category?.icon ?? "warning"}</span>
                                        <span className="font-semibold text-sm text-gray-900">{hoveredAlert.title}</span>
                                    </div>

                                    {/* --- Divider --- */}
                                    <hr className="border-gray-200" />

                                    {/* --- Location --- */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>place</span>
                                            <span className="text-xs text-gray-500">{hoveredAlert.regionCode}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>gps_fixed</span>
                                            <span className="text-xs text-gray-500">{hoveredAlert.lat.toFixed(4)}, {hoveredAlert.lng.toFixed(4)}</span>
                                        </div>
                                    </div>
                                </div>
                            </InfoWindow>
                        );
                    })()}

                    {/* --- User Location Marker (Blue Pin) --- */}
                    {userLocation && (
                        <AdvancedMarker
                            position={userLocation}
                            onMouseEnter={() => setHoveredUserPin(true)}
                            onMouseLeave={() => setHoveredUserPin(false)}
                        >
                            <Pin background="#3B82F6" borderColor="#1D4ED8" glyphColor="#FFFFFF" />
                        </AdvancedMarker>
                    )}

                    {/* --- Hovered User Location Info Window --- */}
                    {hoveredUserPin && userLocation && (
                        <InfoWindow
                            position={userLocation}
                            pixelOffset={[0, -40]}
                            headerDisabled
                        >
                            <div className="flex items-center gap-1 p-1">
                                <span className="material-symbols-outlined text-primary">person</span>
                                <p className="font-semibold text-sm text-gray-900">Current User Location</p>
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </APIProvider>
        </div>
    );
}