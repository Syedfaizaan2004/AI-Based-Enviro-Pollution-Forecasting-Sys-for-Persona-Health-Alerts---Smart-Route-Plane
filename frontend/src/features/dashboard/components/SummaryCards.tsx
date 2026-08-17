import { motion } from 'framer-motion';
import { Wind, Route, BarChart2, ShieldAlert } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import type { DashboardSummaryResponse } from '../types/dashboard';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  subtitle?: string;
  color: string;
  index: number;
}

const StatCard = ({ title, value, unit, icon: Icon, subtitle, color, index }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 + 0.2, duration: 0.4, ease: "easeOut" }}
    className="h-full"
  >
    <GlassCard className="p-5 flex flex-col justify-between h-full group hover:bg-card/80">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-2 rounded-lg bg-background/50 border border-border/50 ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-4 w-4" />
        </div>
        {subtitle && (
          <span className="text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-md bg-muted/50 border border-border/50 text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</h3>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-tighter text-foreground">{value}</span>
          {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
        </div>
      </div>
    </GlassCard>
  </motion.div>
);

export const SummaryCards = ({ data }: { data: DashboardSummaryResponse }) => {
  const { cards, exposure, routes, predictions } = data;

  const getAqiCategory = (value: number) => {
    if (value === 0) return '—';
    if (value <= 50) return 'Good';
    if (value <= 100) return 'Moderate';
    if (value <= 150) return 'Unhealthy for Sensitive';
    if (value <= 200) return 'Unhealthy';
    if (value <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const avgAqi = Math.round(cards?.average_predicted_aqi ?? 0);
  const avgAqiCategory = (cards?.latest_aqi_category && cards.latest_aqi_category !== 'Unknown') 
    ? cards.latest_aqi_category 
    : getAqiCategory(avgAqi);

  const stats = [
    {
      title: 'Avg AQI',
      value: avgAqi,
      unit: 'index',
      icon: Wind,
      subtitle: avgAqiCategory,
      color: 'text-green-400',
    },
    {
      title: 'Peak AQI',
      value: Math.round(cards?.highest_aqi_encountered ?? 0),
      unit: 'index',
      icon: ShieldAlert,
      subtitle: 'Highest',
      color: 'text-destructive',
    },
    {
      title: 'Avg Exposure',
      value: Math.round(exposure?.average_exposure_score ?? 0),
      unit: '/100',
      icon: BarChart2,
      subtitle: exposure?.exposure_trend ?? 'Stable',
      color: 'text-amber-400',
    },
    {
      title: 'Smart Routes',
      value: cards?.total_routes ?? 0,
      unit: 'trips',
      icon: Route,
      subtitle: `Score: ${Math.round(routes?.average_smart_route_score ?? 0)}`,
      color: 'text-emerald-400',
    },
    {
      title: 'Predictions',
      value: cards?.this_week_predictions_count ?? 0,
      unit: 'this week',
      icon: BarChart2,
      subtitle: `${cards?.this_month_predictions_count ?? 0} monthly`,
      color: 'text-emerald-500',
    },
    {
      title: 'AI Accuracy',
      value: `${Math.round(predictions?.prediction_accuracy ?? 0)}`,
      unit: '%',
      icon: Wind,
      subtitle: 'Based on history',
      color: 'text-primary',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
      {stats.map((s, i) => (
        <StatCard key={s.title} {...s} index={i} />
      ))}
    </div>
  );
};
