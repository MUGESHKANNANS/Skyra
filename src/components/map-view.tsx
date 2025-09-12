"use client";

import { Map, Marker } from "@vis.gl/react-google-maps";

interface MapViewProps {
  center: {
    lat: number;
    lon: number;
  };
}

export function MapView({ center }: MapViewProps) {
  const position = { lat: center.lat, lng: center.lon };
  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <Map
        center={position}
        zoom={10}
        mapId="skyra-map"
        disableDefaultUI={true}
        gestureHandling="cooperative"
      >
        <Marker position={position} />
      </Map>
    </div>
  );
}
