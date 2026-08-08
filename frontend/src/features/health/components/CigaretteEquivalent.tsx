import { Cigarette, Info } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

interface CigaretteEquivalentProps {
  pm25: number;
}

export const CigaretteEquivalent = ({ pm25 }: CigaretteEquivalentProps) => {
  // Scientific rule of thumb: 22 µg/m3 of PM2.5 for 24 hours equals one cigarette.
  const equivalent = (pm25 / 22).toFixed(1);

  return (
    <GlassCard className="p-6 md:p-8 h-full flex flex-col justify-center bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent backdrop-blur-xl border-orange-500/20 relative overflow-hidden group">
      {/* Background Icon */}
      <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-20 transition-all duration-700 transform group-hover:rotate-12 group-hover:scale-110">
        <Cigarette className="w-40 h-40 text-orange-500" />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-2 flex items-center gap-2">
          Air Quality Impact <Info className="h-3.5 w-3.5" />
        </h3>
        <p className="text-muted-foreground text-sm font-medium mb-6 max-w-[85%] leading-snug">
          Breathing today's air for 24 hours is equivalent to smoking:
        </p>
        
        <div className="flex items-baseline gap-3">
          <span className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-red-600 drop-shadow-lg">
            {equivalent}
          </span>
          <span className="text-xl font-black text-muted-foreground uppercase tracking-widest">cigarettes</span>
        </div>
      </div>
    </GlassCard>
  );
};
