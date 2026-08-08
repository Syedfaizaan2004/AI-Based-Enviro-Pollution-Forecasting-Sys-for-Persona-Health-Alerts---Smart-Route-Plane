import { Trophy, TrendingDown } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

interface PollutionAvoidedProps {
  avoidedPercentage?: number;
}

export const PollutionAvoided = ({ avoidedPercentage = 32 }: PollutionAvoidedProps) => {
  return (
    <GlassCard className="p-6 md:p-8 h-full flex flex-col justify-center bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 relative overflow-hidden group shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/10 transition-shadow">
      <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-20 transition-all duration-700 transform group-hover:rotate-12 group-hover:scale-110">
        <Trophy className="w-48 h-48 text-emerald-500" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-emerald-500/20 p-1.5 rounded-md shadow-inner shadow-emerald-500/20">
            <TrendingDown className="h-4 w-4 text-emerald-500" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500">Impact Stats</h3>
        </div>
        
        <p className="text-muted-foreground text-sm font-medium mb-6 max-w-[85%] leading-snug">
          By taking Smart Routes this month, you have avoided:
        </p>
        
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-teal-600 drop-shadow-lg">
            {avoidedPercentage}%
          </span>
        </div>
        <p className="text-xl font-black text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-widest mt-1">less PM2.5</p>
      </div>
    </GlassCard>
  );
};
