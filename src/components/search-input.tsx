"use client";

import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useAppContext } from "@/contexts/app-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { autocompleteCity } from "@/ai/flows/autocomplete-city";

export function SearchInput() {
  const { fetchWeatherByCity, getUserLocation } = useAppContext();
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const fetchSuggestions = useDebouncedCallback(async (value) => {
    if (value.length < 3) {
      setSuggestions([]);
      setIsPopoverOpen(false);
      return;
    }
    setLoadingSuggestions(true);
    try {
      // Free Tier optimization: We use the OpenWeatherMap API for autocomplete
      // so it zero-costs your Gemini AI API limits, leaving them strictly for Event Planning!
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=5&appid=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!Array.isArray(data)) throw new Error("Invalid API response");

      // Format city, state, country and remove exact duplicates
      const formattedCities = data.map((item: any) => {
        return item.state ? `${item.name}, ${item.state}, ${item.country}` : `${item.name}, ${item.country}`;
      });
      const uniqueCities = Array.from(new Set(formattedCities)) as string[];

      setSuggestions(uniqueCities);
      setIsPopoverOpen(uniqueCities.length > 0);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
      setIsPopoverOpen(false);
    } finally {
      setLoadingSuggestions(false);
    }
  }, 500);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    fetchSuggestions(value);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setCity(suggestion);
    setSuggestions([]);
    setIsPopoverOpen(false);
    fetchWeatherByCity(suggestion);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city) {
      fetchSuggestions.cancel();
      setIsPopoverOpen(false);
      fetchWeatherByCity(city);
    }
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a city..."
              className="pl-10"
              value={city}
              onChange={handleInputChange}
              autoComplete="off"
            />
          </div>
        </PopoverTrigger>
        <Button type="submit" size="icon" aria-label="Search">
          <Search className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={getUserLocation}
          aria-label="Use current location"
        >
          <MapPin className="h-5 w-5" />
        </Button>
      </form>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        {loadingSuggestions && (
            <div className="p-2 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        )}
        {!loadingSuggestions && suggestions.length > 0 && (
          <div className="flex flex-col">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left p-2 hover:bg-accent"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
