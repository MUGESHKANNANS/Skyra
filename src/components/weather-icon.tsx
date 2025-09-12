import { Sun, Moon, CloudSun, CloudMoon, Cloud, Cloudy, CloudRain, CloudSunRain, CloudMoonRain, CloudLightning, Snowflake, Wind } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

interface WeatherIconProps extends SVGProps<SVGSVGElement> {
  iconCode: string;
}

const iconMap: { [key: string]: React.ElementType } = {
  '01d': Sun,
  '01n': Moon,
  '02d': CloudSun,
  '02n': CloudMoon,
  '03d': Cloud,
  '03n': Cloud,
  '04d': Cloudy,
  '04n': Cloudy,
  '09d': CloudRain,
  '09n': CloudRain,
  '10d': CloudSunRain,
  '10n': CloudMoonRain,
  '11d': CloudLightning,
  '11n': CloudLightning,
  '13d': Snowflake,
  '13n': Snowflake,
  '50d': Wind,
  '50n': Wind,
};


export function WeatherIcon({ iconCode, className, ...props }: WeatherIconProps) {
    // This is a fallback to use OpenWeatherMap's own icons if we don't have a mapping.
    // It is also a simple way to render the icons without creating a huge mapping component.
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    return (
        <div className={cn("relative", className)} style={{ width: '64px', height: '64px' }}>
            <Image 
                src={iconUrl} 
                alt="Weather icon"
                width={64}
                height={64}
                className="object-contain"
                unoptimized
            />
        </div>
    );
}
