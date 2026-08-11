import { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MessageSquare, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminAllFeedback } from '@/features/feedback/hooks/useFeedback';
import { FeedbackDetailsModal } from './FeedbackDetailsModal';
import type { FeedbackResponse } from '@/features/feedback/services/feedbackService';

export function FeedbackManagementTable() {
  const [page, setPage] = useState(1);
  const size = 10;
  const skip = (page - 1) * size;
  
  const { data, isLoading } = useAdminAllFeedback(skip, size);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackResponse | null>(null);

  const handleNextPage = () => setPage((p) => p + 1);
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));

  if (isLoading) {
    return <TableSkeleton />;
  }

  const items = data?.items || [];
  const total = data?.total_count || 0;
  const totalPages = Math.ceil(total / size) || 1;

  return (
    <div className="space-y-4">
      <GlassCard className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-6 border-b border-border/50 bg-muted/10">
          <div>
            <h3 className="text-lg font-semibold text-foreground">User Feedback</h3>
            <p className="text-sm text-foreground/70 mt-1">Review and manage user feedback and feature requests.</p>
          </div>
          <div className="flex items-center gap-2 relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 text-foreground/50" />
            <input 
              type="text" 
              placeholder="Search feedback..."
              className="w-full bg-background/50 border border-border/50 rounded-xl py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>
        
        <div className="w-full overflow-x-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No feedback yet</h3>
              <p className="text-foreground/70 max-w-sm">Users haven't submitted any feedback.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-foreground/70 uppercase bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Subject</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      key={item.id} 
                      className="hover:bg-muted/20 transition-colors cursor-pointer group"
                      onClick={() => setSelectedFeedback(item)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-foreground/70">
                        {format(new Date(item.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-indigo-500">
                              {item.user?.username?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.user?.username || 'Unknown'}</p>
                            <p className="text-xs text-foreground/60 truncate">{item.user?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[10px] uppercase border-border/50 text-foreground/70">
                          {item.category.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{item.subject}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          item.status === 'resolved' ? 'default' : 
                          item.status === 'reviewed' ? 'secondary' : 'outline'
                        } className="text-[10px] uppercase shadow-sm">
                          {item.status}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/10">
            <div className="text-sm text-foreground/70">
              Showing <span className="font-medium text-foreground">{skip + 1}</span> to <span className="font-medium text-foreground">{Math.min(skip + size, total)}</span> of <span className="font-medium text-foreground">{total}</span> results
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage} 
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPage}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      <FeedbackDetailsModal 
        isOpen={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        feedback={selectedFeedback}
      />
    </div>
  );
}

const TableSkeleton = () => (
  <GlassCard className="w-full">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-6 border-b border-border/50 bg-muted/10">
      <div>
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-60" />
      </div>
      <Skeleton className="h-10 w-[200px] rounded-xl" />
    </div>
    <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-border/50 bg-muted/20">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-4 w-20" />
      ))}
    </div>
    <div className="divide-y divide-border/50">
      {[...Array(5)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-5 gap-4 px-6 py-4 items-center">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  </GlassCard>
);
