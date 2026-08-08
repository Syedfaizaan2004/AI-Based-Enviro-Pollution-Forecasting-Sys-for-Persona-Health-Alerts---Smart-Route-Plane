import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, ShieldAlert, CheckCircle2, Clock, Check } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useMarkNotificationRead, useOpenWeatherAlerts } from '../hooks/useHealth';
import type { NotificationResponse, HealthAdvisoryResponse } from '../types/health';
import { useEffect, useState } from 'react';

interface LiveAlertsFeedProps {
  notifications: NotificationResponse[];
  advisories: HealthAdvisoryResponse[];
}

export const LiveAlertsFeed = ({ notifications, advisories }: LiveAlertsFeedProps) => {
  const { mutate: markRead } = useMarkNotificationRead();
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  const { data: openWeatherAlerts = [] } = useOpenWeatherAlerts(location?.lat, location?.lng);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return ShieldAlert;
      case 'high': return AlertTriangle;
      case 'medium': return Bell;
      default: return CheckCircle2;
    }
  };

  return (
    <GlassCard className="p-6 bg-background/60 backdrop-blur-xl border-border/50 shadow-xl h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold tracking-tight">Live Alerts & Advisories</h2>
        
        {notifications.length > 0 && (
          <span className="ml-auto bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {notifications.length} Unread
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4 pr-1">
        <AnimatePresence>
          
          {/* Latest Advisory (Pinned to top if exists) */}
          {advisories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-1">Active Health Advisory</p>
              <p className="text-sm font-medium leading-relaxed">{advisories[0].advisory_text}</p>
            </motion.div>
          )}

          {/* OpenWeather Alerts */}
          {openWeatherAlerts.map((alert: any, idx: number) => (
            <motion.div
              key={`ow-${idx}`}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="group p-4 rounded-2xl border-2 border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-all flex gap-3 shadow-sm relative overflow-hidden"
            >
              <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border text-destructive bg-destructive/10 border-destructive/20`}>
                <AlertTriangle className="h-4 w-4 animate-pulse" />
              </div>
              
              <div className="flex-1 pr-2">
                <h4 className="text-sm font-bold mb-0.5 text-destructive">{alert.event}</h4>
                <p className="text-xs font-medium text-foreground/80 leading-relaxed mb-2 line-clamp-2">{alert.description}</p>
                
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(alert.start * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <span>• {alert.sender_name}</span>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Notifications Feed */}
          {notifications.map((notif) => {
            const Icon = getPriorityIcon(notif.priority);
            const colorClass = getPriorityColor(notif.priority);
            
            return (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group p-4 rounded-2xl border border-border/50 bg-background/50 hover:bg-background/80 transition-all flex gap-3 shadow-sm relative overflow-hidden"
              >
                <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 pr-6">
                  <h4 className="text-sm font-bold mb-0.5">{notif.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{notif.message}</p>
                  
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    {notif.aqi && <span>• AQI {notif.aqi}</span>}
                  </div>
                </div>

                <button 
                  onClick={() => markRead(notif.id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-muted"
                  title="Mark as read"
                >
                  <Check className="h-4 w-4 text-muted-foreground hover:text-emerald-500 transition-colors" />
                </button>
              </motion.div>
            );
          })}

          {notifications.length === 0 && advisories.length === 0 && openWeatherAlerts.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="h-40 flex flex-col items-center justify-center text-muted-foreground"
            >
              <CheckCircle2 className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">You're all caught up!</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </GlassCard>
  );
};
