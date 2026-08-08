import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotificationStore } from '../store/notificationStore';
import { useNotificationsList, useMarkAllAsRead } from '../hooks/useNotifications';
import { NotificationCard } from './NotificationCard';

export function NotificationCenter() {
  const { isDrawerOpen, closeDrawer, filterUnreadOnly, setFilterUnreadOnly } = useNotificationStore();
  const { data: notifications, isLoading } = useNotificationsList(filterUnreadOnly);
  const markAllAsRead = useMarkAllAsRead();

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    if (isDrawerOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  const hasUnread = notifications?.some(n => !n.is_read);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background border-l border-border/50 shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold tracking-tight">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title="Preferences">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={closeDrawer} className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-border/50 bg-muted/10 flex items-center justify-between">
              <div className="flex bg-muted/50 p-1 rounded-lg">
                <button
                  onClick={() => setFilterUnreadOnly(false)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    !filterUnreadOnly ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterUnreadOnly(true)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    filterUnreadOnly ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Unread
                </button>
              </div>
              
              {hasUnread && !filterUnreadOnly && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isPending}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Mark all read
                </Button>
              )}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 border rounded-xl border-border/30 bg-muted/10">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="space-y-2 w-full">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                      <Skeleton className="h-3 w-[90%]" />
                      <Skeleton className="h-3 w-[60%]" />
                    </div>
                  </div>
                ))
              ) : !notifications?.length ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground">All caught up</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    You have no {filterUnreadOnly ? 'unread ' : ''}notifications at this time.
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map(notif => (
                    <NotificationCard 
                      key={notif.id} 
                      notification={notif} 
                      onCloseDrawer={closeDrawer} 
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
            
            {/* Footer */}
            {notifications && notifications.length > 0 && (
              <div className="p-4 border-t border-border/50 bg-muted/10 text-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  End of notifications
                </span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
