import { Sparkles } from 'lucide-react';
import type { DashboardSummaryResponse, HealthProfileRead } from '../types/health';
import { GlassCard } from '@/components/ui/glass-card';

interface AIHealthCoachProps {
  summary: DashboardSummaryResponse;
  profile?: HealthProfileRead;
}

export const AIHealthCoach = ({ summary, profile }: AIHealthCoachProps) => {
  const getCoachMessage = () => {
    const condition = profile?.primary_condition && profile.primary_condition !== 'none' 
      ? profile.primary_condition 
      : 'general health';
    
    const exposure = summary.exposure?.daily_exposure || 50;

    if (exposure > 150) {
      return `Since your profile indicates ${condition}, today's severe pollution is highly risky. We strongly recommend staying indoors and using an air purifier. Avoid all outdoor activities.`;
    } else if (exposure > 100) {
      return `Air quality is unhealthy for sensitive groups. Given your ${condition}, consider wearing an N95 mask if you must commute, and avoid outdoor exercise today.`;
    } else if (exposure > 50) {
      return `Moderate air quality today. Your ${condition} should be fine for normal activities, but consider taking Smart Routes to minimize unnecessary exposure during rush hour.`;
    } else {
      return `Perfect air quality today! This is an ideal day for outdoor aerobic exercises. Your respiratory health is in the safe zone.`;
    }
  };

  return (
    <GlassCard className="relative overflow-hidden border border-emerald-600/30 p-6 md:p-8 shadow-2xl shadow-emerald-600/10 group hover:shadow-emerald-600/20 transition-shadow duration-500">
      {/* Animated gradient backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-emerald-600/10 to-transparent opacity-80" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-600 animate-pulse" />
      
      {/* Animated glow orb */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-600/30 transition-colors duration-700" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-3.5 rounded-2xl shrink-0 shadow-lg shadow-emerald-600/25">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <div>
          <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1.5">AI Health Coach</h3>
          <p className="text-sm md:text-lg font-medium leading-relaxed text-foreground/90">
            "{getCoachMessage()}"
          </p>
        </div>
      </div>
    </GlassCard>
  );
};
