"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet icon not showing up nicely in Webpack
const iconMerge = {
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
};
L.Icon.Default.mergeOptions(iconMerge);

interface MapContentProps {
  lat: number;
  lon: number;
}

export default function MapContent({ lat, lon }: MapContentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Prevent re-initialization on strict mode double-mounts
    if (mapInstanceRef.current !== null) return;
    if (!mapContainerRef.current) return;

    // Initialize the map
    const map = L.map(mapContainerRef.current).setView([lat, lon], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([lat, lon])
      .addTo(map)
      .bindPopup('Selected Location');

    mapInstanceRef.current = map;

    return () => {
      // Safely destroy map on true unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Update map view if lat/lon change dynamically
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], mapInstanceRef.current.getZoom());
    }
  }, [lat, lon]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative z-0">
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
