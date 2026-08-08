import { useState } from 'react';
import { format } from 'date-fns';
import { Bell, Mail, Smartphone, AlertTriangle, CheckCircle2, Megaphone } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useNotificationLogs } from '../hooks/useAdmin';
import { SendNotificationModal } from './SendNotificationModal';

export function NotificationLogsTable() {
  const [page, setPage] = useState(0);
  const limit = 15;
  const { data, isLoading } = useNotificationLogs(page * limit, limit);
  const [showBroadcast, setShowBroadcast] = useState(false);

  const handleNext = () => setPage((p) => p + 1);
  const handlePrev = () => setPage((p) => Math.max(0, p - 1));

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-muted/20 rounded-xl" />;
  }

  const logs = data?.notifications || [];
  const total = data?.total || 0;
  const maxPage = Math.ceil(total / limit) - 1;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'health_alert': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'emergency': return <Smartphone className="h-4 w-4 text-emerald-500" />;
      default: return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <GlassCard className="overflow-hidden">
      <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Notification Delivery Center</h3>
            <p className="text-sm text-foreground/90 mt-1">Track and monitor all system alerts sent to users.</p>
          </div>
        </div>
        <Button onClick={() => setShowBroadcast(true)} className="gap-2 bg-indigo-500 hover:bg-indigo-600 text-white">
          <Megaphone className="h-4 w-4" />
          Broadcast Alert
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-foreground/90 uppercase bg-muted/30">
            <tr>
              <th className="px-6 py-4 font-medium">Sent At</th>
              <th className="px-6 py-4 font-medium">User Email</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Message</th>
              <th className="px-6 py-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 text-foreground/90 whitespace-nowrap text-xs font-mono">
                  {format(new Date(log.created_at), 'MM/dd HH:mm')}
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium">{log.user_email}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(log.notification_type)}
                    <span className="capitalize text-xs">{log.notification_type.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-md">
                  <div className="truncate font-semibold text-foreground">{log.title}</div>
                  <div className="truncate text-xs text-foreground/90 mt-0.5">{log.message}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {log.is_read ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-500 text-xs font-medium">Read</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-amber-500 text-xs font-medium">Unread</span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-foreground/90 text-sm">
                  No notifications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border/50 flex items-center justify-between">
        <p className="text-sm text-foreground/90">
          Showing {logs.length > 0 ? page * limit + 1 : 0} to {Math.min((page + 1) * limit, total)} of {total} notifications
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrev} disabled={page === 0}>
            Newer
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext} disabled={page >= maxPage}>
            Older
          </Button>
        </div>
      </div>

      {showBroadcast && (
        <SendNotificationModal
          isOpen={showBroadcast}
          onClose={() => setShowBroadcast(false)}
          userId="broadcast"
          userEmail="broadcast"
        />
      )}
    </GlassCard>
  );
}
