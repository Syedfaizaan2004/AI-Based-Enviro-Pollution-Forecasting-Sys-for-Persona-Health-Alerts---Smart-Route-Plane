import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Activity, Watch, Wind, CheckCircle2 } from 'lucide-react';

export function ConnectedAppsSettings() {
  const [apps, setApps] = useState<{
    appleHealth: boolean;
    googleFit: boolean;
    smartPurifier: boolean;
  }>(() => {
    const saved = localStorage.getItem('airsense_connected_apps');
    if (saved) return JSON.parse(saved);
    return {
      appleHealth: false,
      googleFit: false,
      smartPurifier: true
    };
  });

  useEffect(() => {
    localStorage.setItem('airsense_connected_apps', JSON.stringify(apps));
  }, [apps]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Connected Apps & Devices</h2>
        <p className="text-muted-foreground mt-1">Integrate external devices for smarter health recommendations.</p>
      </div>

      <GlassCard className="p-6 space-y-6">
        {/* Apple Health */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Apple Health</h3>
              <p className="text-sm text-muted-foreground">Sync daily outdoor activity and respiratory rates.</p>
            </div>
          </div>
          <Button 
            variant={apps.appleHealth ? "default" : "outline"}
            onClick={() => setApps(s => ({...s, appleHealth: !s.appleHealth}))}
            className={apps.appleHealth ? "bg-rose-500 hover:bg-rose-600 text-white" : ""}
          >
            {apps.appleHealth ? <><CheckCircle2 className="h-4 w-4 mr-2"/> Connected</> : "Connect"}
          </Button>
        </div>

        <hr className="border-border/50" />

        {/* Google Fit */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Watch className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Google Fit</h3>
              <p className="text-sm text-muted-foreground">Sync step count and heart rate data.</p>
            </div>
          </div>
          <Button 
            variant={apps.googleFit ? "default" : "outline"}
            onClick={() => setApps(s => ({...s, googleFit: !s.googleFit}))}
            className={apps.googleFit ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
          >
            {apps.googleFit ? <><CheckCircle2 className="h-4 w-4 mr-2"/> Connected</> : "Connect"}
          </Button>
        </div>

        <hr className="border-border/50" />

        {/* Smart Purifier */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Wind className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Smart Air Purifier (IoT)</h3>
              <p className="text-sm text-muted-foreground">Auto-activate home purifier when outdoor AQI is Hazardous.</p>
            </div>
          </div>
          <Button 
            variant={apps.smartPurifier ? "default" : "outline"}
            onClick={() => setApps(s => ({...s, smartPurifier: !s.smartPurifier}))}
            className={apps.smartPurifier ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
          >
            {apps.smartPurifier ? <><CheckCircle2 className="h-4 w-4 mr-2"/> Connected</> : "Connect"}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
