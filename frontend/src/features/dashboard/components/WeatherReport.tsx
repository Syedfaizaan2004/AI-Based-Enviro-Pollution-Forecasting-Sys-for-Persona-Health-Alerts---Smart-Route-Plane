import { GlassCard } from '@/components/ui/glass-card';
import { Cloud, Droplets, Wind, Eye, Gauge } from 'lucide-react';
import { useCurrentWeather } from '../hooks/dashboard';
import { Skeleton } from '@/components/ui/skeleton';

interface WeatherReportProps {
  location: { city: string; lat: number; lon: number };
}

export const WeatherReport = ({ location }: WeatherReportProps) => {
  const hasValidLocation =
    typeof location.lat === 'number' &&
    typeof location.lon === 'number' &&
    (location.lat !== 0 || location.lon !== 0);

  const { data: weather, isLoading } = useCurrentWeather(
    hasValidLocation ? location.lat : undefined,
    hasValidLocation ? location.lon : undefined,
  );

  // Derived data — only use real API values, no hardcoded defaults
  const currentTemp = weather ? Math.round(weather.temperature) : null;
  const condition = weather?.description ?? null;
  const humidity = weather ? `${weather.humidity}%` : null;
  const windSpeed = weather ? `${Math.round(weather.wind_speed)} km/h` : null;
  const pressure = weather?.pressure ? `${weather.pressure} hPa` : null;
  const visibility = weather?.visibility ? `${Math.round(weather.visibility / 1000)} km` : null;
  const locationName = weather?.location_name ?? location.city ?? null;

  if (!hasValidLocation && !weather) {
    return (
      <GlassCard className="p-6 h-full min-h-[480px] flex flex-col items-center justify-center gap-3">
        <Cloud className="w-16 h-16 text-muted-foreground/30" strokeWidth={1} />
        <p className="text-sm font-medium text-muted-foreground text-center">
          Search for a city above to see<br />live weather conditions.
        </p>
      </GlassCard>
    );
  }

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
        {locationName && (
          <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 dark:text-green-400">
            {locationName}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center mb-8 mt-2">
        <div className="flex items-center gap-6">
          <Cloud className="w-20 h-20 text-green-400 drop-shadow-md" strokeWidth={1.5} />
          <div className="flex flex-col">
            <div className="flex items-start">
              <span className="text-6xl font-light tracking-tighter">{currentTemp ?? '—'}</span>
              {currentTemp !== null && <span className="text-3xl font-light text-muted-foreground ml-1 mt-1">°C</span>}
            </div>
            <p className="text-lg font-medium text-foreground tracking-wide mt-1">{condition ?? '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background/40 border border-border/50 transition-colors hover:bg-background/60">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Humidity</p>
            <p className="text-sm font-semibold mt-0.5">{humidity ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background/40 border border-border/50 transition-colors hover:bg-background/60">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Wind</p>
            <p className="text-sm font-semibold mt-0.5">{windSpeed ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background/40 border border-border/50 transition-colors hover:bg-background/60">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Pressure</p>
            <p className="text-sm font-semibold mt-0.5">{pressure ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background/40 border border-border/50 transition-colors hover:bg-background/60">
          <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-500">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Visibility</p>
            <p className="text-sm font-semibold mt-0.5">{visibility ?? '—'}</p>
          </div>
        </div>
      </div>

    </GlassCard>
  );
};
