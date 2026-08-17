import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Save, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useHealthStore } from '../store/healthStore';
import { useUpdateHealthProfile } from '../hooks/useHealth';
import { healthProfileSchema } from '../validation/healthProfile';
import type { HealthProfileRead } from '../types/health';
import { getApiErrorMessage } from '@/utils/apiError';

interface ProfileUpdateModalProps {
  currentProfile?: HealthProfileRead;
}

export const ProfileUpdateModal = ({ currentProfile }: ProfileUpdateModalProps) => {
  const { isProfileModalOpen, setProfileModalOpen } = useHealthStore();
  const { mutateAsync: updateProfile, isPending } = useUpdateHealthProfile();

  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(healthProfileSchema),
    defaultValues: currentProfile || {}
  });

  // Reset form when currentProfile changes
  useEffect(() => {
    if (currentProfile) {
      reset(currentProfile);
    }
  }, [currentProfile, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateProfile(data);
      toast.success("Health profile updated successfully!");
      setProfileModalOpen(false);
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "Failed to update profile"));
    }
  };

  return (
    <Dialog open={isProfileModalOpen} onOpenChange={setProfileModalOpen}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-500" />
        
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold tracking-tight">Update Health Profile</DialogTitle>
          <p className="text-sm text-muted-foreground">Adjust your baseline so AI can provide personalized alerts.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6 max-h-[70vh] overflow-y-auto hide-scrollbar">
          
          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary Condition</label>
            <select 
              {...register('primary_condition')}
              className="flex h-11 w-full rounded-xl border border-border/50 bg-background/80 px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="none">None / General Wellness</option>
              <option value="asthma">Asthma</option>
              <option value="copd">COPD</option>
              <option value="heart_disease">Heart Disease</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block border-b border-border/50 pb-2">Medical Tags</label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {[
                { key: 'has_asthma', label: 'Asthma' },
                { key: 'has_copd', label: 'COPD' },
                { key: 'has_heart_disease', label: 'Heart Disease' },
                { key: 'is_elderly', label: 'Senior (65+)' },
                { key: 'is_pregnant', label: 'Pregnant' },
                { key: 'is_child', label: 'Child (<12)' },
              ].map(tag => (
                <label key={tag.key} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    {...register(tag.key as any)}
                    className="rounded border-border/50 text-primary focus:ring-primary h-4 w-4 bg-background/50"
                  />
                  <span className="text-sm group-hover:text-primary transition-colors">{tag.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block border-b border-border/50 pb-2">Notification Preferences</label>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {[
                { key: 'notif_health_alerts', label: 'Health Alerts' },
                { key: 'notif_route_recommendations', label: 'Route Advisories' },
                { key: 'notif_daily_summary', label: 'Daily Summary' },
                { key: 'notif_emergency_only', label: 'Emergency Only' },
              ].map(tag => (
                <label key={tag.key} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    {...register(tag.key as any)}
                    className="rounded border-border/50 text-primary focus:ring-primary h-4 w-4 bg-background/50"
                  />
                  <span className="text-sm group-hover:text-primary transition-colors">{tag.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/20"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Profile
              </span>
            )}
          </Button>

        </form>
      </DialogContent>
    </Dialog>
  );
};
