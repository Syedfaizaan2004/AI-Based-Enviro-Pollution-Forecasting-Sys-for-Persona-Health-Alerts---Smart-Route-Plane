import { GlassCard } from '@/components/ui/glass-card';
import { Cloud, CloudRain, Sun, Wind, CloudLightning, Moon, Loader2, AlertCircle } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const aqi = payload[0].value;
    let status = 'Good';
    let color = 'text-emerald-400';
    if (aqi > 50) { status = 'Moderate'; color = 'text-yellow-400'; }
    if (aqi > 100) { status = 'Unhealthy'; color = 'text-orange-400'; }
    if (aqi > 150) { status = 'Hazardous'; color = 'text-red-400'; }
    
    return (
      <div className="bg-background/90 backdrop-blur-xl border border-border/50 p-4 rounded-xl shadow-2xl">
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-end gap-2">
          <span className={`text-3xl font-black leading-none ${color}`}>{aqi}</span>
          <span className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">AQI</span>
        </div>
        <div className={`mt-2 text-xs font-bold px-2 py-1 rounded-md bg-background/50 inline-block ${color}`}>
          {status}
        </div>
      </div>
    );
  }
  return null;
};

const getWeatherIcon = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes('rain')) return <CloudRain className="w-5 h-5 text-emerald-400" />;
  if (desc.includes('thunderstorm') || desc.includes('storm')) return <CloudLightning className="w-5 h-5 text-emerald-500" />;
  if (desc.includes('cloud')) return <Cloud className="w-5 h-5 text-gray-400" />;
  if (desc.includes('clear') || desc.includes('sun')) return <Sun className="w-5 h-5 text-amber-400" />;
  if (desc.includes('wind')) return <Wind className="w-5 h-5 text-emerald-400" />;
  return <Moon className="w-5 h-5 text-green-400" />; // fallback
};

export const DailyForecast = ({ location, className }: { location?: { city: string, lat: number, lon: number }, className?: string }) => {
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dailyForecast', location?.lat, location?.lon],
    queryFn: () => dashboardService.getDailyForecast(location!.lat, location!.lon),
    enabled: typeof location?.lat === 'number' && typeof location?.lon === 'number' && (location.lat !== 0 || location.lon !== 0),
  });

  if (isLoading || !data) {
    return (
      <GlassCard className={`p-6 flex flex-col justify-center items-center min-h-[400px] ${className || ''}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary/50 mb-4" />
        <p className="text-sm text-muted-foreground">Loading 24-hour forecast data...</p>
      </GlassCard>
    );
  }

  if (isError) {
    return (
      <GlassCard className={`p-6 flex flex-col justify-center items-center min-h-[400px] ${className || ''}`}>
        <AlertCircle className="w-8 h-8 text-destructive/80 mb-4" />
        <p className="text-sm text-muted-foreground">Failed to load forecast data.</p>
      </GlassCard>
    );
  }

  const weatherData = data.weather;
  const aqi24hData = data.aqi;

  return (
    <GlassCard className={`p-6 flex flex-col group hover:bg-card/80 transition-colors duration-500 ${className || ''}`}>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-1">Today's Hourly Forecast</h3>
          <p className="text-xs text-muted-foreground">
            Predicted AQI and Weather conditions over the next 24 hours {location?.city ? `in ${location.city}` : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-10 w-full h-full">
        {/* Weather Timeline (Top Row) */}
        <div className="w-full">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {weatherData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center justify-between p-3 rounded-2xl bg-gradient-to-b from-background/40 to-background/10 border border-border/50 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-background/60 hover:shadow-md hover:border-primary/20">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2">{item.time}</span>
                <div className="p-2.5 rounded-full bg-background/80 shadow-inner border border-border/30 mb-2">
                  {getWeatherIcon(item.weather)}
                </div>
                <div className="text-center">
                  <span className="text-sm font-black block text-foreground/90">{item.temp}°</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:block overflow-hidden text-ellipsis w-full max-w-[50px]">{item.weather}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 24-Hour AQI Trend Chart (Bottom Row) */}
        <div className="w-full flex-1 min-h-[320px] relative">
          <div className="absolute top-0 left-0 w-full flex justify-between items-end mb-4 px-2 z-10 pointer-events-none">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">24-Hour AQI Prediction</h4>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-pink-500/80">Live Trend</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height="100%" className="pt-8">
            <AreaChart data={aqi24hData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAqi24" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity={0.6} />
                  <stop offset="40%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
              
              <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.4} />
              <ReferenceLine y={50} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.4} />

              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} 
                interval={2} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} 
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.4 }} />
              <Area 
                type="monotone" 
                dataKey="aqi" 
                stroke="url(#colorAqi24)" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorAqi24)" 
                animationDuration={2000}
                animationEasing="ease-in-out"
                activeDot={{ r: 6, strokeWidth: 0, fill: '#ec4899', filter: 'url(#glow)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
};
