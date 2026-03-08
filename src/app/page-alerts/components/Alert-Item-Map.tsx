"use client";

import { useEffect, useState } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { AlertItemInfo } from "./Alert-Item-Info";
import { filterOptions } from "./Alert-Filter";
import { requestUserLocation } from "@/app/api/permission/route";

interface AlertItemMapProps {
    alerts: AlertItemInfo[];
    activeFilter: string;
    focusedAlert?: AlertItemInfo | null;
    onPinClick?: (alert: AlertItemInfo) => void;
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

    // --- Filter Alerts by Category ---
    const filteredAlerts = alerts.filter((item) =>
        activeFilter === "all" ||
        (activeFilter === "other"
            ? !["flood", "landslide", "tidal"].includes(item.hazardType)
            : item.hazardType === activeFilter)
    );

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