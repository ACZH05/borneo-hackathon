"use client";

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

export default function MapDisplay({ latitude, longitude }: { latitude: number | string, longitude: number | string }) {
  const latNum = 0.5025;
  const lngNum = 117.1539;

  const isLocationValid: boolean = 
    String(latitude).trim() !== "" && 
    String(longitude).trim() !== "" && 
    !isNaN(latNum) && 
    !isNaN(lngNum);

  if (!isLocationValid) {
    return (
      <span>Invalid Location Coordinates</span>
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