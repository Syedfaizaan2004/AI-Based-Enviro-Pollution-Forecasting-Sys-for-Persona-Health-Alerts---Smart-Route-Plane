
import { motion } from 'framer-motion';
import { MapPin, Activity, ThermometerSun, Droplets } from 'lucide-react';
import type { DashboardSummaryResponse } from '../types/dashboard';
import { format, parseISO } from 'date-fns';
import { useCurrentWeather } from '../hooks/dashboard';
import { useLiveAQI } from '../hooks/dashboard';

// Linear-style deep gradient maps (subtle, rich, not overpowering)
const categoryGradient: Record<string, string> = {
  Good: 'from-emerald-950/80 via-emerald-900/40 to-background',
  Moderate: 'from-yellow-950/80 via-yellow-900/40 to-background',
  'Unhealthy for Sensitive Groups': 'from-orange-950/80 via-orange-900/40 to-background',
  Unhealthy: 'from-red-950/80 via-red-900/40 to-background',
  'Very Unhealthy': 'from-purple-950/80 via-purple-900/40 to-background',
  Hazardous: 'from-rose-950/80 via-rose-900/40 to-background',
};

const categoryColor: Record<string, string> = {
  Good: 'text-emerald-400',
  Moderate: 'text-yellow-400',
  'Unhealthy for Sensitive Groups': 'text-orange-400',
  Unhealthy: 'text-red-400',
  'Very Unhealthy': 'text-purple-400',
  Hazardous: 'text-rose-400',
};

export const HeroSection = ({ data, location }: { data: DashboardSummaryResponse, location: { city: string, lat: number, lon: number } }) => {
  const cards = data.cards;
  const health = data.health;
  const meta = data.metadata;

  const { data: weather } = useCurrentWeather(location.lat || undefined, location.lon || undefined);
  const { data: liveAqiData } = useLiveAQI(location.city, location.lat || undefined, location.lon || undefined);

  // Use live AQI from city search if available, fallback to summary AQI
  const aqi = liveAqiData ? Math.round(liveAqiData.aqi) : Math.round(cards?.current_aqi ?? 0);
  
  const getAqiCategory = (value: number) => {
    if (value === 0) return 'Good'; // Default fallback
    if (value <= 50) return 'Good';
    if (value <= 100) return 'Moderate';
    if (value <= 150) return 'Unhealthy for Sensitive Groups';
    if (value <= 200) return 'Unhealthy';
    if (value <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const category = liveAqiData?.category || ((cards?.latest_aqi_category && cards.latest_aqi_category !== 'Unknown') 
    ? cards.latest_aqi_category 
    : getAqiCategory(aqi));

  const gradient = categoryGradient[category] ?? categoryGradient.Good;
  const highlightColor = categoryColor[category] ?? categoryColor.Good;
  const healthProfile = health?.current_health_profile ?? 'Not configured';

  const healthAdvice =
    aqi <= 50  ? 'Excellent conditions! Enjoy outdoor activities freely.' :
    aqi <= 100 ? 'Acceptable air quality. Sensitive individuals should limit prolonged outdoor exertion.' :
    aqi <= 150 ? 'Unhealthy for sensitive groups. Reduce outdoor activity if you have respiratory conditions.' :
    aqi <= 200 ? 'Unhealthy. Everyone should reduce outdoor activities. Wear a mask if going out.' :
    aqi <= 300 ? 'Very Unhealthy. Avoid outdoor activities. Use air purifiers indoors.' :
                 'Hazardous! Stay indoors. Seek medical advice if experiencing symptoms.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-8 border border-border/40 shadow-glass`}
    >
      <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
        <div className="flex-1 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex items-center gap-2 text-white/90 mb-4"
          >
            <MapPin className="h-4 w-4 text-emerald-300" />
            <span className="font-semibold text-xs tracking-wider uppercase">Live Dashboard {location.city ? `— ${location.city}` : ''}</span>
          </motion.div>
          <motion.h1 
            key={`h1-${category}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground"
          >
            Air Quality is <span className={highlightColor}>{category}</span>
          </motion.h1>
          <motion.p 
            key={`p-${healthAdvice}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-white/90 text-lg leading-relaxed mb-6 font-medium"
          >
            {healthAdvice}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="flex items-center gap-3 text-sm font-medium"
          >
            <span className="bg-background/40 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/20 text-white font-semibold">
              Profile: <span className="text-emerald-300">{healthProfile}</span>
            </span>
            <span className="text-white/80 text-xs">
              Last updated: {meta?.timestamp ? format(parseISO(meta.timestamp), 'h:mm a') : 'Just now'}
            </span>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap gap-4 shrink-0"
        >
          <div className="flex flex-col items-start bg-background/40 backdrop-blur-xl rounded-xl p-5 min-w-[140px] border border-border/40 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Activity className="h-5 w-5 mb-3 text-emerald-500" />
            <span key={`aqi-${aqi}`} className="text-4xl font-bold tracking-tighter text-foreground mb-1">{aqi}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current AQI</span>
          </div>
          <div className="flex flex-col items-start bg-background/40 backdrop-blur-xl rounded-xl p-5 min-w-[140px] border border-border/40 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <ThermometerSun className="h-5 w-5 mb-3 text-amber-500" />
            <span className="text-4xl font-bold tracking-tighter text-foreground mb-1">
              {weather ? Math.round(weather.temperature) : '--'}<span className="text-lg text-muted-foreground">°C</span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Temperature</span>
          </div>
          <div className="flex flex-col items-start bg-background/40 backdrop-blur-xl rounded-xl p-5 min-w-[140px] border border-border/40 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Droplets className="h-5 w-5 mb-3 text-emerald-500" />
            <span className="text-4xl font-bold tracking-tighter text-foreground mb-1">
              {weather ? Math.round(weather.humidity) : '--'}<span className="text-lg text-muted-foreground">%</span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Humidity</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
