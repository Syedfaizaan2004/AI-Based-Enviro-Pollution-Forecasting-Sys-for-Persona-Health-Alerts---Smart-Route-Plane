import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, User, Calendar, MessageSquare, Star, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FeedbackResponse } from '@/features/feedback/services/feedbackService';
import { useUpdateFeedbackStatus } from '@/features/feedback/hooks/useFeedback';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

interface FeedbackDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: FeedbackResponse | null;
}

export function FeedbackDetailsModal({ isOpen, onClose, feedback }: FeedbackDetailsModalProps) {
  const { mutate: updateStatus, isPending } = useUpdateFeedbackStatus();

  const [adminReply, setAdminReply] = useState('');

  // Reset state when feedback changes
  useEffect(() => {
    if (feedback) {
      setAdminReply(feedback.admin_response || '');
    }
  }, [feedback]);

  if (!feedback) return null;

  const handleStatusUpdate = (status: 'new' | 'reviewed' | 'resolved', reply?: string) => {
    updateStatus(
      { id: feedback.id, data: { status, admin_response: reply } },
      {
        onSuccess: () => {
          toast.success(`Feedback updated successfully`);
          onClose();
        },
        onError: () => toast.error('Failed to update feedback')
      }
    );
  };

  const handleReplySubmit = () => {
    if (!adminReply.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }
    handleStatusUpdate('resolved', adminReply);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20 rounded-[2rem] blur-xl -z-10 pointer-events-none" />
            
            <div className="overflow-hidden border border-border/50 shadow-2xl bg-background/60 backdrop-blur-3xl rounded-[2rem] relative">
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/10 to-transparent opacity-50 pointer-events-none" />

              <div className="relative p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6 border-b border-border/50 pb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-[10px] uppercase border-border/50 text-foreground/80">
                        {feedback.category.replace('_', ' ')}
                      </Badge>
                      <Badge variant={
                        feedback.status === 'resolved' ? 'default' : 
                        feedback.status === 'reviewed' ? 'secondary' : 'outline'
                      } className="text-[10px] uppercase shadow-sm">
                        {feedback.status}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mt-2">{feedback.subject}</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-full transition-colors shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-foreground/60">User</p>
                        <p className="text-sm font-medium text-foreground">{feedback.user?.username || 'Unknown'}</p>
                        <p className="text-xs text-foreground/70">{feedback.user?.email || 'No email'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs text-foreground/60">Submitted On</p>
                        <p className="text-sm font-medium text-foreground">
                          {format(new Date(feedback.created_at), 'PPP')}
                        </p>
                        <p className="text-xs text-foreground/70">
                          {format(new Date(feedback.created_at), 'p')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {feedback.rating && (
                    <div className="flex flex-col items-center justify-center p-6 bg-muted/10 rounded-2xl border border-border/30">
                      <p className="text-xs text-foreground/60 mb-2">User Rating</p>
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-6 h-6 ${feedback.rating! >= star ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground/30'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-xl font-bold text-foreground">{feedback.rating} / 5</p>
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-foreground/90 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Message Content
                  </h3>
                  <div className="p-4 bg-muted/10 border border-border/30 rounded-2xl">
                    <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {feedback.message}
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-foreground/90 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    Admin Reply
                  </h3>
                  {feedback.admin_response ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
                        {feedback.admin_response}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={adminReply}
                        onChange={(e) => setAdminReply(e.target.value)}
                        placeholder="Type your reply to the user..."
                        rows={3}
                        className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none text-sm"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleReplySubmit}
                          disabled={isPending || !adminReply.trim()}
                          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          Submit Reply & Resolve
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/50">
                  {feedback.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusUpdate('resolved')}
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Resolved
                    </button>
                  )}
                  {feedback.status === 'new' && (
                    <button
                      onClick={() => handleStatusUpdate('reviewed')}
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <Clock className="w-4 h-4" />
                      Mark as Reviewed
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
