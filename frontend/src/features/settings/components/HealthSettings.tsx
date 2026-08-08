import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { HeartPulse, Stethoscope } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useHealthProfile, useUpdateHealthProfile } from '../hooks/useSettings';
import type { HealthProfileUpdate } from '../types/settings';

export function HealthSettings() {
  const { data: profile, isLoading } = useHealthProfile();
  const updateProfile = useUpdateHealthProfile();

  const { register, handleSubmit, reset } = useForm<HealthProfileUpdate>({
    defaultValues: profile || {}
  });

  useEffect(() => {
    if (profile) {
      reset(profile);
    }
  }, [profile, reset]);

  const onSubmit = (data: HealthProfileUpdate) => {
    updateProfile.mutate(data);
  };

  if (isLoading || !profile) return null;

  const conditions = [
    { key: 'has_asthma', label: 'Asthma' },
    { key: 'has_copd', label: 'COPD' },
    { key: 'has_heart_disease', label: 'Heart Disease' },
    { key: 'is_elderly', label: 'Senior Citizen (65+)' },
    { key: 'is_pregnant', label: 'Pregnant' },
    { key: 'is_child', label: 'Children in Household' },
  ] as const;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <HeartPulse className="h-5 w-5 text-rose-500" />
        <h3 className="text-lg font-semibold">Health & Medical Profile</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        This information is strictly used to customize AQI alerts and personalize smart route recommendations.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
            Primary Condition
          </label>
          <select 
            {...register('primary_condition')}
            className="w-full max-w-md bg-background border border-border/50 rounded-lg p-2.5 text-sm focus:ring-primary focus:border-primary"
          >
            <option value="none">None</option>
            <option value="asthma">Asthma</option>
            <option value="copd">COPD</option>
            <option value="heart_disease">Heart Disease</option>
            <option value="elderly">Elderly</option>
            <option value="children">Children</option>
            <option value="pregnant">Pregnant</option>
          </select>
        </div>

        <div className="w-full h-px bg-border/50" />

        <div className="space-y-4">
          <label className="text-sm font-medium">Health Risk Factors</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {conditions.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border/30">
                <input
                  type="checkbox"
                  id={key}
                  {...register(key)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-background"
                />
                <label htmlFor={key} className="text-sm font-medium leading-none cursor-pointer">
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-border/50 flex justify-end">
          <Button 
            type="submit" 
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Health Profile'}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
