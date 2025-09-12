
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Member, Weather, Forecast, HourlyForecast } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { suggestCity } from '@/ai/flows/suggest-city';

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

interface AppContextType {
  members: Member[];
  activeMember: Member | null;
  addMember: (name: string) => void;
  updateMemberPreferences: (memberId: string, preferences: Member['preferences']) => void;
  setActiveMemberId: (id: string | null) => void;
  deleteMember: (id: string) => void;
  weather: Weather | null;
  forecast: Forecast[] | null;
  hourlyForecast: HourlyForecast[] | null;
  loading: boolean;
  error: string | null;
  fetchWeatherByCity: (city: string) => Promise<void>;
  fetchWeatherByCoords: (lat: number, lon: number) => Promise<void>;
  getUserLocation: () => void;
  location: { lat: number; lon: number } | null;
  forecastDays: number;
  setForecastDays: (days: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useLocalStorage<Member[]>('skyra-members', []);
  const [activeMemberId, setActiveMemberId] = useLocalStorage<string | null>('skyra-active-member', null);
  
  const [weather, setWeather] = useState<Weather | null>(null);
  const [forecast, setForecast] = useState<Forecast[] | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[] | null>(null);
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [forecastDays, setForecastDays] = useState(5);

  const activeMember = members.find(m => m.id === activeMemberId) || null;

  const addMember = (name: string) => {
    const newMember: Member = {
      id: crypto.randomUUID(),
      name,
      preferences: { agriculture: false, dress: true, transport: true },
    };
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    if (!activeMemberId) {
      setActiveMemberId(newMember.id);
    }
  };

  const updateMemberPreferences = (memberId: string, preferences: Member['preferences']) => {
    setMembers(members.map(m => m.id === memberId ? { ...m, preferences } : m));
  };
  
  const deleteMember = (id: string) => {
    const updatedMembers = members.filter(m => m.id !== id);
    setMembers(updatedMembers);
    if (activeMemberId === id) {
      setActiveMemberId(updatedMembers.length > 0 ? updatedMembers[0].id : null);
    }
  };

  const fetchUVI = async (lat: number, lon: number) => {
    try {
      const uviUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
      const uviResponse = await fetch(uviUrl);
      const uviData = await uviResponse.json();
      return uviData.value;
    } catch (err) {
      console.error("Failed to fetch UVI data", err);
      return undefined;
    }
  }

  const fetchWeatherData = useCallback(async (url: string, originalCityQuery?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod !== 200 && data.cod !== "200") {
        if ((data.cod === "404" || data.cod === 404) && originalCityQuery) {
          try {
            const suggestion = await suggestCity({ userInput: originalCityQuery });
            if (suggestion.suggestedCity.toLowerCase() !== originalCityQuery.toLowerCase()) {
              throw new Error(`City not found. Did you mean ${suggestion.suggestedCity}?`);
            }
          } catch(aiError: any) {
             throw new Error(aiError.message || 'City not found.');
          }
        }
        throw new Error(data.message || 'Failed to fetch weather data');
      }
      
      const uvi = await fetchUVI(data.coord.lat, data.coord.lon);

      const newWeather: Weather = {
        city: data.name,
        country: data.sys.country,
        temp: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed * 3.6, // m/s to km/h
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        cod: data.cod,
        coord: data.coord,
        uvi: uvi,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
      };
      setWeather(newWeather);
      setLocation(newWeather.coord);
      await fetchForecastData(newWeather.coord.lat, newWeather.coord.lon, forecastDays);
    } catch (err: any) {
      setError(err.message);
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  }, [forecastDays]);

  const fetchForecastData = useCallback(async (lat: number, lon: number, days: number) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.cod !== "200") {
        throw new Error(data.message || 'Failed to fetch forecast data');
      }
      
      const newHourlyForecast: HourlyForecast[] = data.list.slice(0, 8).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true }),
        temp: Math.round(item.main.temp),
        precipitation: Math.round(item.pop * 100),
        wind: Math.round(item.wind.speed * 3.6),
      }));
      setHourlyForecast(newHourlyForecast);
      
      const dailyData = data.list.reduce((acc: any, item: any) => {
        const date = item.dt_txt.split(' ')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(item);
        return acc;
      }, {});

      let newForecast: Forecast[] = Object.keys(dailyData).slice(0, 5).map(date => {
        const dayData = dailyData[date];
        const temp_min = Math.min(...dayData.map((item: any) => item.main.temp_min));
        const temp_max = Math.max(...dayData.map((item: any) => item.main.temp_max));
        const centralItem = dayData[Math.floor(dayData.length / 2)];
        return {
          date: date,
          day: new Date(date).toLocaleDateString('en-IN', { weekday: 'long' }),
          temp_min: temp_min,
          temp_max: temp_max,
          description: centralItem.weather[0].description,
          icon: centralItem.weather[0].icon,
        };
      });

      if (days === 10) {
        const simulatedForecast: Forecast[] = newForecast.map((day, i) => {
            const nextDate = new Date(day.date);
            nextDate.setDate(nextDate.getDate() + 5);
            return {
                ...day,
                date: nextDate.toISOString().split('T')[0],
                day: nextDate.toLocaleDateString('en-IN', { weekday: 'long' }),
                temp_min: day.temp_min + (Math.random() - 0.5) * 2,
                temp_max: day.temp_max + (Math.random() - 0.5) * 2,
            }
        });
        newForecast = [...newForecast, ...simulatedForecast];
      }

      setForecast(newForecast);

    } catch (err: any) {
      setError(err.message);
      setForecast(null);
    }
  }, []);

  const fetchWeatherByCity = useCallback((city: string) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    return fetchWeatherData(url, city);
  }, [fetchWeatherData]);

  const fetchWeatherByCoords = useCallback((lat: number, lon: number) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    return fetchWeatherData(url);
  }, [fetchWeatherData]);

  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError('Geolocation failed. Please search for a city.');
          console.error(err);
          fetchWeatherByCity('London');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      fetchWeatherByCity('London');
    }
  }, [fetchWeatherByCoords, fetchWeatherByCity]);
  
  useEffect(() => {
    if (members.length > 0 && !activeMemberId) {
      setActiveMemberId(members[0].id);
    }
  }, [members, activeMemberId, setActiveMemberId]);

  useEffect(() => {
    getUserLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (weather) {
      fetchForecastData(weather.coord.lat, weather.coord.lon, forecastDays);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecastDays, weather]);


  const value = {
    members,
    activeMember,
    addMember,
    updateMemberPreferences,
    setActiveMemberId,
    deleteMember,
    weather,
    forecast,
    hourlyForecast,
    loading,
    error,
    fetchWeatherByCity,
    fetchWeatherByCoords,
    getUserLocation,
    location,
    forecastDays,
    setForecastDays
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
