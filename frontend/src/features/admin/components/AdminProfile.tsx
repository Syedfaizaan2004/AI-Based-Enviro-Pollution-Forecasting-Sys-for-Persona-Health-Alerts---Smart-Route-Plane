import { useAuthStore } from '@/store/authStore';
import { GlassCard } from '@/components/ui/glass-card';
import { ShieldAlert, Mail, User, Shield } from 'lucide-react';

export function AdminProfile() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-3xl">
      <h3 className="text-xl font-bold tracking-tight mb-4">Admin Profile</h3>
      
      <GlassCard className="p-8 border-primary/20 bg-background/40">
        <div className="flex flex-col md:flex-row items-start gap-8">
          
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30 shadow-inner">
              <ShieldAlert className="h-10 w-10 text-primary" />
            </div>
            <div className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {user?.role || 'Administrator'}
            </div>
          </div>

          <div className="flex-1 space-y-6 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground/90 uppercase flex items-center gap-2">
                  <User className="h-3.5 w-3.5" /> Full Name
                </label>
                <div className="text-base font-medium text-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
                  {user?.fullName || 'System Administrator'}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground/90 uppercase flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> Email Address
                </label>
                <div className="text-base font-medium text-foreground bg-muted/30 p-3 rounded-lg border border-border/50 truncate">
                  {user?.email || 'admin@airsense.ai'}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground/90 uppercase flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" /> Security Clearance
                </label>
                <div className="text-base font-medium text-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
                  Level 5 (Global Read/Write)
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/40">
              <h4 className="text-sm font-semibold mb-3">Admin Privileges</h4>
              <ul className="text-sm text-foreground/90 space-y-2 list-disc list-inside">
                <li>Can manage all user accounts and roles</li>
                <li>Can publish and edit Global Health Advisories</li>
                <li>Can view system-wide API and Notification logs</li>
                <li>Can reset system caches and ML model state</li>
              </ul>
            </div>
          </div>

        </div>
      </GlassCard>
    </div>
  );
}
