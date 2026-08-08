import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SlidersHorizontal, Globe, Map, Route } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotificationPreferences } from '@/features/notifications/hooks/useNotifications';
import { settingsService } from '../services/settingsService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationKeys } from '@/features/notifications/hooks/useNotifications';
import type { UserPreferencesUpdate } from '@/features/notifications/types/notification';
import { useTheme } from '@/store/themeStore';
import { LANGUAGE_OPTIONS, LANGUAGE_STORAGE_KEY, normalizeLanguageCode } from '@/constants/languages';

export function PreferencesSettings() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const queryClient = useQueryClient();
  const { setTheme } = useTheme();

  const updatePrefs = useMutation({
    mutationFn: (data: UserPreferencesUpdate) => settingsService.updatePreferences(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences });
      if (data.preferred_theme) {
        setTheme(data.preferred_theme as 'light' | 'dark' | 'system');
      }
      if (variables.preferred_language) {
        const preferredLanguage = normalizeLanguageCode(variables.preferred_language);
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, preferredLanguage);
        import('@/i18n/config').then((i18nModule) => {
          i18nModule.default.changeLanguage(preferredLanguage);
        });
      }
    },
  });

  const { register, handleSubmit, reset } = useForm<UserPreferencesUpdate>({
    defaultValues: (preferences as any) || {}
  });

  useEffect(() => {
    if (preferences) {
      reset({
        preferred_language: normalizeLanguageCode(preferences.preferred_language),
        preferred_theme: preferences.preferred_theme,
        preferred_aqi_unit: preferences.preferred_aqi_unit,
        travel_preference: preferences.travel_preference as any,
        aqi_threshold: preferences.aqi_threshold || undefined,
      });
    }
  }, [preferences, reset]);

  const onSubmit = (data: UserPreferencesUpdate) => {
    updatePrefs.mutate({
      ...data,
      aqi_threshold: data.aqi_threshold ? Number(data.aqi_threshold) : undefined
    });
  };

  if (isLoading || !preferences) return null;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <SlidersHorizontal className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">General Preferences</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Language & Region
            </label>
            <select 
              {...register('preferred_language')}
              data-no-translate
              className="w-full bg-background border border-border/50 rounded-lg p-2.5 text-sm focus:ring-primary focus:border-primary"
            >
              {LANGUAGE_OPTIONS.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Appearance</label>
            <select 
              {...register('preferred_theme')}
              className="w-full bg-background border border-border/50 rounded-lg p-2.5 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="system">System Default</option>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Map className="h-4 w-4 text-muted-foreground" />
              AQI Standard
            </label>
            <select 
              {...register('preferred_aqi_unit')}
              className="w-full bg-background border border-border/50 rounded-lg p-2.5 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="us-epa">US EPA (Default)</option>
              <option value="eea">EEA (Europe)</option>
              <option value="cpcb">CPCB (India)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Route className="h-4 w-4 text-muted-foreground" />
              Smart Route Default
            </label>
            <select 
              {...register('travel_preference')}
              className="w-full bg-background border border-border/50 rounded-lg p-2.5 text-sm focus:ring-primary focus:border-primary"
            >
              <option value="balanced">Balanced (Recommended)</option>
              <option value="safest">Safest (Lowest Pollution)</option>
              <option value="fastest">Fastest (Shortest Distance)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Custom AQI Alert Threshold</label>
            <Input 
              type="number"
              {...register('aqi_threshold')}
              placeholder="e.g. 100"
              min={0}
              max={500}
            />
            <p className="text-xs text-muted-foreground">
              Override the default threshold for dangerous AQI alerts. Leave empty to use system defaults based on your health profile.
            </p>
          </div>

        </div>

        <div className="pt-4 border-t border-border/50 flex justify-end">
          <Button 
            type="submit" 
            disabled={updatePrefs.isPending}
          >
            {updatePrefs.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
