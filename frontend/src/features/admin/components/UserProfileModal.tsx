import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Map, User } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useUserDetails } from '../hooks/useAdmin';

interface UserProfileModalProps {
  userId: string | null;
  onClose: () => void;
}

export function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const { data: details, isLoading } = useUserDetails(userId);

  if (!userId) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20 rounded-[2rem] blur-xl -z-10 pointer-events-none" />
          <GlassCard className="overflow-hidden border border-border/50 shadow-2xl bg-background/60 backdrop-blur-3xl rounded-[2rem]">
          <div className="p-6 border-b border-border/50 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{details?.user?.email || 'Loading...'}</h2>
                <p className="text-sm text-foreground/90">User Support Profile</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-32 bg-muted/20 rounded-xl" />
                <div className="h-32 bg-muted/20 rounded-xl" />
              </div>
            ) : !details ? (
              <div className="text-center py-12 text-foreground/90">
                Failed to load user details.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Info */}
                  <GlassCard className="p-5 bg-muted/10 border-border/30">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Account Info</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-border/30 pb-2">
                        <span className="text-foreground/90">Status</span>
                        <span className={details.user.is_active ? 'text-emerald-500 font-medium' : 'text-destructive font-medium'}>
                          {details.user.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-border/30 pb-2">
                        <span className="text-foreground/90">Joined</span>
                        <span className="font-medium">{format(new Date(details.user.created_at), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground/90">Role</span>
                        <span className="font-medium capitalize">{details.user.role}</span>
                      </div>
                      <div className="flex justify-between border-t border-border/30 pt-2">
                        <span className="text-foreground/90">Region</span>
                        <span className="font-medium capitalize">{details.user.region || 'Not Set'}</span>
                      </div>
                    </div>
                  </GlassCard>
                  
                  {/* System Engagement */}
                  <GlassCard className="p-5 bg-muted/10 border-border/30">
                    <div className="flex items-center gap-2 mb-4">
                      <Map className="h-5 w-5 text-emerald-500" />
                      <h3 className="font-semibold">Platform Engagement</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-border/30 pb-2">
                        <span className="text-foreground/90">Last Login</span>
                        <span className="font-medium text-muted-foreground">Not tracked</span>
                      </div>
                      <div className="flex justify-between border-b border-border/30 pb-2">
                        <span className="text-foreground/90">Active Features</span>
                        <span className="font-medium">Standard</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground/90">Account Privacy</span>
                        <span className="font-medium text-emerald-500">Secured</span>
                      </div>
                    </div>
                  </GlassCard>
                </div>



              </>
            )}
          </div>
        </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
