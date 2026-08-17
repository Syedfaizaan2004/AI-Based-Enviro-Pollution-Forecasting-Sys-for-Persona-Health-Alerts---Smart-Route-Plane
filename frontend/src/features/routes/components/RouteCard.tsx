import { motion } from 'framer-motion';
import { Clock, Navigation, AlertTriangle, ShieldCheck, Leaf } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import type { RecommendedRoute } from '../types/route';

interface RouteCardProps {
  route: RecommendedRoute;
  isSelected: boolean;
  onClick: () => void;
}

export const RouteCard = ({ route, isSelected, onClick }: RouteCardProps) => {
  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (aqi <= 100) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    if (aqi <= 150) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-destructive bg-destructive/10 border-destructive/20';
  };

  const getRankBadge = (rank: number, reason: string) => {
    if (rank === 1 && reason.toLowerCase().includes('clean')) {
      return (
        <div className="absolute -top-3 -right-2 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/30 border border-white/20 flex items-center gap-1 z-10">
          <Leaf className="h-3 w-3" /> Cleanest
        </div>
      );
    }
    if (rank === 1) {
      return (
        <div className="absolute -top-3 -right-2 bg-gradient-to-r from-primary to-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-primary/30 border border-white/20 flex items-center gap-1 z-10">
          <ShieldCheck className="h-3 w-3" /> Best Choice
        </div>
      );
    }
    return null;
  };

  const aqiColorClass = getAQIColor(route.scores.average_aqi);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative cursor-pointer h-full"
    >
      {getRankBadge(route.rank, route.recommendation_reason)}
      
      <GlassCard 
        className={`h-full p-4 flex flex-col justify-between transition-all duration-300 border-2 ${
          isSelected 
            ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' 
            : 'border-transparent hover:border-border'
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1">
            <h3 className="font-bold text-lg leading-tight flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              {Math.round(route.travel_time_min)} min
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              {route.distance_km.toFixed(1)} km
            </p>
          </div>
          
          <div className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl border ${aqiColorClass}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-0.5">Avg AQI</span>
            <span className="text-xl font-black leading-none">{Math.round(route.scores.average_aqi)}</span>
          </div>
        </div>

        <div className="space-y-2.5 mt-auto">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex-1 bg-muted/50 rounded-lg p-2 border border-border/50 flex flex-col">
              <span className="text-[10px] text-muted-foreground mb-1">Max AQI</span>
              <span className="font-semibold">{Math.round(route.scores.maximum_aqi)}</span>
            </div>
            <div className="flex-1 bg-muted/50 rounded-lg p-2 border border-border/50 flex flex-col">
              <span className="text-[10px] text-muted-foreground mb-1">Health Score</span>
              <span className="font-semibold">{Math.round(route.scores.health_score)}/100</span>
            </div>
          </div>
          
          {route.scores.maximum_aqi > 100 && (
            <div className="flex items-start gap-1.5 text-[10px] text-amber-500 bg-amber-500/10 p-2 rounded-lg">
              <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
              <p className="leading-tight text-amber-600 dark:text-amber-400">
                Route contains high pollution segments.
              </p>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};
