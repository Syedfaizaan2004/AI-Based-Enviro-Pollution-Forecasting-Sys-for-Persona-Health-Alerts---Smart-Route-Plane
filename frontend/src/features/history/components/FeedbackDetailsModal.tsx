import { format } from 'date-fns';
import { MessageSquare, Star, User, Clock } from 'lucide-react';
import type { FeedbackResponse } from '@/features/feedback/services/feedbackService';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';

interface FeedbackDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: FeedbackResponse | null;
}

export function FeedbackDetailsModal({ isOpen, onClose, feedback }: FeedbackDetailsModalProps) {
  if (!feedback) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background/60 backdrop-blur-3xl border-border/50 shadow-2xl">
        {/* Animated Background Glow */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="bg-gradient-to-br from-primary/10 to-transparent p-6 border-b border-border/50 relative z-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Feedback Details
              </span>
              <Badge variant={
                feedback.status === 'resolved' ? 'default' : 
                feedback.status === 'reviewed' ? 'secondary' : 'outline'
              } className="text-sm px-3 py-1 shadow-sm uppercase">
                {feedback.status}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-foreground">Category</span>
              <Badge variant="outline" className="w-fit text-xs uppercase">{feedback.category.replace('_', ' ')}</Badge>
            </div>
            <div className="flex flex-col gap-1 sm:text-right">
              <span className="font-semibold text-foreground">Submitted On</span>
              <span>{format(new Date(feedback.created_at), 'PPpp')}</span>
            </div>
          </div>
        </div>

        <div className="p-6 relative z-10 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            
            {/* Subject and Rating */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-start justify-between gap-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-foreground">{feedback.subject}</h3>
              </div>
              {feedback.rating && (
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-full border border-amber-500/20 shrink-0">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-sm">{feedback.rating} / 5</span>
                </div>
              )}
            </motion.div>

            {/* Original Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Your Message
              </h4>
              <div className="p-4 bg-muted/30 border border-border/50 rounded-2xl">
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                  {feedback.message}
                </p>
              </div>
            </motion.div>

            {/* Admin Response */}
            {feedback.admin_response ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-500" />
                  Admin Reply
                </h4>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                  <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap relative z-10">
                    {feedback.admin_response}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 p-4 bg-muted/20 border border-border/50 rounded-2xl text-muted-foreground"
              >
                {feedback.status === 'reviewed' ? (
                  <>
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <p className="text-sm">Your feedback is currently under review by our team.</p>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5" />
                    <p className="text-sm">We've received your feedback and will review it shortly.</p>
                  </>
                )}
              </motion.div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
