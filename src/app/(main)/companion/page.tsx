
"use client";

import { useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import { getWeatherRecommendation, WeatherRecommendationOutput } from "@/ai/flows/weather-recommendation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shirt, Bus, Bike, PersonStanding, Car, AlertTriangle, Sun, Wind, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const iconMap: { [key: string]: React.ElementType } = {
    shirt: Shirt,
    umbrella: AlertTriangle,
    bus: Bus,
    bike: Bike,
    walk: PersonStanding,
    car: Car,
    alert: AlertTriangle,
    sun: Sun,
    mask: Wind,
};

export default function CompanionPage() {
  const { weather, activeMember, loading: weatherLoading, hourlyForecast } = useAppContext();
  const [recommendations, setRecommendations] = useState<WeatherRecommendationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
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
        preferences: activeMember.preferences,
      });
      setRecommendations(result);
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

  const renderRecommendation = (title: string, data: any) => {
    if (!data) return null;
    const Icon = iconMap[data.icon] || Sparkles;
    return (
      <AccordionItem value={title}>
        <AccordionTrigger>
          <div className="flex items-center gap-4">
            <Icon className="h-6 w-6 text-primary" />
            <div className="text-left">
                <span className="text-lg font-semibold">{title}</span>
                <p className="text-sm text-muted-foreground">{data.quick}</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground prose prose-sm dark:prose-invert">
          {data.detailed}
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Companion</h1>
        <p className="text-muted-foreground">
          Personalized AI-powered advice for{" "}
          <span className="font-semibold text-primary">{activeMember ? activeMember.name : ""}</span> at{" "}
          <span className="font-semibold text-primary">{weather ? `${weather.city}, ${weather.country}` : "your location"}</span> for{" "}
          <span className="font-semibold text-primary">{today}</span>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Your Daily Briefing</CardTitle>
          <CardDescription>Click the button to get AI-powered recommendations for your day.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center gap-4">
            <Sparkles className="w-16 h-16 text-primary" />
            <Button onClick={handleGetSuggestions} disabled={loading || weatherLoading || !activeMember} size="lg">
                {loading ? "Generating..." : "Get Daily Companion"}
            </Button>
            {!activeMember && <p className="text-sm text-muted-foreground">Please add and select a member to get suggestions.</p>}
        </CardContent>
      </Card>
      
      {loading && (
        <Card>
            <CardHeader><CardTitle>Your Daily Companion</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
      )}

      {recommendations && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Your Daily Companion</CardTitle>
            <CardDescription>Here are your personalized suggestions for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
                {renderRecommendation("Outfit", recommendations.outfit)}
                {renderRecommendation("Travel", recommendations.travel)}
                {/* Safety alerts are now on their own page */}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
