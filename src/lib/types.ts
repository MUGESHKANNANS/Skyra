
export interface Member {
  id: string;
  name: string;
  preferences: {
    agriculture: boolean;
    dress: boolean;
    transport: boolean;
  };
}

export interface Weather {
  city: string;
  country: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  cod: number;
  message?: string;
  coord: {
    lon: number;
    lat: number;
  };
  uvi?: number;
  sunrise: number;
  sunset: number;
}

export interface Forecast {
  date: string;
  day: string;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  precipitation: number;
  wind: number;
}
