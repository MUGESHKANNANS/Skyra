
import type { Forecast } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherIcon } from "./weather-icon";
import { ArrowUp, ArrowDown } from "lucide-react";

interface ForecastCardProps {
  day: Forecast;
}

export function ForecastCard({ day }: ForecastCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-grow">
        <CardTitle className="text-lg">{day.day}</CardTitle>
        <p className="text-sm text-muted-foreground">{new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center gap-2">
        <WeatherIcon iconCode={day.icon} className="w-20 h-20" />
        <p className="capitalize text-muted-foreground">{day.description}</p>
        <div className="flex gap-4">
            <div className="flex items-center gap-1">
                <ArrowUp className="w-4 h-4 text-destructive" />
                <span>{Math.round(day.temp_max)}°C</span>
            </div>
            <div className="flex items-center gap-1">
                <ArrowDown className="w-4 h-4 text-blue-400" />
                <span>{Math.round(day.temp_min)}°C</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
