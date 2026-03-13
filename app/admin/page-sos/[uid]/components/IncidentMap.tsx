"use client";

import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

type IncidentMapProps = {
  lat: number | null;
  lng: number | null;
};

function IncidentMap({ lat, lng }: IncidentMapProps) {
  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_JS_API_KEY);
  const hasValidCoordinates =
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    typeof lng === "number" &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180;

  if (!hasValidCoordinates) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-primary/5 text-sm text-textGrey">
        User location is unavailable.
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl bg-primary/5 text-sm text-textGrey">
        Map service unavailable.
      </div>
    );
  }

  const center = { lat, lng };

  return (
    <div className="h-full w-full overflow-hidden rounded-xl">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_JS_API_KEY!}>
        <Map
          center={center}
          defaultCenter={center}
          defaultZoom={15}
          mapId="DEMO_MAP_ID"
          disableDefaultUI={false}
        >
          <AdvancedMarker position={center}>
            <Pin background="#EF4444" borderColor="#B91C1C" glyphColor="#FFFFFF" />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}

export default IncidentMap;
