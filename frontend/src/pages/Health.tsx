import { motion } from 'framer-motion';
import { 
  useHealthProfile, 
  useHealthSummary, 
  useLatestAdvisories, 
  useUnreadNotifications 
} from '@/features/health/hooks/useHealth';
import { HealthOverview } from '@/features/health/components/HealthOverview';
import { HealthProfileCard } from '@/features/health/components/HealthProfileCard';
import { ProfileUpdateModal } from '@/features/health/components/ProfileUpdateModal';
import { LiveAlertsFeed } from '@/features/health/components/LiveAlertsFeed';
import { ExposureAnalyticsChart } from '@/features/health/components/ExposureAnalyticsChart';
import { SafeOutdoorWindow } from '@/features/health/components/SafeOutdoorWindow';
import { HealthDashboardSkeleton } from '@/features/health/components/HealthDashboardSkeleton';
import { AIHealthCoach } from '@/features/health/components/AIHealthCoach';
import { ExposureRings } from '@/features/health/components/ExposureRings';
import { ActivityPlanner } from '@/features/health/components/ActivityPlanner';
import { CigaretteEquivalent } from '@/features/health/components/CigaretteEquivalent';
import { PollutionAvoided } from '@/features/health/components/PollutionAvoided';
import { WellnessDefense } from '@/features/health/components/WellnessDefense';
import { SymptomLogger } from '@/features/health/components/SymptomLogger';
import { HeartPulse } from 'lucide-react';

export const Health = () => {
  const { data: profile, isLoading: isProfileLoading } = useHealthProfile();
  const { data: summary, isLoading: isSummaryLoading } = useHealthSummary();
  const { data: notifications = [], isLoading: isNotificationsLoading } = useUnreadNotifications();
  const { data: advisories = [], isLoading: isAdvisoriesLoading } = useLatestAdvisories();

  const isLoading = isProfileLoading || isSummaryLoading || isNotificationsLoading || isAdvisoriesLoading;

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-muted/20 relative z-0">
        <HealthDashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-12 relative z-0 overflow-x-hidden">
      
      {/* Ambient Background Glows */}
      <div className="fixed top-0 left-0 w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2" />

      {/* Page Header */}
      <div className="px-4 md:px-6 lg:px-8 py-8 border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4 max-w-[1920px] mx-auto">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg shadow-primary/25">
            <HeartPulse className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Health & Wellness</h1>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">Personalized insights based on your respiratory profile.</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8">
        
        {/* Top: AI Health Coach Banner */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <AIHealthCoach summary={summary} profile={profile} />
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* Bento Row 1: High Impact Metrics (4 + 4 + 4) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-4 group hover:-translate-y-1 transition-transform duration-300"
          >
            <ExposureRings pm25={summary?.exposure?.daily_exposure || 15} pm10={summary?.exposure?.daily_exposure ? summary.exposure.daily_exposure * 2.5 : 35} />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4 group hover:-translate-y-1 transition-transform duration-300"
          >
            <CigaretteEquivalent pm25={summary?.exposure?.daily_exposure || 15} />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-4 group hover:-translate-y-1 transition-transform duration-300"
          >
            <PollutionAvoided avoidedPercentage={(summary?.exposure as any)?.pollution_avoided_percentage ?? 32} />
          </motion.div>

          {/* Bento Row 2: Analytics & Actions (8 + 4) */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              {summary && <HealthOverview summary={summary} />}
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <ExposureAnalyticsChart />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <SafeOutdoorWindow exposure={summary?.exposure} />
            </motion.div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <ActivityPlanner aqi={summary?.exposure?.daily_exposure || 45} />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <WellnessDefense aqi={summary?.exposure?.daily_exposure || 45} />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <SymptomLogger />
            </motion.div>
          </div>

          {/* Bento Row 3: Profile & Feed (6 + 6) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}
            className="lg:col-span-6"
          >
            <HealthProfileCard profile={profile} />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }}
            className="lg:col-span-6 h-[400px]"
          >
            <LiveAlertsFeed notifications={notifications} advisories={advisories} />
          </motion.div>

        </div>
      </div>

      {/* Hidden Modals */}
      <ProfileUpdateModal currentProfile={profile} />
    </div>
  );
};
