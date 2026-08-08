import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardSummary, useLiveAQI } from '../hooks/dashboard';

// Linear-style clean colors
const getAqiColor = (aqi: number) => {
  if (aqi <= 50) return '#34d399';    // Good - emerald
  if (aqi <= 100) return '#facc15';   // Moderate - yellow
  if (aqi <= 150) return '#fb923c';   // Unhealthy for sensitive - orange
  if (aqi <= 200) return '#f87171';   // Unhealthy - red
  if (aqi <= 300) return '#c084fc';   // Very Unhealthy - purple
  return '#9f1239';                   // Hazardous - rose
};

const getAqiCategory = (aqi: number) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

const getAqiBadgeClasses = (aqi: number) => {
  if (aqi <= 50) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  if (aqi <= 100) return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20 dark:text-yellow-500';
  if (aqi <= 150) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
  if (aqi <= 200) return 'text-red-500 bg-red-500/10 border-red-500/20';
  if (aqi <= 300) return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
  return 'text-rose-700 bg-rose-700/10 border-rose-700/20 dark:text-rose-500';
};

export const AQITrendChart = ({ location }: { location?: { city: string, lat: number, lon: number } }) => {
  const { data: summary, isLoading: isLoadingSummary } = useDashboardSummary();
  const { data: liveAqiData, isLoading: isLoadingLive } = useLiveAQI(location?.city, location?.lat, location?.lon);
  
  const isLoading = isLoadingSummary || isLoadingLive;

  // Use live AQI from city if available, otherwise fallback to summary
  const aqi = liveAqiData ? Math.round(liveAqiData.aqi) : Math.round(summary?.cards?.current_aqi ?? 0);
  let category = liveAqiData?.category || summary?.cards?.latest_aqi_category || 'Good';
  
  if (category === 'Unknown' || !category) {
    category = getAqiCategory(aqi);
  }

  const pollutantCards = [
    { label: 'PM2.5', value: Math.round(Math.max(0, aqi * 0.95 + 4)), unit: 'µg/m³', color: 'text-rose-400', bg: 'bg-rose-400/10', icon: '☁' },
    { label: 'PM10', value: Math.round(Math.max(0, aqi * 1.1 + 8)), unit: 'µg/m³', color: 'text-orange-400', bg: 'bg-orange-400/10', icon: '🌫' },
    { label: 'NO₂', value: Math.round(Math.max(0, aqi * 0.6 + 8)), unit: 'ppb', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: '⚗' },
    { label: 'SO₂', value: Math.round(Math.max(0, aqi * 0.4 + 5)), unit: 'ppb', color: 'text-cyan-400', bg: 'bg-cyan-400/10', icon: '💨' },
    { label: 'O₃', value: Math.round(Math.max(0, aqi * 0.7 + 6)), unit: 'ppb', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: '☀' },
    { label: 'CO', value: Number((Math.max(0, aqi * 0.08 + 0.3)).toFixed(1)), unit: 'ppm', color: 'text-violet-400', bg: 'bg-violet-400/10', icon: '🧪' },
    { label: 'CO₂', value: Math.round(Math.max(350, 400 + aqi * 1.2)), unit: 'ppm', color: 'text-sky-400', bg: 'bg-sky-400/10', icon: '🌿' },
  ];

  if (isLoading) {
    return (
      <GlassCard className="p-6 h-full min-h-[480px] flex flex-col">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-56 mb-8" />
        <Skeleton className="flex-1 rounded-lg" />
      </GlassCard>
    );
  }

  const badgeClasses = getAqiBadgeClasses(aqi);

  return (
    <GlassCard className="p-6 h-full min-h-[480px] flex flex-col group hover:bg-card/80">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-1">Air Pollutant Overview</h3>
          <p className="text-xs text-muted-foreground">Estimated live pollutant levels for the current AQI zone</p>
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClasses}`}>
          AQI {aqi} · {category}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {pollutantCards.map((item) => (
          <div key={item.label} className="rounded-xl border border-border/50 bg-background/40 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{item.label}</span>
              <div className={`rounded-md p-1.5 ${item.bg} ${item.color}`}>
                <span className="text-[10px] font-bold">{item.icon}</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-xl font-semibold">{item.value}</span>
              <span className="text-[11px] text-muted-foreground">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 mt-4">
        {/* Removed BarChart as requested */}
      </div>
    </GlassCard>
  );
};

export const PollutantBarChart = () => {
  const { data: summary, isLoading } = useDashboardSummary();

  const dist = summary?.predictions?.aqi_category_distribution ?? {};
  const chartData = Object.entries(dist).map(([name, value]) => ({ name, value }));

  const categoryColorMap: Record<string, string> = {
    Good: '#34d399',
    Moderate: '#facc15',
    'Unhealthy for Sensitive Groups': '#fb923c',
    Unhealthy: '#f87171',
    'Very Unhealthy': '#c084fc',
    Hazardous: '#9f1239',
  };

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
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-1">AQI Category Breakdown</h3>
          <p className="text-xs text-muted-foreground">Distribution of recorded results</p>
        </div>
      </div>
      <div className="flex-1 min-h-[200px]">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No prediction data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))', fontWeight: 500 }} width={85} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' }}
                formatter={(value) => [Number(value), 'Predictions']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={categoryColorMap[entry.name] ?? getAqiColor(100)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
};
