
"use client";

import { useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import { getWeatherRecommendation, WeatherRecommendationOutput } from "@/ai/flows/weather-recommendation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sun, Wind, AlertTriangle, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const iconMap: { [key: string]: React.ElementType } = {
    sun: Sun,
    mask: Wind,
    alert: AlertTriangle,
};

export default function HealthPage() {
  const { weather, activeMember, loading: weatherLoading, hourlyForecast } = useAppContext();
  const [recommendations, setRecommendations] = useState<WeatherRecommendationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGetAlerts = async () => {
    if (!weather || !activeMember) {
      toast({
        title: "Cannot get suggestions",
        description: "Please ensure you have weather data and an active member selected.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setRecommendations(null);

    try {
      const result = await getWeatherRecommendation({
        weatherCondition: weather.description,
        temperature: weather.temp,
        humidity: weather.humidity,
        windSpeed: weather.wind_speed,
        rainChance: hourlyForecast?.[0]?.precipitation || 0,
        uvIndex: weather.uvi,
        preferences: { ...activeMember.preferences, dress: false, transport: false, agriculture: false }, // Only fetch safety
      });
      // Filter only for safety recommendations
      setRecommendations({ safety: result.safety });
    } catch (error) {
      console.error("Failed to get suggestions:", error);
      toast({
        title: "AI Error",
        description: "Could not generate suggestions. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  const renderSafetyAlerts = (alerts: any[]) => {
    if (!alerts || alerts.length === 0) return <p className="text-muted-foreground">No specific health & safety alerts for today.</p>;
    return (
        <div className="space-y-4">
            {alerts.map((alert, index) => {
                const Icon = iconMap[alert.icon] || AlertTriangle;
                return (
                    <Alert key={index} variant={alert.icon === 'sun' ? "default" : "destructive"}>
                        <Icon className="h-4 w-4" />
                        <AlertTitle>{alert.quick}</AlertTitle>
                        <AlertDescription>{alert.detailed}</AlertDescription>
                    </Alert>
                );
            })}
        </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Health & Safety</h1>
        <p className="text-muted-foreground">
          AI-powered health advice for{" "}
          <span className="font-semibold text-primary">{activeMember ? activeMember.name : ""}</span> at{" "}
          <span className="font-semibold text-primary">{weather ? `${weather.city}, ${weather.country}` : "your location"}</span> for{" "}
          <span className="font-semibold text-primary">{today}</span>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Health & Safety Briefing</CardTitle>
          <CardDescription>Click the button to get AI-powered health alerts for your day.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center gap-4">
            <Heart className="w-16 h-16 text-primary fill-primary" />
            <Button onClick={handleGetAlerts} disabled={loading || weatherLoading || !activeMember} size="lg">
                {loading ? "Generating..." : "Get Health Alerts"}
            </Button>
            {!activeMember && <p className="text-sm text-muted-foreground">Please add and select a member to get suggestions.</p>}
        </CardContent>
      </Card>
      
      {loading && (
        <Card>
            <CardHeader><CardTitle>Your Health & Safety Briefing</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-3/4" />
            </CardContent>
        </Card>
      )}

      {recommendations && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Your Health & Safety Briefing</CardTitle>
            <CardDescription>Here are your personalized health alerts for today.</CardDescription>
          </CardHeader>
          <CardContent>
            {renderSafetyAlerts(recommendations.safety || [])}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
