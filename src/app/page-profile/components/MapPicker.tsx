"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

type MapPickerProps = {
  lat: number | null;
  lng: number | null;
  onPick: (coords: { lat: number; lng: number }) => void;
};

export default function MapPicker({ lat, lng, onPick }: MapPickerProps) {
  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_JS_API_KEY);

  if (!hasApiKey) {
    return <div className="text-sm text-red-500">Map service unavailable.</div>;
  }

  const center =
    lat !== null && lng !== null
      ? { lat, lng }
      : { lat: 3.139, lng: 101.6869 }; // default fallback, e.g. KL

  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden border border-foreground/10">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_JS_API_KEY!}>
        <Map
          defaultCenter={center}
          center={center}
          defaultZoom={15}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapId="DEMO_MAP_ID"
          onClick={(e) => {
            const clickedLat = e.detail.latLng?.lat;
            const clickedLng = e.detail.latLng?.lng;

            if (typeof clickedLat === "number" && typeof clickedLng === "number") {
              onPick({ lat: clickedLat, lng: clickedLng });
            }
          }}
        >
          {lat !== null && lng !== null && (
            <AdvancedMarker position={{ lat, lng }} />
          )}
        </Map>
      </APIProvider>
    </div>
  );
}