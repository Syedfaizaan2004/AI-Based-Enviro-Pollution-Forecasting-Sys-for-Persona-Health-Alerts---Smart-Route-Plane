import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Activity, ShieldAlert, Wind } from 'lucide-react';
import type { DashboardSummaryResponse } from '../types/health';

interface HealthOverviewProps {
  summary: DashboardSummaryResponse;
}

const AnimatedGauge = ({ value, label, max = 100, colorClass, icon: Icon }: { value: number; label: string; max?: number; colorClass: string; icon: any }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-32 h-32 flex items-center justify-center mb-3">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          {/* Progress Circle */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={colorClass}
            strokeDasharray={circumference}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={`h-5 w-5 mb-1 ${colorClass}`} />
          <span className="text-2xl font-black leading-none">{value.toFixed(0)}</span>
        </div>
      </div>
      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
};

export const HealthOverview = ({ summary }: HealthOverviewProps) => {
  // Derive a synthesized health score (0-100) from exposure and average smart route scores
  // If backend doesn't provide a direct single "Health Score" field, we estimate it
  const exposureScore = summary.exposure?.average_exposure_score || 0;
  const healthScore = Math.max(0, 100 - (summary.health?.high_risk_predictions || 0) * 10);
  
  // AQI -> Risk Level (0-100 mapping)
  const aqi = summary.cards?.current_aqi || 0;
  const riskLevel = Math.min(100, (aqi / 300) * 100); 

  return (
    <GlassCard className="p-6 bg-background/60 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-destructive" />
      
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold tracking-tight">Today's Health Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-border/50">
        
        <AnimatedGauge 
          value={healthScore} 
          label="Health Score" 
          colorClass={healthScore > 70 ? 'text-emerald-500' : healthScore > 40 ? 'text-amber-500' : 'text-destructive'} 
          icon={Activity}
        />
        
        <AnimatedGauge 
          value={riskLevel} 
          label="Risk Level" 
          colorClass={riskLevel > 70 ? 'text-destructive' : riskLevel > 40 ? 'text-amber-500' : 'text-emerald-500'} 
          icon={ShieldAlert}
        />
        
        <AnimatedGauge 
          value={exposureScore} 
          label="Exposure Score" 
          colorClass={exposureScore > 70 ? 'text-destructive' : exposureScore > 40 ? 'text-amber-500' : 'text-emerald-500'} 
          icon={Wind}
        />

      </div>
    </GlassCard>
  );
};
