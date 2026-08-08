import { useState } from 'react';
import { format } from 'date-fns';
import { Terminal, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useApiLogs } from '../hooks/useAdmin';

export function ApiLogsTable() {
  const [page, setPage] = useState(0);
  const limit = 15;
  const { data, isLoading } = useApiLogs(page * limit, limit);

  const handleNext = () => setPage((p) => p + 1);
  const handlePrev = () => setPage((p) => Math.max(0, p - 1));

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-muted/20 rounded-xl" />;
  }

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const maxPage = Math.ceil(total / limit) - 1;

  return (
    <GlassCard className="overflow-hidden">
      <div className="p-6 border-b border-border/50 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Terminal className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">System API Logs</h3>
          <p className="text-sm text-foreground/90 mt-1">Live feed of external and internal API requests.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-foreground/90 uppercase bg-muted/30">
            <tr>
              <th className="px-6 py-4 font-medium">Timestamp</th>
              <th className="px-6 py-4 font-medium">Endpoint</th>
              <th className="px-6 py-4 font-medium">Method</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Time (ms)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 font-mono text-xs">
            {logs.map((log) => {
              const isError = log.status_code >= 400;
              return (
                <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 text-foreground/90 whitespace-nowrap">
                    {format(new Date(log.created_at), 'MM/dd HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 truncate max-w-xs" title={log.endpoint}>
                    {log.endpoint}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-primary/80 font-bold">{log.method}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {isError ? (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                      <span className={isError ? 'text-destructive font-bold' : 'text-emerald-500'}>
                        {log.status_code}
                      </span>
                    </div>
                    {isError && log.error_message && (
                      <p className="text-[10px] text-destructive/80 mt-1 truncate max-w-[200px]" title={log.error_message}>
                        {log.error_message}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={log.response_time_ms > 1000 ? 'text-amber-500' : 'text-foreground/90'}>
                      {log.response_time_ms.toFixed(0)}ms
                    </span>
                  </td>
                </tr>
              );
            })}
            
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-foreground/90 font-sans text-sm">
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border/50 flex items-center justify-between">
        <p className="text-sm text-foreground/90">
          Showing {logs.length > 0 ? page * limit + 1 : 0} to {Math.min((page + 1) * limit, total)} of {total} logs
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrev} disabled={page === 0}>
            Newer
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext} disabled={page >= maxPage}>
            Older
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
