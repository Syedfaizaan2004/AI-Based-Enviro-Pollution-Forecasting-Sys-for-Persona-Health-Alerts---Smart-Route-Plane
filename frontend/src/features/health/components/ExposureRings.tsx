import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';

interface ExposureRingsProps {
  pm25: number;
  pm10: number;
}

export const ExposureRings = ({ pm25, pm10 }: ExposureRingsProps) => {
  // Safe limits (WHO guidelines roughly: PM2.5 daily 15µg/m3, PM10 daily 45µg/m3)
  const pm25Limit = 15;
  const pm10Limit = 45;
  
  const pm25Percent = Math.min((pm25 / pm25Limit) * 100, 100);
  const pm10Percent = Math.min((pm10 / pm10Limit) * 100, 100);

  const getStrokeColor = (percent: number) => {
    if (percent < 50) return '#10b981'; // emerald
    if (percent < 80) return '#f59e0b'; // amber
    if (percent < 100) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const CircleRing = ({ percent, radius, strokeWidth, label, value, delay }: any) => {
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg width={radius * 2 + strokeWidth * 2} height={radius * 2 + strokeWidth * 2} className="transform -rotate-90">
          {/* Background Ring */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/20"
          />
          {/* Progress Ring */}
          <motion.circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="transparent"
            stroke={getStrokeColor(percent)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, delay, ease: "easeOut" }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${getStrokeColor(percent)}80)` }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black">{Math.round(value)}</span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{label}</span>
        </div>
      </div>
    );
  };

  return (
    <GlassCard className="p-6 md:p-8 h-full flex flex-col items-center justify-center bg-background/60 backdrop-blur-xl border-border/50 shadow-lg shadow-background/5">
      <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground w-full mb-8 text-center">Daily Exposure Limits</h3>
      
      <div className="flex gap-8 w-full justify-around items-center">
        <div className="flex flex-col items-center gap-3">
          <CircleRing 
            percent={pm25Percent} 
            radius={45} 
            strokeWidth={8} 
            label="PM2.5" 
            value={pm25} 
            limit={pm25Limit}
            delay={0.1}
          />
          <span className="text-xs text-muted-foreground text-center">
            {pm25Percent >= 100 ? "Over safe limit" : `${Math.round(100 - pm25Percent)}% remaining`}
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <CircleRing 
            percent={pm10Percent} 
            radius={45} 
            strokeWidth={8} 
            label="PM10" 
            value={pm10} 
            limit={pm10Limit}
            delay={0.3}
          />
          <span className="text-xs text-muted-foreground text-center">
            {pm10Percent >= 100 ? "Over safe limit" : `${Math.round(100 - pm10Percent)}% remaining`}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};
