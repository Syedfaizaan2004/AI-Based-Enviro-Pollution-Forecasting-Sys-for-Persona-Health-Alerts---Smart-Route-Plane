import { formatDistanceToNow, parseISO } from 'date-fns';
import { ShieldAlert, AlertTriangle, Info, Bell, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import type { Alert } from '@/features/dashboard/types/dashboard';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';

const getSeverityConfig = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical':
      return { icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10' };
    case 'high':
      return { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' };
    case 'info':
    case 'medium':
      return { icon: Info, color: 'text-sky-400', bg: 'bg-sky-500/10' };
    default:
      return { icon: Bell, color: 'text-primary', bg: 'bg-primary/10' };
  }
};

export const RecentAlerts = ({ alerts }: { alerts: Alert[] }) => {
  const toggleDrawer = useNotificationStore((state) => state.toggleDrawer);
  const recentAlerts = alerts.slice(0, 5); // Show only top 5

  return (
    <GlassCard className="p-6 group hover:bg-card/80">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-1">Recent Alerts</h3>
          <p className="text-xs text-muted-foreground">Latest system notifications</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {recentAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mb-3 opacity-20" />
            <p className="text-sm">No recent alerts</p>
            <p className="text-xs opacity-70 mt-1">You currently have no high-risk pollution alerts.</p>
          </div>
        ) : (
          recentAlerts.map((alert) => {
            const { icon: Icon, color, bg } = getSeverityConfig(alert.priority);
            return (
              <div 
                key={alert.id} 
                className={`p-4 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors border-l-2 border-l-primary/30`}
              >
                <div className="flex gap-3">
                  <div className={`p-2 h-fit rounded-lg ${bg} ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground mb-1 truncate capitalize">{alert.type} Alert</p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 font-medium mt-2">
                      {formatDistanceToNow(parseISO(alert.time), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Button 
        variant="ghost" 
        className="w-full mt-4 text-xs font-semibold text-muted-foreground hover:text-foreground"
        onClick={toggleDrawer}
      >
        View All Notifications
      </Button>
    </GlassCard>
  );
};
