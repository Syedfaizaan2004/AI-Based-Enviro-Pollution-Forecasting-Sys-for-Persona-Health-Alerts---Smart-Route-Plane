import { useEffect } from 'react';
import { motion } from 'framer-motion';

import { StatisticsOverview } from '@/features/history/components/StatisticsOverview';
import { AnalyticsCharts } from '@/features/history/components/AnalyticsCharts';
import { HistoryTable } from '@/features/history/components/HistoryTable';
import { useHistoryStore } from '@/features/history/store/historyStore';
import { Database, LineChart } from 'lucide-react';

export function History() {
  const resetFilters = useHistoryStore(state => state.resetFilters);

  // Reset filters on unmount so next visit is fresh
  useEffect(() => {
    return () => resetFilters();
  }, [resetFilters]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-12 relative z-0 overflow-x-hidden">
      
      {/* Ambient Background Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Page Header */}
      <div className="px-4 md:px-6 lg:px-8 py-8 border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4 max-w-[1920px] mx-auto">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">History & Analytics</h1>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">Comprehensive insights, predictions, and health exposure reports.</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary/20 p-1.5 rounded-md shadow-inner shadow-primary/20">
                <LineChart className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-widest text-primary">At a Glance</h2>
            </div>
            <StatisticsOverview />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-500/20 p-1.5 rounded-md shadow-inner shadow-indigo-500/20">
                <LineChart className="h-4 w-4 text-indigo-500" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-widest text-indigo-500">Trend Analytics</h2>
            </div>
            <AnalyticsCharts />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-emerald-500/20 p-1.5 rounded-md shadow-inner shadow-emerald-500/20">
                <Database className="h-4 w-4 text-emerald-500" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-widest text-emerald-500">Historical Records</h2>
            </div>
            <HistoryTable />
          </section>
        </motion.div>
      </div>
    </div>
  );
}
