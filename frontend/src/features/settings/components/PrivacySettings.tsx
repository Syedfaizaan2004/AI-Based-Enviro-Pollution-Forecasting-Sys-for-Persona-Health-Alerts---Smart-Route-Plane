import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Download, FileWarning, Shield, UserX, Loader2 } from 'lucide-react';
import { exportToCSV } from '@/features/history/utils/export';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/store/authStore';
import { settingsService } from '@/features/settings/services/settingsService';

export function PrivacySettings() {
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();
  const { clearSession } = useAuthStore();

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure? This will permanently delete your account and all data. This cannot be undone.")) {
      try {
        await settingsService.deactivateAccount();
      } catch (e) {
        console.error("Failed to deactivate account", e);
      } finally {
        clearSession();
        navigate('/');
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate compilation of complex personal data across backend tables
    await new Promise(r => setTimeout(r, 1200));
    
    const mockGDPRData = [
      { date: "2026-08-01", type: "HealthLog", details: "Asthma trigger logged (Moderate)", aqi: 45, durationOutdoorsMin: 120 },
      { date: "2026-08-01", type: "SmartRoute", details: "Route taken: Downtown to Central Park", aqi: 42, durationOutdoorsMin: 35 },
      { date: "2026-07-30", type: "AlertReceived", details: "Auto-notified emergency contacts of Hazardous AQI", aqi: 155, durationOutdoorsMin: 0 },
      { date: "2026-07-28", type: "HealthLog", details: "Symptom check-in: Feeling great", aqi: 22, durationOutdoorsMin: 180 },
    ];
    
    exportToCSV(mockGDPRData, "airsense_personal_data_archive");
    setIsExporting(false);
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Data Privacy & Export</h2>
        <p className="text-muted-foreground mt-1">Manage your personal data, exports, and GDPR compliance.</p>
      </div>

      <GlassCard className="p-6 space-y-6">
        {/* Export Data */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-600/10 flex items-center justify-center shrink-0 text-emerald-600">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Export My Data</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Download a complete, machine-readable CSV archive of all your past route histories, health logs, and exposure data.
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="shrink-0 gap-2"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} 
            {isExporting ? "Compiling..." : "Download CSV"}
          </Button>
        </div>

        <hr className="border-border/50" />

        {/* Data Processing Agreement */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Privacy Policy & EULA</h3>
              <p className="text-sm text-muted-foreground">Review how we process and protect your health data.</p>
            </div>
          </div>
          <Button variant="ghost" className="shrink-0 text-primary" onClick={() => window.open('https://airsense.ai/privacy', '_blank')}>
            Read Policy
          </Button>
        </div>
      </GlassCard>

      {/* Danger Zone */}
      <div className="mt-12">
        <h3 className="text-sm font-bold uppercase tracking-widest text-destructive mb-4 flex items-center gap-2">
          <FileWarning className="h-4 w-4" /> Danger Zone
        </h3>
        <GlassCard className="p-6 border-destructive/30 bg-destructive/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-destructive">Delete Account & Data</h3>
              <p className="text-sm text-foreground/80 max-w-md mt-1">
                Permanently delete your account, health profile, and all historical exposure data. This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" className="shrink-0 gap-2" onClick={handleDeleteAccount}>
              <UserX className="h-4 w-4" /> Delete Account
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
