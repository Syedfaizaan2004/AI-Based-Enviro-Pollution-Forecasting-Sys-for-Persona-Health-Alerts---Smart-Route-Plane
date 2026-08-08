import { GlassCard } from '@/components/ui/glass-card';
import { Cloud, Droplets, Wind, Eye, Gauge } from 'lucide-react';
import { useCurrentWeather } from '../hooks/dashboard';
import { Skeleton } from '@/components/ui/skeleton';

interface WeatherReportProps {
  location: { city: string; lat: number; lon: number };
}

export const WeatherReport = ({ location }: WeatherReportProps) => {
  const { data: weather, isLoading } = useCurrentWeather(location.lat || undefined, location.lon || undefined);

  // Derived data
  const currentTemp = weather ? Math.round(weather.temperature) : 24;
  const condition = weather?.description || 'Partly Cloudy';
  const humidity = weather ? `${weather.humidity}%` : '65%';
  const windSpeed = weather ? `${Math.round(weather.wind_speed)} km/h` : '12 km/h';
  const pressure = weather?.pressure ? `${weather.pressure} hPa` : '1012 hPa';
  const visibility = weather?.visibility ? `${Math.round(weather.visibility / 1000)} km` : '10 km';
  const locationName = weather?.location_name || 'San Francisco, CA';

  if (isLoading) {
    return (
      <GlassCard className="p-6 h-full min-h-[480px] flex flex-col">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-56 mb-8" />
        <Skeleton className="flex-1 rounded-lg" />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 h-full min-h-[480px] flex flex-col group hover:bg-card/80">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-1">Local Weather</h3>
          <p className="text-xs text-muted-foreground">Current conditions and forecast</p>
        </div>
        <div className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-500 dark:text-sky-400">
          {locationName}
        </div>
      </div>

      <div className="flex flex-col items-center mb-8 mt-2">
        <div className="flex items-center gap-6">
          <Cloud className="w-20 h-20 text-sky-400 drop-shadow-md" strokeWidth={1.5} />
          <div className="flex flex-col">
            <div className="flex items-start">
              <span className="text-6xl font-light tracking-tighter">{currentTemp}</span>
              <span className="text-3xl font-light text-muted-foreground ml-1 mt-1">°C</span>
            </div>
            <p className="text-lg font-medium text-foreground tracking-wide mt-1">{condition}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background/40 border border-border/50 transition-colors hover:bg-background/60">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Humidity</p>
            <p className="text-sm font-semibold mt-0.5">{humidity}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background/40 border border-border/50 transition-colors hover:bg-background/60">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500 dark:text-teal-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Wind</p>
            <p className="text-sm font-semibold mt-0.5">{windSpeed}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background/40 border border-border/50 transition-colors hover:bg-background/60">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Pressure</p>
            <p className="text-sm font-semibold mt-0.5">{pressure}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background/40 border border-border/50 transition-colors hover:bg-background/60">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Visibility</p>
            <p className="text-sm font-semibold mt-0.5">{visibility}</p>
          </div>
        </div>
      </div>

    </GlassCard>
  );
};
