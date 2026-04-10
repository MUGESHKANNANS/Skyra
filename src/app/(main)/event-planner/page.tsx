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
import { Lightbulb, Utensils, Car, Umbrella, CalendarCheck, Building, MessageSquare, AlertCircle, Clock, Sun, Home, Wind, CloudRain, Sunrise, Sunset, Thermometer, Sparkles, MapPin, Calendar as CalendarIcon, Navigation, Edit3, Music } from 'lucide-react';
import { HourlyForecastChart } from "@/components/hourly-forecast-chart";

export default function EventPlannerPage() {
  const { weather, location, loading: weatherLoading, hourlyForecast, forecast } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [plan, setPlan] = useState<EventPlannerOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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
        const formattedDate = format(selectedDate, 'yyyy-MM-dd', { locale: enIN });
        const dayForecast = forecast?.find(f => f.date === formattedDate);
        
        // Create a highly optimized, single-day forecast snapshot to keep token counts extremely low for free tier.
        const simplifiedForecast = {
            temp_max: dayForecast?.temp_max ?? weather.temp + 2,
            temp_min: dayForecast?.temp_min ?? weather.temp - 2,
            description: dayForecast?.description ?? weather.description,
            wind_speed: weather.wind_speed,
            precipitation_chance: hourlyForecast && hourlyForecast.length > 0 ? hourlyForecast[0].precipitation : 0
        };

        const result = await getEventPlan({
            date: formattedDate,
            location: { city: weather.city, country: weather.country },
            forecast: JSON.stringify(simplifiedForecast),
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
    <div className="flex flex-col lg:flex-row gap-8 relative min-h-[calc(100vh-4rem)]">
      
      {/* BACKGROUND DECORATIONS */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      {/* LEFT PANEL : Inputs */}
      <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0">
        <div className="sticky top-4 space-y-6">
            
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent pb-1">Event Planner</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Let AI analyze the weather and design the perfect event experience, fully tailored to your chosen location and date.
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-background/60 backdrop-blur-xl border shadow-xl shadow-primary/5 p-6 space-y-8">
            <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

            {/* Date Selection */}
            <div className="space-y-3 relative">
                <div className="flex items-center gap-2 font-semibold text-lg text-foreground/90">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <span>When is it happening?</span>
                </div>
                <div className="rounded-2xl border bg-card/50 overflow-hidden flex justify-center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="bg-transparent pointer-events-auto"
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                        initialFocus
                        today={new Date()}
                    />
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Location Selection */}
            <div className="space-y-3 relative">
                <div className="flex items-center gap-2 font-semibold text-lg text-foreground/90">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>Where are we going?</span>
                </div>
                <div className="space-y-3">
                    <SearchInput />
                    <div className="w-full h-[180px] rounded-2xl overflow-hidden border bg-muted/50 relative shadow-inner">
                        {location ? <MapView center={location} /> : (
                            <div className="flex h-full items-center justify-center text-muted-foreground bg-muted/20 backdrop-blur-sm">
                                <Navigation className="w-8 h-8 opacity-20 animate-pulse" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Notes */}
            <div className="space-y-3 relative">
                <div className="flex items-center gap-2 font-semibold text-lg text-foreground/90">
                    <Edit3 className="w-5 h-5 text-primary" />
                    <span>Any special requests?</span>
                </div>
                <Textarea
                    placeholder="e.g., Birthday party for John, expecting 20 guests, mostly outdoor vibe..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] resize-none rounded-2xl bg-card/50 border-white/10 focus-visible:ring-primary/50"
                />
            </div>

            <Button 
                onClick={handleGetPlan} 
                disabled={loading || weatherLoading || !selectedDate || !location} 
                size="lg" 
                className="w-full rounded-full py-6 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 animate-spin" />
                        Crafting your masterpiece...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Generate AI Event Plan
                    </span>
                )}
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL : AI Results */}
      <div className="flex-1 w-full min-w-0 pb-10">
        {!plan && !loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-3xl bg-muted/10 opacity-60">
                <div className="p-6 bg-primary/10 rounded-full mb-6 relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                    <Music className="w-12 h-12 text-primary/80" />
                </div>
                <h3 className="text-2xl font-bold text-foreground/70 mb-2">Ready to plan?</h3>
                <p className="text-muted-foreground max-w-md">
                    Fill in the details on the left and let our AI analyze the perfect timing, themes, and backups for your event based on live weather data.
                </p>
            </div>
        )}

        {loading && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                <Skeleton className="h-[220px] w-full rounded-3xl bg-primary/5" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-[250px] w-full rounded-3xl bg-primary/5" />
                    <Skeleton className="h-[250px] w-full rounded-3xl bg-primary/5" />
                </div>
                <Skeleton className="h-[300px] w-full rounded-3xl bg-primary/5" />
            </div>
        )}

        {plan && !loading && weather && hourlyForecast && forecast && (
            <div className="space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
                
                {/* Weather Overview */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/20 p-6 backdrop-blur-md shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="flex items-center gap-2 mb-6">
                        <Thermometer className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold">Weather Intelligence</h2>
                        <span className="ml-auto text-sm font-medium bg-background/50 px-4 py-1.5 rounded-full border">
                            {selectedDate ? format(selectedDate, 'PP', { locale: enIN }) : ''}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                        <div className="flex flex-col items-center justify-center p-4 bg-background/60 backdrop-blur-md rounded-2xl border shadow-sm transition-transform hover:-translate-y-1">
                            <Thermometer className="w-6 h-6 mb-3 text-rose-500" />
                            <p className="text-xl font-bold">
                                {Math.round(forecast.find(f => f.date === format(selectedDate!, 'yyyy-MM-dd'))?.temp_min || forecast[0].temp_min)}°
                                <span className="text-muted-foreground mx-1 text-sm">-</span>
                                {Math.round(forecast.find(f => f.date === format(selectedDate!, 'yyyy-MM-dd'))?.temp_max || forecast[0].temp_max)}°
                            </p>
                            <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">Temperature</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-background/60 backdrop-blur-md rounded-2xl border shadow-sm transition-transform hover:-translate-y-1">
                            <CloudRain className="w-6 h-6 mb-3 text-blue-500" />
                            <p className="text-xl font-bold">{hourlyForecast[0].precipitation}%</p>
                            <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">Rain Risk</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-background/60 backdrop-blur-md rounded-2xl border shadow-sm transition-transform hover:-translate-y-1">
                            <Wind className="w-6 h-6 mb-3 text-teal-500" />
                            <p className="text-xl font-bold">{Math.round(weather.wind_speed)} <span className="text-sm font-medium">km/h</span></p>
                            <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">Wind</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 bg-background/60 backdrop-blur-md rounded-2xl border shadow-sm transition-transform hover:-translate-y-1">
                            <div className="flex gap-1 mb-3">
                                <Sunrise className="w-6 h-6 text-orange-400" />
                                <Sunset className="w-6 h-6 text-purple-400" />
                            </div>
                            <p className="text-sm font-bold truncate w-full text-center">
                                {new Date(weather.sunrise * 1000).toLocaleTimeString('en-IN', {hour: 'numeric', minute:'2-digit'})}
                                <br />
                                <span className="text-muted-foreground font-normal">to</span>
                                <br />
                                {new Date(weather.sunset * 1000).toLocaleTimeString('en-IN', {hour: 'numeric', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Suitability */}
                    <Card className="rounded-3xl border shadow-lg bg-card/80 backdrop-blur-lg overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Lightbulb className="w-6 h-6 text-yellow-500" /> Recommended Vibe
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10">
                            <div className="flex items-start gap-4">
                                <div className="p-4 bg-primary/10 rounded-2xl shrink-0 shadow-inner">
                                    {plan.eventSuitability.recommendation === 'Outdoor' ? <Sun className="w-8 h-8 text-orange-500" /> : <Home className="w-8 h-8 text-blue-500" />}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-extrabold text-2xl text-foreground/90">{plan.eventSuitability.recommendation}</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{plan.eventSuitability.reasoning}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-white/5">
                                <Clock className="w-8 h-8 text-primary/70 shrink-0" />
                                <div>
                                    <p className="font-bold text-lg">{plan.eventSuitability.bestTimeSlot}</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Optimal Timing</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Suggestions */}
                    <Card className="rounded-3xl border shadow-lg bg-card/80 backdrop-blur-lg overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Sparkles className="w-6 h-6 text-purple-500" /> Smart Suggestions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 relative z-10">
                            <div className="flex items-start gap-4 p-3 hover:bg-muted/30 rounded-xl transition-colors">
                                <div className="p-3 bg-secondary/80 rounded-xl text-secondary-foreground shadow-sm">
                                    <Umbrella className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Dress Code</p>
                                    <p className="text-sm text-muted-foreground">{plan.smartSuggestions.dressCode}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 hover:bg-muted/30 rounded-xl transition-colors">
                                <div className="p-3 bg-secondary/80 rounded-xl text-secondary-foreground shadow-sm">
                                    <Utensils className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Refreshments</p>
                                    <p className="text-sm text-muted-foreground">{plan.smartSuggestions.foodAndDrink}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-3 hover:bg-muted/30 rounded-xl transition-colors">
                                <div className="p-3 bg-secondary/80 rounded-xl text-secondary-foreground shadow-sm">
                                    <Car className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Logistics</p>
                                    <p className="text-sm text-muted-foreground">{plan.smartSuggestions.travelMode}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Backup Plan */}
                    <Card className="rounded-3xl border shadow-lg bg-card/80 backdrop-blur-lg overflow-hidden md:col-span-1 border-orange-500/10">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Building className="w-6 h-6 text-orange-500" /> Plan B
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {plan.backupOptions.alternativeDate && 
                                <div className="p-4 bg-muted/40 rounded-2xl flex items-start gap-4 border border-white/5">
                                    <CalendarCheck className="w-6 h-6 text-muted-foreground shrink-0 mt-0.5 opacity-60" />
                                    <div>
                                        <p className="font-bold text-sm">Alternative Date</p>
                                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{plan.backupOptions.alternativeDate}</p>
                                    </div>
                                </div>
                            }
                            <div className="p-4 bg-muted/40 rounded-2xl flex items-start gap-4 border border-white/5">
                                <Home className="w-6 h-6 text-muted-foreground shrink-0 mt-0.5 opacity-60" />
                                <div>
                                    <p className="font-bold text-sm">Venue Alternative</p>
                                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{plan.backupOptions.venueType}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reminders & Notes */}
                    <Card className="rounded-3xl border shadow-lg bg-card/80 backdrop-blur-lg overflow-hidden md:col-span-1 border-rose-500/10">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <AlertCircle className="w-6 h-6 text-rose-500" /> Reminders
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {plan.aiReminders.map((reminder, i) => 
                                <li key={i} className="flex items-start gap-3 p-3 bg-rose-500/5 hover:bg-rose-500/10 transition-colors rounded-xl border border-rose-500/10 text-rose-600 dark:text-rose-400">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-80"/> 
                                    <span className="text-sm font-medium leading-relaxed">{reminder}</span>
                                </li>)}
                            </ul>
                            {notes && (
                                <div className="mt-6 pt-5 border-t border-border/50">
                                    <h4 className="font-bold flex items-center gap-2 text-foreground/80"><MessageSquare size={16} /> Original Request</h4>
                                    <p className="mt-2 text-sm text-muted-foreground italic bg-muted/30 p-4 rounded-xl border-l-4 border-l-primary leading-relaxed">{notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Hourly Forecast */}
                <div className="rounded-3xl border shadow-xl bg-card/80 backdrop-blur-lg overflow-hidden p-6 relative group">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                        <Clock className="w-6 h-6 text-primary" /> Hourly Breakdown
                    </h3>
                    <div className="h-[280px] w-full relative z-10">
                        <HourlyForecastChart data={hourlyForecast} />
                    </div>
                </div>

            </div>
        )}
      </div>
    </div>
  );
}
