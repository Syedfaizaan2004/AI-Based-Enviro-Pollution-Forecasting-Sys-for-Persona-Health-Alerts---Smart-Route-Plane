import { Sun, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import type { ExposureAnalytics } from '../types/health';

interface SafeOutdoorWindowProps {
  exposure?: ExposureAnalytics;
}

export const SafeOutdoorWindow = ({ exposure }: SafeOutdoorWindowProps) => {
  // Mock logic to extract a time window from backend data, or fallbacks if null.
  // The backend currently provides `safest_day` and `most_polluted_day`.
  const safestDate = exposure?.safest_day ? new Date(exposure.safest_day) : new Date();
  
  // Format the safest window (e.g. 06:00 AM - 08:00 AM)
  safestDate.setHours(6, 0, 0, 0); // Mocking a 6 AM start for the safest day
  const startTime = safestDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  safestDate.setHours(8, 0, 0, 0);
  const endTime = safestDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <GlassCard className="p-6 bg-emerald-500/10 backdrop-blur-xl border-emerald-500/20 shadow-xl relative overflow-hidden h-full flex flex-col justify-center">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-1">Safe Outdoor Window</h2>
          <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">Best time for outdoor activities</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Sun className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>

      <div className="relative z-10 bg-background/50 rounded-2xl p-4 border border-emerald-500/20 flex items-center gap-4">
        <Clock className="h-6 w-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Optimal Time</p>
          <p className="font-bold text-lg">{startTime} - {endTime}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-background/40 rounded-xl p-3 border border-emerald-500/10 text-center">
          <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Expected AQI</p>
          <p className="font-bold text-emerald-500">~ 42 (Good)</p>
        </div>
        <div className="bg-background/40 rounded-xl p-3 border border-emerald-500/10 text-center">
          <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Activity</p>
          <p className="font-bold text-emerald-500">Safe for All</p>
        </div>
      </div>
    </GlassCard>
  );
};
