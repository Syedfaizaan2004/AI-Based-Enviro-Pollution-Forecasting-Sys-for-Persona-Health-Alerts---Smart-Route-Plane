import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  HeartPulse, 
  Map, 
  AlertTriangle, 
  Info, 
  CalendarDays, 
  AlertOctagon,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMarkAsRead, useDeleteNotification } from '../hooks/useNotifications';
import type { NotificationResponse, NotificationType } from '../types/notification';
import { useNavigate } from 'react-router';

interface NotificationCardProps {
  notification: NotificationResponse;
  onCloseDrawer?: () => void;
}

const typeConfig: Record<NotificationType, { icon: any; color: string; bg: string }> = {
  health_alert: { icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  route_recommendation: { icon: Map, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  system_alert: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  daily_summary: { icon: CalendarDays, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  weekly_summary: { icon: CalendarDays, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  emergency: { icon: AlertOctagon, color: 'text-destructive', bg: 'bg-destructive/10' },
};

const priorityConfig: Record<string, { icon: any; color: string }> = {
  Critical: { icon: AlertOctagon, color: 'text-destructive' },
  High: { icon: AlertTriangle, color: 'text-orange-500' },
  Medium: { icon: Info, color: 'text-yellow-500' },
  Low: { icon: CheckCircle2, color: 'text-muted-foreground' },
};

export function NotificationCard({ notification, onCloseDrawer }: NotificationCardProps) {
  const markAsRead = useMarkAsRead();
  const deleteNotif = useDeleteNotification();
  const navigate = useNavigate();

  const config = typeConfig[notification.notification_type] || typeConfig.system_alert;
  const prioConfig = priorityConfig[notification.priority] || priorityConfig.Low;
  const Icon = config.icon;
  const PriorityIcon = prioConfig.icon;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.related_route_id) {
      navigate('/routes');
      onCloseDrawer?.();
    } else if (notification.related_prediction_id) {
      navigate('/prediction');
      onCloseDrawer?.();
    } else if (notification.notification_type === 'health_alert' || notification.notification_type === 'emergency') {
      navigate('/health');
      onCloseDrawer?.();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative flex gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
        notification.is_read 
          ? 'bg-background/40 border-border/30 hover:bg-muted/30' 
          : 'bg-background border-border/80 shadow-md shadow-primary/5 hover:border-primary/30'
      }`}
      onClick={handleActionClick}
    >
      {/* Unread Indicator */}
      {!notification.is_read && (
        <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 h-3 w-3 bg-primary rounded-full ring-4 ring-background shadow-sm" />
      )}

      {/* Icon Area */}
      <div className={`mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${config.bg} ${config.color}`}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className={`text-sm font-semibold truncate ${notification.is_read ? 'text-foreground/80' : 'text-foreground'}`}>
            {notification.title}
          </h4>
          <span className="text-[10px] whitespace-nowrap text-muted-foreground pt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
        
        <p className={`text-xs line-clamp-2 ${notification.is_read ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
          {notification.message}
        </p>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-2 pt-1">
          {notification.priority !== 'Low' && (
            <div className={`flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted/50 ${prioConfig.color}`}>
              <PriorityIcon className="h-3 w-3 mr-1" />
              {notification.priority}
            </div>
          )}
          
          {notification.health_risk && (
            <div className="flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted/50 text-rose-500">
              Risk: {notification.health_risk}
            </div>
          )}

          {notification.aqi && (
            <div className="flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted/50 text-blue-500">
              AQI: {Math.round(notification.aqi)}
            </div>
          )}
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-background/90 backdrop-blur-sm rounded-lg border border-border/50 shadow-sm">
        {!notification.is_read && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              markAsRead.mutate(notification.id);
            }}
            title="Mark as read"
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
            deleteNotif.mutate(notification.id);
          }}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
