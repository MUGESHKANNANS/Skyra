
"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/app-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { SearchInput } from "@/components/search-input";
import { MapView } from "@/components/map-view";
import { useToast } from "@/hooks/use-toast";
import { getEventPlan, EventPlannerOutput } from "@/ai/flows/event-planner";
import { format } from 'date-fns';
import { enIN } from 'date-fns/locale';
import { Lightbulb, Utensils, Car, Umbrella, CalendarCheck, Building, MessageSquare, AlertCircle, Clock, Sun, Home, Wind, CloudRain, Sunrise, Sunset, Thermometer, Sparkles } from 'lucide-react';
import { HourlyForecastChart } from "@/components/hourly-forecast-chart";
import { SunriseSunsetCard } from "@/components/sunrise-sunset-card";
import { RainChanceChart } from "@/components/rain-chance-chart";

export default function EventPlannerPage() {
  const { weather, location, loading: weatherLoading, hourlyForecast, forecast } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [plan, setPlan] = useState<EventPlannerOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs once on the client, preventing hydration mismatch
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedDate(today);
  }, []);


  const handleGetPlan = async () => {
    if (!weather || !selectedDate) {
      toast({
        title: "Missing Information",
        description: "Please select a date and location.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPlan(null);

    try {
        const forecastForDay = { // Simplified forecast for the prompt
            temp_max: weather.temp + 2,
            temp_min: weather.temp - 2,
            description: weather.description,
            wind_speed: weather.wind_speed,
            humidity: weather.humidity,
        };

        const result = await getEventPlan({
            date: format(selectedDate, 'yyyy-MM-dd', { locale: enIN }),
            location: { city: weather.city, country: weather.country },
            forecast: JSON.stringify(forecast),
            userNotes: notes,
        });
        setPlan(result);
    } catch (error) {
        console.error("Failed to get event plan:", error);
        toast({
            title: "AI Error",
            description: "Could not generate the event plan. Please try again.",
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Planner</h1>
        <p className="text-muted-foreground">
          Let AI help you plan the perfect event based on the weather.
        </p>
      </div>
      
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Card>
              <CardHeader>
                  <CardTitle>1. Pick a Date</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                  <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                      initialFocus
                      today={new Date()}
                  />
              </CardContent>
          </Card>
          <Card className="flex flex-col h-full">
              <CardHeader>
                  <CardTitle>2. Pick a Location</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow gap-4">
                  <SearchInput />
                  <div className="flex-grow w-full min-h-[250px] rounded-lg overflow-hidden">
                    {location ? <MapView center={location} /> : <Skeleton className="h-full w-full" />}
                  </div>
              </CardContent>
          </Card>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>3. Add Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder="e.g., Birthday party for John, expecting 20 guests..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>4. Generate Your Plan</CardTitle>
                <CardDescription>Click the button to get AI-powered recommendations for your event.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <Button onClick={handleGetPlan} disabled={loading || weatherLoading || !selectedDate || !location} size="lg">
                    {loading ? "Planning Your Event..." : "Plan My Event"}
                </Button>
            </CardContent>
        </Card>

        {loading && (
            <Card>
                <CardHeader><CardTitle>Your Event Plan</CardTitle></CardHeader>
                <CardContent className="space-y-4 p-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-3/4" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        )}

        {plan && !loading && weather && hourlyForecast && forecast && (
            <div className="flex flex-col gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Weather Forecast for {selectedDate ? format(selectedDate, 'PPP', { locale: enIN }) : ''}</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                                <Thermometer className="w-6 h-6 mb-2 text-primary" />
                                <p className="text-lg font-semibold">{Math.round(forecast[0].temp_min)}°C - {Math.round(forecast[0].temp_max)}°C</p>
                                <p className="text-sm text-muted-foreground">Temperature</p>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                                <CloudRain className="w-6 h-6 mb-2 text-primary" />
                                <p className="text-lg font-semibold">{hourlyForecast[0].precipitation}%</p>
                                <p className="text-sm text-muted-foreground">Rain Chance</p>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                                <Wind className="w-6 h-6 mb-2 text-primary" />
                                <p className="text-lg font-semibold">{weather.wind_speed.toFixed(1)} km/h</p>
                                <p className="text-sm text-muted-foreground">Wind</p>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                                <div className="flex gap-2">
                                    <Sunrise className="w-6 h-6 mb-2 text-primary" />
                                    <Sunset className="w-6 h-6 mb-2 text-primary" />
                                </div>
                                <p className="text-lg font-semibold">{new Date(weather.sunrise * 1000).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})} - {new Date(weather.sunset * 1000).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}</p>
                                <p className="text-sm text-muted-foreground">Sunrise & Sunset</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Hourly Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <HourlyForecastChart data={hourlyForecast} />
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Lightbulb className="w-6 h-6 text-primary" /> Event Suitability</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                                {plan.eventSuitability.recommendation === 'Outdoor' ? <Sun className="w-8 h-8 text-primary" /> : <Home className="w-8 h-8 text-primary" />}
                                <div>
                                    <p className="font-bold text-lg">{plan.eventSuitability.recommendation}</p>
                                    <p className="text-sm">{plan.eventSuitability.reasoning}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                                <Clock className="w-8 h-8 text-primary" />
                                <div>
                                    <p className="font-bold text-lg">{plan.eventSuitability.bestTimeSlot}</p>
                                    <p className="text-sm text-muted-foreground">Is the best time for your event.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader>
                             <CardTitle className="flex items-center gap-2"><Sparkles className="w-6 h-6 text-primary" /> Smart Suggestions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex items-start gap-4">
                                <div className="p-3 bg-muted rounded-full"><Umbrella className="w-5 h-5 text-primary" /></div>
                                <div>
                                    <p className="font-semibold">Dress Code</p>
                                    <p className="text-sm text-muted-foreground">{plan.smartSuggestions.dressCode}</p>
                                </div>
                           </div>
                           <div className="flex items-start gap-4">
                                <div className="p-3 bg-muted rounded-full"><Utensils className="w-5 h-5 text-primary" /></div>
                                <div>
                                    <p className="font-semibold">Food & Drink</p>
                                    <p className="text-sm text-muted-foreground">{plan.smartSuggestions.foodAndDrink}</p>
                                </div>
                           </div>
                           <div className="flex items-start gap-4">
                                <div className="p-3 bg-muted rounded-full"><Car className="w-5 h-5 text-primary" /></div>
                                <div>
                                    <p className="font-semibold">Travel Mode</p>
                                    <p className="text-sm text-muted-foreground">{plan.smartSuggestions.travelMode}</p>
                                </div>
                           </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Building className="w-6 h-6 text-primary" /> Backup Options</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {plan.backupOptions.alternativeDate && 
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-muted rounded-full"><CalendarCheck className="w-5 h-5 text-primary" /></div>
                                    <div>
                                        <p className="font-semibold">Alternative Date</p>
                                        <p className="text-sm text-muted-foreground">{plan.backupOptions.alternativeDate}</p>
                                    </div>
                                </div>
                            }
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-muted rounded-full"><Building className="w-5 h-5 text-primary" /></div>
                                <div>
                                    <p className="font-semibold">Venue Type</p>
                                    <p className="text-sm text-muted-foreground">{plan.backupOptions.venueType}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><AlertCircle className="w-6 h-6 text-primary" /> Reminders & Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h4 className="font-semibold mb-2">AI Reminders</h4>
                             <ul className="space-y-2">
                                {plan.aiReminders.map((reminder, i) => 
                                <li key={i} className="flex items-start gap-3">
                                    <AlertCircle className="w-4 h-4 mt-1 text-primary"/> 
                                    <span className="text-sm text-muted-foreground">{reminder}</span>
                                </li>)}
                            </ul>
                            {notes && <div className="mt-4 pt-4 border-t">
                                <h4 className="font-semibold flex items-center gap-2"><MessageSquare size={16} /> Your Notes:</h4>
                                <p className="mt-2 text-sm text-muted-foreground">{notes}</p>
                            </div>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
