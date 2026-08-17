import { Route, ArrowRight, ShieldCheck } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

export const SmartCommuteSnapshot = () => {
  const navigate = useNavigate();

  return (
    <GlassCard className="p-6 group hover:bg-card/80">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-1">Smart Commute</h3>
          <p className="text-xs text-muted-foreground">Default Route Status</p>
        </div>
        <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-green-400 shadow-sm">
          <Route className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1">
          <p className="text-sm font-bold tracking-tight text-foreground">Home</p>
          <p className="text-[10px] text-muted-foreground uppercase">Departure</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1 text-right">
          <p className="text-sm font-bold tracking-tight text-foreground">Work</p>
          <p className="text-[10px] text-muted-foreground uppercase">Destination</p>
        </div>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-3 mb-5">
        <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-400 mb-0.5">Route is Safe</p>
          <p className="text-xs text-emerald-500/80">Average AQI is 45 (Good) along this route. No detours needed.</p>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full justify-center gap-2 border-border/50 hover:bg-background/50"
        onClick={() => navigate('/routes')}
      >
        <Route className="h-4 w-4" />
        Plan New Route
      </Button>
    </GlassCard>
  );
};
