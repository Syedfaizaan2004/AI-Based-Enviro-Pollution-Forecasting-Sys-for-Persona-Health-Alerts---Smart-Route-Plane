import { HardDrive, RefreshCw, Play, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useSystemJobs, useRunJob, useRefreshCache, useClearCache } from '../hooks/useAdmin';
import { useState } from 'react';

export function SystemManagement() {
  const { data: jobsResponse, isLoading: isLoadingJobs } = useSystemJobs();
  const runJob = useRunJob();
  const refreshCache = useRefreshCache();
  const clearCache = useClearCache();
  const [successMsg, setSuccessMsg] = useState('');

  const handleAction = async (action: () => Promise<any>, successText: string) => {
    setSuccessMsg('');
    try {
      await action();
      setSuccessMsg(successText);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const jobs = jobsResponse?.jobs || [];

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Background Jobs */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Background Jobs</h3>
            </div>
          </div>
          
          <div className="space-y-3">
            {isLoadingJobs ? (
              <div className="animate-pulse h-24 bg-muted/20 rounded-lg" />
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div>
                    <p className="font-medium">{job.name}</p>
                    <p className="text-xs text-foreground/90 mt-1">
                      Next Run: {job.next_run_time ? format(new Date(job.next_run_time), 'PPp') : 'Not scheduled'}
                    </p>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleAction(() => runJob.mutateAsync(job.id), `Job ${job.name} triggered successfully`)}
                    disabled={runJob.isPending}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Now
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-foreground/90 text-center py-4">No background jobs registered.</p>
            )}
          </div>
        </GlassCard>

        {/* Cache Management */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <HardDrive className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Cache Management</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="text-sm font-medium mb-1">Global Predictions Cache</h4>
              <p className="text-xs text-foreground/90 mb-4">
                Clearing the cache will force the ML model to re-run inferences on the next requests.
              </p>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAction(() => refreshCache.mutateAsync('predictions'), 'Predictions cache refresh triggered')}
                  disabled={refreshCache.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleAction(() => clearCache.mutateAsync('predictions'), 'Predictions cache cleared')}
                  disabled={clearCache.isPending}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="text-sm font-medium mb-1">Session & Authentication Cache</h4>
              <p className="text-xs text-foreground/90 mb-4">
                Warning: Clearing this will instantly invalidate all active user sessions globally.
              </p>
              <Button 
                variant="destructive" 
                size="sm"
                className="w-full"
                onClick={() => {
                  if (confirm("Are you sure you want to invalidate all user sessions globally?")) {
                    handleAction(() => clearCache.mutateAsync('sessions'), 'Session cache cleared globally');
                  }
                }}
                disabled={clearCache.isPending}
              >
                <Trash className="h-4 w-4 mr-2" />
                Invalidate All Sessions
              </Button>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
