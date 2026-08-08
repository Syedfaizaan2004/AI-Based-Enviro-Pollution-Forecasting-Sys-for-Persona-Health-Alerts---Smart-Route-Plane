import { Bike, Footprints, Dumbbell, PersonStanding, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

interface ActivityPlannerProps {
  aqi: number;
}

export const ActivityPlanner = ({ aqi }: ActivityPlannerProps) => {
  
  const getActivityStatus = (threshold: number) => {
    if (aqi <= threshold) {
      return { icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, label: "Ideal", color: "text-emerald-500" };
    } else if (aqi <= threshold + 50) {
      return { icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, label: "Caution", color: "text-amber-500" };
    } else {
      return { icon: <XCircle className="h-5 w-5 text-destructive" />, label: "Avoid", color: "text-destructive" };
    }
  };

  const activities = [
    { name: 'Outdoor Running', icon: <Footprints className="h-5 w-5" />, status: getActivityStatus(50) },
    { name: 'Cycling', icon: <Bike className="h-5 w-5" />, status: getActivityStatus(80) },
    { name: 'Walking', icon: <PersonStanding className="h-5 w-5" />, status: getActivityStatus(100) },
    { name: 'Indoor Workout', icon: <Dumbbell className="h-5 w-5" />, status: { icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, label: "Ideal", color: "text-emerald-500" } },
  ];

  return (
    <GlassCard className="p-6 h-full bg-background/60 backdrop-blur-xl border-border/50">
      <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Activity Recommendations</h3>
      <div className="space-y-3">
        {activities.map((act, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="text-muted-foreground">{act.icon}</div>
              <span className="text-sm font-medium">{act.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${act.status.color}`}>
                {act.status.label}
              </span>
              {act.status.icon}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
