import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Settings, BellRing, ShieldAlert } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useNotificationPreferences, useUpdatePreferences } from '@/features/notifications/hooks/useNotifications';
import type { UserPreferencesUpdate } from '@/features/notifications/types/notification';

export function NotificationPreferences() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePrefs = useUpdatePreferences();

  const { register, handleSubmit, reset } = useForm<UserPreferencesUpdate>({
    defaultValues: (preferences as any) || {}
  });

  useEffect(() => {
    if (preferences) {
      reset({
        preferred_notification_method: preferences.preferred_notification_method,
        notif_aqi_alerts: preferences.notif_aqi_alerts
      });
    }
  }, [preferences, reset]);

  const onSubmit = (data: UserPreferencesUpdate) => {
    updatePrefs.mutate(data);
  };

  if (isLoading || !preferences) return null;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Notification Preferences</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          
          {/* Method Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <BellRing className="h-4 w-4 text-muted-foreground" />
              Primary Delivery Method
            </label>
            <select 
              {...register('preferred_notification_method')}
              className="w-full bg-background border border-border/50 rounded-lg p-2.5 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="push">Push Notifications (Web)</option>
              <option value="email">Email Summary</option>
              <option value="sms">SMS Alerts</option>
              <option value="none">Do Not Disturb (None)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Choose how you want to receive critical alerts.
            </p>
          </div>

          <div className="w-full h-px bg-border/50" />

          {/* AQI Alerts Toggle */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                Air Quality Warnings
              </label>
              <p className="text-xs text-muted-foreground">
                Receive immediate alerts when AQI in your saved locations exceeds hazardous thresholds.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input 
                type="checkbox" 
                {...register('notif_aqi_alerts')}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

        </div>

        <div className="pt-4 border-t border-border/50 flex justify-end">
          <Button 
            type="submit" 
            disabled={updatePrefs.isPending}
            className="w-full sm:w-auto"
          >
            {updatePrefs.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
