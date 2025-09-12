
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Sunrise, Sunset } from "lucide-react";
import { useState, useEffect } from 'react';

interface SunriseSunsetCardProps {
  sunrise: number;
  sunset: number;
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function SunriseSunsetCard({ sunrise, sunset }: SunriseSunsetCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const sunriseTime = sunrise * 1000;
  const sunsetTime = sunset * 1000;
  const now = currentTime.getTime();

  const totalDaylight = sunsetTime - sunriseTime;
  let progress = 0;
  if (totalDaylight > 0) {
    progress = Math.max(0, Math.min(1, (now - sunriseTime) / totalDaylight));
  }
  
  const sunAngle = progress * 180; // Angle in degrees from 0 to 180
  const sunX = 150 - Math.cos(sunAngle * Math.PI / 180) * 120;
  const sunY = 130 - Math.sin(sunAngle * Math.PI / 180) * 120;
  
  const arcPath = `M 30 130 A 120 120 0 0 1 270 130`;
  const circumference = Math.PI * 120;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sunrise & Sunset</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-40 lg:h-32 w-full flex items-center justify-center">
            <svg viewBox="0 0 300 150" className="w-full h-auto overflow-visible">
                 <defs>
                    <linearGradient id="sun-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.05 }} />
                    </linearGradient>
                    <clipPath id="arc-clip">
                         <path d={`M 30 130 A 120 120 0 0 1 ${sunX} ${sunY} L ${sunX} 130 L 30 130 Z`} />
                    </clipPath>
                 </defs>
                 <path
                    d={arcPath + ' L 270 130 L 30 130 Z'}
                    fill="url(#sun-gradient)"
                    clipPath="url(#arc-clip)"
                />

                {/* Arc for elapsed time (solid) */}
                <path
                    d={arcPath}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                        strokeDasharray: `${circumference * progress}, ${circumference * (1-progress)}`,
                    }}
                />
                
                {/* Arc for remaining time (dashed) */}
                <path
                    d={arcPath}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="4, 6"
                     style={{
                        strokeDashoffset: `-${circumference * progress}`
                    }}
                />
                
                {/* Sun icon */}
                {now > sunriseTime && now < sunsetTime && (
                  <g transform={`translate(${sunX}, ${sunY})`}>
                      <Sun className="h-6 w-6 text-primary fill-primary" style={{transform: "translate(-12px, -12px)"}} />
                  </g>
                )}

                 {/* Start and end points */}
                <circle cx="30" cy="130" r="4" fill="hsl(var(--primary))" />
                <circle cx="270" cy="130" r="4" fill="hsl(var(--primary))" />
            </svg>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sunrise className="w-6 h-6 text-primary" />
            <div>
              <p className="text-sm">Sunrise</p>
              <p className="font-semibold">{formatTime(sunrise)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm">Sunset</p>
              <p className="font-semibold">{formatTime(sunset)}</p>
            </div>
            <Sunset className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
