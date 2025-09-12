import type { Weather } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherIcon } from "./weather-icon";
import { Droplets, Wind, Thermometer } from "lucide-react";

interface WeatherCardProps {
  weather: Weather;
}

export function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl">{weather.city}, {weather.country}</CardTitle>
                <p className="text-muted-foreground capitalize">{weather.description}</p>
            </div>
            <div className="text-right">
                <WeatherIcon iconCode={weather.icon} className="w-16 h-16 -mt-4" />
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                <p className="text-4xl font-bold">{Math.round(weather.temp)}°C</p>
                <p className="text-sm text-muted-foreground">Temperature</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                <Thermometer className="w-6 h-6 mb-2 text-primary" />
                <p className="text-lg font-semibold">{Math.round(weather.feels_like)}°C</p>
                <p className="text-sm text-muted-foreground">Feels Like</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                <Droplets className="w-6 h-6 mb-2 text-primary" />
                <p className="text-lg font-semibold">{weather.humidity}%</p>
                <p className="text-sm text-muted-foreground">Humidity</p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                <Wind className="w-6 h-6 mb-2 text-primary" />
                <p className="text-lg font-semibold">{weather.wind_speed.toFixed(1)} km/h</p>
                <p className="text-sm text-muted-foreground">Wind Speed</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
