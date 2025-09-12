"use client";

import { MainSidebar } from "@/components/main-sidebar";
import { APIProvider } from "@vis.gl/react-google-maps";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <div className="flex min-h-screen bg-background text-foreground">
        <MainSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto h-screen">
          {children}
        </main>
      </div>
    </APIProvider>
  );
}
