import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useHealthProfile } from '@/features/health/hooks/useHealth';
import { GlassCard } from '@/components/ui/glass-card';
import { Activity, Shield, MapPin, Award, Leaf, Droplets, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

export function Profile() {
  const { user } = useAuthStore();
  const { data: healthProfile } = useHealthProfile();
  const navigate = useNavigate();

  const getArchetype = () => {
    if (healthProfile?.has_asthma) return "Asthma Warrior";
    if (healthProfile?.has_copd) return "Respiratory Guard";
    if (healthProfile?.is_elderly) return "Wise Traveler";
    return "Clean Air Advocate";
  };

  const getArchetypeColor = () => {
    if (healthProfile?.has_asthma) return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    if (healthProfile?.has_copd) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-12 relative z-0 overflow-x-hidden">
      {/* Ambient Background Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <div className="px-4 md:px-6 lg:px-8 pt-12 pb-8">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            {/* Glowing Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-secondary blur-md opacity-50 animate-pulse" />
            <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary to-secondary p-1">
              <div className="h-full w-full rounded-full bg-background flex items-center justify-center border-4 border-background">
                <span className="text-4xl font-black text-primary">{user?.fullName?.charAt(0) || 'U'}</span>
              </div>
            </div>
            
            <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-background rounded-full flex items-center justify-center shadow-lg border border-border/50">
              <Shield className="h-5 w-5 text-primary" />
            </div>
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">{user?.fullName || 'User'}</h1>
            <p className="text-lg text-muted-foreground">{user?.email}</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase border ${getArchetypeColor()}`}>
                {getArchetype()}
              </span>
              <span className="text-sm font-medium text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full border border-border/50">
                Joined Aug 2026
              </span>
            </div>
          </div>
          
          <Button variant="outline" className="mt-4 gap-2 rounded-full px-6" onClick={() => navigate('/settings')}>
            Edit Settings <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 flex flex-col items-center text-center justify-center space-y-3 group hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">12</p>
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-1">Clean Routes</p>
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col items-center text-center justify-center space-y-3 group hover:border-blue-500/50 transition-colors">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Droplets className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">480</p>
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-1">Pollutants Avoided</p>
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col items-center text-center justify-center space-y-3 group hover:border-amber-500/50 transition-colors">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">3 Days</p>
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-1">Clean Air Streak</p>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Badges Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" /> Achievements
            </h3>
            <GlassCard className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center text-center p-4 rounded-xl border border-border/50 bg-background/50 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary p-1 mb-3">
                    <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h4 className="font-bold text-foreground">First Route</h4>
                  <p className="text-xs text-muted-foreground mt-1">Navigated your first clean route.</p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 rounded-xl border border-border/50 bg-background/50 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-1 mb-3">
                    <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
                      <Shield className="h-6 w-6 text-indigo-500" />
                    </div>
                  </div>
                  <h4 className="font-bold text-foreground">Data Guardian</h4>
                  <p className="text-xs text-muted-foreground mt-1">Configured GDPR privacy settings.</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Timeline Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" /> Recent Activity
            </h3>
            <GlassCard className="p-6 relative">
              <div className="absolute left-9 top-6 bottom-6 w-px bg-border/50" />
              
              <div className="space-y-6 relative">
                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-primary/20 border-2 border-background ring-2 ring-primary flex items-center justify-center shrink-0 z-10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="pt-0.5">
                    <p className="font-semibold text-foreground text-sm">Navigated to Central Park</p>
                    <p className="text-xs text-muted-foreground mt-1">Avoided 35% more PM2.5 than the standard route.</p>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mt-2 block">2 hours ago</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-rose-500/20 border-2 border-background ring-2 ring-rose-500 flex items-center justify-center shrink-0 z-10">
                    <div className="h-2 w-2 rounded-full bg-rose-500" />
                  </div>
                  <div className="pt-0.5">
                    <p className="font-semibold text-foreground text-sm">Hazardous AQI Alert</p>
                    <p className="text-xs text-muted-foreground mt-1">Auto-notified emergency contacts.</p>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mt-2 block">Yesterday</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-blue-500/20 border-2 border-background ring-2 ring-blue-500 flex items-center justify-center shrink-0 z-10">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  </div>
                  <div className="pt-0.5">
                    <p className="font-semibold text-foreground text-sm">Profile Configured</p>
                    <p className="text-xs text-muted-foreground mt-1">Completed health and preference setup.</p>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mt-2 block">Aug 2026</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
