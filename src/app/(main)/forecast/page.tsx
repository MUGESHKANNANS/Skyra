
"use client";

import { useAppContext } from "@/contexts/app-context";
import { ForecastCard } from "@/components/forecast-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForecastChart } from "@/components/forecast-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RainChanceChart } from "@/components/rain-chance-chart";

export default function ForecastPage() {
  const { forecast, loading, error, weather, forecastDays, setForecastDays, hourlyForecast } = useAppContext();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{forecastDays}-Day Forecast</h1>
          <p className="text-muted-foreground">
            Weather forecast for {weather ? `${weather.city}, ${weather.country}`: "your location"}.
          </p>
        </div>
        <Tabs value={String(forecastDays)} onValueChange={(value) => setForecastDays(Number(value))} className="w-full sm:w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="5">5 Days</TabsTrigger>
            <TabsTrigger value="10">10 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading && (
          <Card>
            <CardHeader><CardTitle>Temperature Trend</CardTitle></CardHeader>
            <CardContent>
                <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
      )}
      
      {forecast && !loading && (
        <Card>
            <CardHeader><CardTitle>Temperature Trend</CardTitle></CardHeader>
            <CardContent>
                <ForecastChart data={forecast} />
            </CardContent>
        </Card>
      )}
      
      {hourlyForecast && hourlyForecast.length > 0 && !loading && (
        <RainChanceChart data={hourlyForecast} />
      )}


      {error && !loading && <p className="text-destructive">{error}</p>}

      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: forecastDays }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
            ))}
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {forecast && forecast.map((day, index) => (
          <ForecastCard key={index} day={day} />
        ))}
      </div>
    </div>
  );
}
