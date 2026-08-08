import { Activity, Route, ShieldAlert, Wind } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHistoryStatistics } from '../hooks/useHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/ui/glass-card';

export function StatisticsOverview() {
  const { data: stats, isLoading, isError } = useHistoryStatistics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <GlassCard key={i} className="p-6">
            <Skeleton className="h-10 w-10 rounded-xl mb-4" />
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </GlassCard>
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return null;
  }

  const statItems = [
    {
      title: "Average AQI",
      value: Math.round(stats.average_aqi),
      subtitle: "Highest: " + Math.round(stats.highest_aqi),
      icon: Wind,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Avg Exposure Score",
      value: Math.round(stats.average_exposure_score),
      subtitle: "Daily Avg: " + Math.round(stats.daily_exposure),
      icon: ShieldAlert,
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      title: "Smart Route Score",
      value: Math.round(stats.average_smart_route_score) + "/100",
      subtitle: "Routes planned",
      icon: Route,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Avg Travel Time",
      value: Math.round(stats.average_travel_time) + "m",
      subtitle: "Per route",
      icon: Activity,
      color: "text-violet-500",
      bg: "bg-violet-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <GlassCard className="p-6 h-full flex flex-col justify-between group hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${item.bg} ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight text-foreground mb-1">
                {item.value}
              </div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {item.title}
              </div>
              <div className="text-xs text-muted-foreground/70">
                {item.subtitle}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
