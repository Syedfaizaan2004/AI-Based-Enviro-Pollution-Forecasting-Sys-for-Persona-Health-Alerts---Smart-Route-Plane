import { ShieldAlert, Activity, AlertTriangle, CheckCircle2, XCircle, Wind, HeartPulse } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import type { DashboardSummaryResponse } from '../types/dashboard';

const riskConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  Low:      { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  Moderate: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  High:     { icon: ShieldAlert, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  Severe:   { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  Hazardous:{ icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

export const HealthPanel = ({ data }: { data: DashboardSummaryResponse }) => {
  const health = data.health;
  const cards = data.cards;

  const aqi = Math.round(cards?.current_aqi ?? 0);
  const exposureScore = Math.round(cards?.average_exposure_score ?? 0);
  const healthProfile = health?.current_health_profile ?? 'None';
  const highRisk = health?.high_risk_predictions ?? 0;
  const criticalExposure = health?.critical_exposure_count ?? 0;

  const riskLevel =
    aqi <= 50  ? 'Low' :
    aqi <= 100 ? 'Moderate' :
    aqi <= 150 ? 'Moderate' :
    aqi <= 200 ? 'High' :
    aqi <= 300 ? 'Severe' : 'Hazardous';

  const riskCfg = riskConfig[riskLevel] ?? riskConfig.Low;
  const RiskIcon = riskCfg.icon;

  const maskAdvice =
    aqi <= 100 ? 'Not required for most people.' :
    aqi <= 150 ? 'Recommended for sensitive groups.' :
    aqi <= 200 ? 'Required. Use N95 or equivalent.' :
                 'Essential. Double-mask or respirator needed.';

  const exerciseAdvice =
    aqi <= 50  ? 'All outdoor activities safe.' :
    aqi <= 100 ? 'Moderate outdoor activity is fine.' :
    aqi <= 150 ? 'Limit prolonged strenuous activities.' :
    aqi <= 200 ? 'Move exercise indoors.' :
                 'Avoid all outdoor activity.';

  return (
    <GlassCard className="p-6 group hover:bg-card/80">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-1">Health &amp; Safety</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: `var(--${riskCfg.color.split('-')[1]})`, opacity: 0.8 }} />
            Profile: <span className="font-semibold text-foreground capitalize">{healthProfile}</span>
          </p>
        </div>
        <div className={`p-2.5 rounded-lg border ${riskCfg.border} ${riskCfg.bg} ${riskCfg.color} shadow-sm`}>
          <RiskIcon className="h-5 w-5" />
        </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="flex gap-3 mb-6">
        <div className={`flex-1 p-4 rounded-xl border ${riskCfg.border} ${riskCfg.bg} transition-colors relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <RiskIcon className="h-16 w-16" />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] uppercase tracking-wider font-bold mb-1.5 opacity-80" style={{ color: `var(--${riskCfg.color.split('-')[1]})` }}>Overall Risk</div>
            <div className={`text-2xl font-black tracking-tight ${riskCfg.color}`}>
              {riskLevel}
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">Exposure Score</div>
          <div className={`text-2xl font-black tracking-tight ${exposureScore < 40 ? 'text-emerald-400' : exposureScore < 70 ? 'text-amber-400' : 'text-red-400'}`}>
            {exposureScore}<span className="text-sm font-medium text-muted-foreground ml-1">/100</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(highRisk > 0 || criticalExposure > 0) && (
        <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center shadow-sm">
          <Activity className="h-4 w-4 mr-2.5 shrink-0 animate-pulse" />
          <span>{highRisk} high-risk predictions &bull; {criticalExposure} critical exposures</span>
        </div>
      )}

      {/* Guidance Section */}
      <div className="space-y-3">
        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-background/40 border border-border/30 hover:border-border/60 transition-colors">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 shrink-0">
            <Wind className="h-4 w-4" />
          </div>
          <div className="text-sm pt-0.5">
            <span className="font-bold block mb-1 text-foreground tracking-tight">Mask Recommendation</span>
            <span className="text-muted-foreground text-xs leading-relaxed">{maskAdvice}</span>
          </div>
        </div>
        
        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-background/40 border border-border/30 hover:border-border/60 transition-colors">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
            <HeartPulse className="h-4 w-4" />
          </div>
          <div className="text-sm pt-0.5">
            <span className="font-bold block mb-1 text-foreground tracking-tight">Exercise Guidance</span>
            <span className="text-muted-foreground text-xs leading-relaxed">{exerciseAdvice}</span>
          </div>
        </div>
      </div>

    </GlassCard>
  );
};
