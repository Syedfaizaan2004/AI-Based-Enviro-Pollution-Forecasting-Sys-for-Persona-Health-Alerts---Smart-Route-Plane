import { Heart, Activity, AlertCircle, Edit3 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useHealthStore } from '../store/healthStore';
import type { HealthProfileRead } from '../types/health';

interface HealthProfileCardProps {
  profile?: HealthProfileRead;
}

export const HealthProfileCard = ({ profile }: HealthProfileCardProps) => {
  const { setProfileModalOpen } = useHealthStore();

  if (!profile) return null;

  const conditions = [
    { key: 'has_asthma', label: 'Asthma', icon: Wind, active: profile.has_asthma },
    { key: 'has_copd', label: 'COPD', icon: Activity, active: profile.has_copd },
    { key: 'has_heart_disease', label: 'Heart Disease', icon: Heart, active: profile.has_heart_disease },
    { key: 'is_elderly', label: 'Senior', icon: AlertCircle, active: profile.is_elderly },
    { key: 'is_pregnant', label: 'Pregnant', icon: Heart, active: profile.is_pregnant },
    { key: 'is_child', label: 'Child', icon: Activity, active: profile.is_child },
  ].filter(c => c.active);

  return (
    <GlassCard className="p-6 bg-background/60 backdrop-blur-xl border-border/50 shadow-xl h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Personal Profile</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">AI Baseline Data</p>
          </div>
        </div>
        
        <Button variant="outline" size="sm" onClick={() => setProfileModalOpen(true)} className="gap-1.5 h-8">
          <Edit3 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Update</span>
        </Button>
      </div>

      <div className="flex-1 space-y-6">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Primary Condition</label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm font-medium">
            <Activity className="h-4 w-4 text-primary" />
            {profile.primary_condition || 'None'}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Medical Tags</label>
          {conditions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {conditions.map(c => (
                <div key={c.key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                  {c.label}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No specific medical tags active.</p>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

// Mocking Wind icon since it wasn't imported above, though it is usually in lucide-react. Let's fix that.
import { Wind } from 'lucide-react';
