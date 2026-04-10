"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import the MapContent component with SSR disabled
const MapContent = dynamic(
  () => import("./MapContent"),
  { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-full min-h-[300px] bg-slate-800/50 rounded-2xl" />
  }
);

interface MapProps {
  lat: number;
  lon: number;
}

export function Map(props: MapProps) {
  return <MapContent {...props} />;
}
