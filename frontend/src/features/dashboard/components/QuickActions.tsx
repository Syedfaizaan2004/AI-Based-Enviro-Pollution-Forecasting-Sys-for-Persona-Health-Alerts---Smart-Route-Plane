import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Activity, Map as MapIcon, History, Download, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router';

export const QuickActions = () => {
  const navigate = useNavigate();
  
  return (
    <GlassCard className="p-6 group hover:bg-card/80">
      <div className="mb-6">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-1">Quick Actions</h3>
        <p className="text-xs text-muted-foreground">Shortcuts to common tasks</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => navigate('/prediction')} className="h-24 flex-col gap-3 group/btn bg-muted/20 border-border/40 hover:border-primary/50 hover:bg-primary/5" variant="outline">
          <Activity className="h-5 w-5 text-primary group-hover/btn:scale-110 transition-transform" />
          <span className="text-xs font-semibold">Predict AQI</span>
        </Button>
        <Button onClick={() => navigate('/routes')} className="h-24 flex-col gap-3 group/btn bg-muted/20 border-border/40 hover:border-secondary/50 hover:bg-secondary/5" variant="outline">
          <MapIcon className="h-5 w-5 text-secondary group-hover/btn:scale-110 transition-transform" />
          <span className="text-xs font-semibold">Smart Route</span>
        </Button>
        <Button onClick={() => navigate('/history')} className="h-24 flex-col gap-3 group/btn bg-muted/20 border-border/40 hover:border-emerald-500/50 hover:bg-emerald-500/5" variant="outline">
          <History className="h-5 w-5 text-emerald-500 group-hover/btn:scale-110 transition-transform" />
          <span className="text-xs font-semibold">View History</span>
        </Button>
        <Button className="h-24 flex-col gap-3 group/btn bg-muted/20 border-border/40 hover:border-amber-500/50 hover:bg-amber-500/5" variant="outline">
          <Download className="h-5 w-5 text-amber-500 group-hover/btn:scale-110 transition-transform" />
          <span className="text-xs font-semibold">Report</span>
        </Button>
        <Button onClick={() => navigate('/settings')} className="h-24 flex-col gap-3 group/btn bg-muted/20 border-border/40 hover:border-emerald-500/50 hover:bg-emerald-500/5" variant="outline">
          <UserCircle className="h-5 w-5 text-emerald-500 group-hover/btn:scale-110 transition-transform" />
          <span className="text-xs font-semibold">Profile</span>
        </Button>
      </div>
    </GlassCard>
  );
};
