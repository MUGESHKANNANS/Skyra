
"use client";

import { useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import { getFarmingRecommendation, FarmingRecommendationOutput } from "@/ai/flows/farming-recommendation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tractor, Leaf, Droplets, Bug, AlertTriangle, CalendarDays, Recycle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const iconMap: { [key: string]: React.ElementType } = {
  cropSuggestions: Leaf,
  irrigationTips: Droplets,
  pestAlerts: Bug,
  weatherRiskAlerts: AlertTriangle,
  farmingCalendar: CalendarDays,
  sustainabilityTips: Recycle,
};

export default function SuggestionsPage() {
  const { weather, activeMember, loading: weatherLoading, hourlyForecast, forecast } = useAppContext();
  const [recommendations, setRecommendations] = useState<FarmingRecommendationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    if (!weather || !activeMember || !forecast) {
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
      const result = await getFarmingRecommendation({
        weatherCondition: weather.description,
        temperature: weather.temp,
        humidity: weather.humidity,
        windSpeed: weather.wind_speed,
        rainChance: hourlyForecast?.[0]?.precipitation || 0,
        uvIndex: weather.uvi,
        forecast: JSON.stringify(forecast),
        location: {
            city: weather.city,
            country: weather.country,
        }
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

  const renderRecommendation = (title: string, Icon: React.ElementType, content: React.ReactNode) => {
    if (!content) return null;
    return (
      <AccordionItem value={title}>
        <AccordionTrigger>
          <div className="flex items-center gap-4">
            <Icon className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">{title}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground prose prose-sm dark:prose-invert">
          {content}
        </AccordionContent>
      </AccordionItem>
    );
  };


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Farming Assistant</h1>
        <p className="text-muted-foreground">
          AI-powered agricultural advice for {" "}
          <span className="font-semibold text-primary">{weather ? `${weather.city}, ${weather.country}` : "your location"}</span> for {" "}
          <span className="font-semibold text-primary">{today}</span>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Your Farming Briefing</CardTitle>
          <CardDescription>Click the button to get AI-powered recommendations for your farm.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center gap-4">
          <Tractor className="w-16 h-16 text-primary" />
          <Button onClick={handleGetSuggestions} disabled={loading || weatherLoading || !activeMember} size="lg">
            {loading ? "Generating..." : "Get Farming Advice"}
          </Button>
          {!activeMember && <p className="text-sm text-muted-foreground">Please add and select a member to get suggestions.</p>}
        </CardContent>
      </Card>
      
      {loading && (
        <Card>
            <CardHeader><CardTitle>Your Farming Companion</CardTitle></CardHeader>
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
            <CardTitle>Your Farming Companion</CardTitle>
            <CardDescription>Here are your personalized farming suggestions for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {renderRecommendation("Crop Suggestions", Leaf, (
                <div>
                  <p className="font-semibold">Best crops to plant this week:</p>
                  <ul className="list-disc pl-5">
                    {recommendations.cropSuggestions?.bestCrops.map((crop, i) => <li key={i}>{crop}</li>)}
                  </ul>
                  <p className="mt-2 font-semibold">Alternative options:</p>
                  <p>{recommendations.cropSuggestions?.alternativeOptions}</p>
                </div>
              ))}
              {renderRecommendation("Irrigation & Watering", Droplets, <p>{recommendations.irrigationTips?.recommendation}</p>)}
              {renderRecommendation("Pest & Disease Alerts", Bug, (
                <div>
                  <p className="font-semibold">Alert:</p>
                  <p>{recommendations.pestAlerts?.alert}</p>
                  <p className="mt-2 font-semibold">Suggested Remedy:</p>
                  <p>{recommendations.pestAlerts?.remedy}</p>
                </div>
              ))}
               {renderRecommendation("Weather Risk Alerts", AlertTriangle, <p>{recommendations.weatherRiskAlerts?.alert}</p>)}
               {renderRecommendation("Farming Calendar", CalendarDays, (
                 <div>
                    <p className="font-semibold">Reminders:</p>
                    <ul className="list-disc pl-5">
                        {recommendations.farmingCalendar?.reminders.map((reminder, i) => <li key={i}>{reminder}</li>)}
                    </ul>
                    <p className="mt-2 font-semibold">Crop Rotation Suggestion:</p>
                    <p>{recommendations.farmingCalendar?.rotationSuggestion}</p>
                 </div>
               ))}
                {renderRecommendation("Sustainability Tips", Recycle, <p>{recommendations.sustainabilityTips?.tip}</p>)}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
