
import type { Weather } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherIcon } from "./weather-icon";
import { Droplets, Wind, Waves, Sun, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

interface CurrentWeatherProps {
  weather: Weather;
}

export function CurrentWeather({ weather }: CurrentWeatherProps) {
    const [time, setTime] = useState("");

    useEffect(() => {
        const date = new Date();
        setTime(date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
        
        const interval = setInterval(() => {
            const date = new Date();
            setTime(date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
        }, 60000);

        return () => clearInterval(interval);
    }, []);

  return (
    <Card className="bg-primary text-primary-foreground">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-6 w-6" />
                    <span>{weather.city}, {weather.country}</span>
                </CardTitle>
                <p className="text-sm text-primary-foreground/80 mt-1">Current Weather</p>
            </div>
            <span className="text-lg font-semibold">{time}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <WeatherIcon iconCode={weather.icon} className="w-24 h-24" />
            <div>
                <p className="text-7xl font-bold">{Math.round(weather.temp)}°C</p>
                <p className="capitalize text-xl">{weather.description}</p>
            </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-center">
            <div className="flex flex-col items-center justify-center">
                <Waves className="w-6 h-6 mb-2" />
                <p className="text-lg font-semibold">{Math.round(weather.feels_like)}°C</p>
                <p className="text-sm">Feels Like</p>
            </div>
            <div className="flex flex-col items-center justify-center">
                <Droplets className="w-6 h-6 mb-2" />
                <p className="text-lg font-semibold">{weather.humidity}%</p>
                <p className="text-sm">Humidity</p>
            </div>
            <div className="flex flex-col items-center justify-center">
                <Wind className="w-6 h-6 mb-2" />
                <p className="text-lg font-semibold">{weather.wind_speed.toFixed(1)} km/h</p>
                <p className="text-sm">Wind</p>
            </div>
             <div className="flex flex-col items-center justify-center">
                <Sun className="w-6 h-6 mb-2" />
                <p className="text-lg font-semibold">{weather.uvi || 'N/A'}</p>
                <p className="text-sm">UV Index</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
