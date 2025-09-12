
"use client";

import { useAppContext } from "@/contexts/app-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SearchInput } from "@/components/search-input";
import { MapView } from "@/components/map-view";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrentWeather } from "@/components/current-weather";
import { ForecastCard } from "@/components/forecast-card";
import { Button } from "@/components/ui/button";
import { HourlyForecastChart } from "@/components/hourly-forecast-chart";
import { SunriseSunsetCard } from "@/components/sunrise-sunset-card";
import { RainChanceChart } from "@/components/rain-chance-chart";

export default function HomePage() {
  const { weather, forecast, hourlyForecast, loading, error, location, fetchWeatherByCity } = useAppContext();

  const suggestion = error?.startsWith("City not found. Did you mean ") ? error.split("Did you mean ")[1].replace("?", "") : null;
  
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Skyra, your personal weather assistant.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <SearchInput />
        {loading && (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        )}
        {error && !loading && (
           <Card>
            <CardHeader><CardTitle>Error</CardTitle></CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
              {suggestion && (
                <div className="mt-4">
                  <Button onClick={() => fetchWeatherByCity(suggestion)}>
                    Search for {suggestion}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {weather && !loading && <CurrentWeather weather={weather} />}
        
        {hourlyForecast && hourlyForecast.length > 0 && !loading && (
          <Card>
            <CardHeader>
              <CardTitle>Hourly Forecast</CardTitle>
              <CardDescription>{today}</CardDescription>
            </CardHeader>
            <CardContent>
              <HourlyForecastChart data={hourlyForecast} />
            </CardContent>
          </Card>
        )}
        
        <div className="grid gap-6 md:grid-cols-2">
          {weather && !loading && <SunriseSunsetCard sunrise={weather.sunrise} sunset={weather.sunset} />}
          {hourlyForecast && hourlyForecast.length > 0 && !loading && <RainChanceChart data={hourlyForecast} />}
        </div>
        
        {forecast && !loading && (
          <Card>
            <CardHeader>
              <CardTitle>5-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {forecast.slice(0, 5).map((day, index) => (
                <ForecastCard key={index} day={day} />
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] w-full">
            {location ? (
              <MapView center={location} />
            ) : (
              <Skeleton className="h-full w-full" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
