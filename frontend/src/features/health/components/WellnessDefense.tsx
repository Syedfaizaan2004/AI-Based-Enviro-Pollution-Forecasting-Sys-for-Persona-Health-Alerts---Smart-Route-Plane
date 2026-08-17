import { Apple, Droplets, ShieldPlus } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

interface WellnessDefenseProps {
  aqi: number;
}

export const WellnessDefense = ({ aqi }: WellnessDefenseProps) => {
  
  const getTips = () => {
    if (aqi > 150) {
      return [
        { icon: <Droplets className="w-4 h-4 text-emerald-500" />, text: "Drink 3L of water to flush toxins" },
        { icon: <Apple className="w-4 h-4 text-emerald-500" />, text: "Eat Vitamin C & E (Citrus, Almonds)" },
        { icon: <ShieldPlus className="w-4 h-4 text-emerald-600" />, text: "Take Omega-3 supplements today" }
      ];
    } else if (aqi > 100) {
      return [
        { icon: <Droplets className="w-4 h-4 text-emerald-500" />, text: "Stay well hydrated (2.5L+)" },
        { icon: <Apple className="w-4 h-4 text-emerald-500" />, text: "Antioxidant-rich lunch recommended" },
        { icon: <ShieldPlus className="w-4 h-4 text-emerald-600" />, text: "Wash face after commuting" }
      ];
    } else {
      return [
        { icon: <Droplets className="w-4 h-4 text-emerald-500" />, text: "Normal hydration is fine" },
        { icon: <Apple className="w-4 h-4 text-emerald-500" />, text: "Great day for outdoor digestion walk" },
        { icon: <ShieldPlus className="w-4 h-4 text-emerald-600" />, text: "Open windows for fresh air ventilation" }
      ];
    }
  };

  const tips = getTips();

  return (
    <GlassCard className="p-6 h-full bg-background/60 backdrop-blur-xl border-border/50">
      <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Daily Wellness Defense</h3>
      <div className="space-y-4">
        {tips.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="bg-muted p-2 rounded-lg shrink-0 mt-0.5 border border-border/50">
              {tip.icon}
            </div>
            <p className="text-sm font-medium leading-tight">{tip.text}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
