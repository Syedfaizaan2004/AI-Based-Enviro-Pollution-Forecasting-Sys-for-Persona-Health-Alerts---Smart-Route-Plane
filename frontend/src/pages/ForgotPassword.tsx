import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { api } from '@/services/api';
import { getApiErrorMessage } from '@/utils/apiError';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Email is required');
    
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setResetToken(data.reset_token || null);
      setSubmitted(true);
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Failed to send reset email'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        <GlassCard className="p-8 shadow-2xl bg-background/60 backdrop-blur-2xl border-border/50 rounded-[2rem]">
          {!submitted ? (
            <>
              <div className="mb-6">
                <Link to="/login" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
                </Link>
                <h2 className="text-2xl font-semibold tracking-tight">Forgot password?</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  No worries, we'll send you reset instructions.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/50 h-11" required />
                </div>
                <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Reset password"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Check your email</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                We sent a password reset link to <br/> <span className="font-medium text-foreground">{email}</span>
              </p>
              {resetToken && (
                <Button asChild className="w-full h-11 mb-3">
                  <Link to={`/reset-password?token=${encodeURIComponent(resetToken)}`}>Continue to reset password</Link>
                </Button>
              )}
              <Button onClick={() => setSubmitted(false)} variant="outline" className="w-full h-11">
                Try another email
              </Button>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};
