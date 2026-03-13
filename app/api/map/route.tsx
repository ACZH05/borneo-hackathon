"use client";

import { useEffect } from "react";
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

interface MapDisplayProps {
  latitude: number | string | null;
  longitude: number | string | null;
  onValidityChange?: (isValid: boolean) => void;
}

export default function MapDisplay({ latitude, longitude, onValidityChange }: MapDisplayProps) {

  const hasCoordinates = latitude !== null && longitude !== null;
  const latNum = hasCoordinates ? (typeof latitude === "number" ? latitude : parseFloat(latitude)) : NaN;
  const lngNum = hasCoordinates ? (typeof longitude === "number" ? longitude : parseFloat(longitude)) : NaN;
  const hasMapApiKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_JS_API_KEY);

  const isLocationValid: boolean =
    hasCoordinates &&
    String(latitude).trim() !== "" &&
    String(longitude).trim() !== "" &&
    Number.isFinite(latNum) &&
    Number.isFinite(lngNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180;

  const isMapValid = isLocationValid && hasMapApiKey;

  useEffect(() => {
    onValidityChange?.(isMapValid);
  }, [isMapValid, onValidityChange]);

  if (!hasCoordinates) {
    return (
      <span>Location Not Available</span>
    );
  }

  if (!isLocationValid) {
    return (
      <span>Invalid Location Coordinates</span>
    );
  }

  if (!hasMapApiKey) {
    return (
      <span>Map Service Unavailable</span>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-md">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_JS_API_KEY!}>
        <Map
          defaultCenter={{ lat: latNum, lng: lngNum }} // Center the map on the alert's location.
          defaultZoom={8}                              // Zoom level for a closer view of the alert location.
          mapId="DEMO_MAP_ID"                          // Map ID for the Google Maps instance.
          disableDefaultUI={true}                      // Hide default map controls for a cleaner look.
        >
          {/* --- Map Marker --- */}
          <AdvancedMarker position={{ lat: latNum, lng: lngNum }} />
        </Map>
      </APIProvider>
    </div>
  );
}