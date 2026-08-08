import { motion } from 'framer-motion';
import { Navigation, Activity, MapPin } from 'lucide-react';
import type { DistanceMatrixResponse } from '../types/route';

interface LiveNavigationPanelProps {
  liveMetrics: DistanceMatrixResponse | null;
  currentAqi: number | null;
  currentAqiCategory: string | null;
}

export const LiveNavigationPanel = ({ liveMetrics, currentAqi, currentAqiCategory }: LiveNavigationPanelProps) => {
  const getAQIColorClass = (category: string | null) => {
    switch (category) {
      case 'Good': return 'text-emerald-500';
      case 'Moderate': return 'text-amber-500';
      case 'Unhealthy for Sensitive Groups': return 'text-orange-500';
      case 'Unhealthy': return 'text-red-500';
      case 'Very Unhealthy': return 'text-purple-500';
      case 'Hazardous': return 'text-rose-900';
      default: return 'text-emerald-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-md"
    >
      <div className="bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-5 overflow-hidden relative">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/20 p-2 rounded-full animate-pulse">
              <Navigation className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Live Navigation</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> GPS Active
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-black tabular-nums tracking-tighter">
              {liveMetrics ? liveMetrics.duration_text : '--'}
            </p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Remaining</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-muted/50 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1.5 mb-1">
              <Navigation className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Distance</span>
            </div>
            <p className="text-lg font-bold tabular-nums">
              {liveMetrics ? liveMetrics.distance_text : '--'}
            </p>
          </div>
          
          <div className="bg-muted/50 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current AQI</span>
            </div>
            <p className={`text-lg font-bold tabular-nums ${getAQIColorClass(currentAqiCategory)}`}>
              {currentAqi !== null ? Math.round(currentAqi) : '--'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
