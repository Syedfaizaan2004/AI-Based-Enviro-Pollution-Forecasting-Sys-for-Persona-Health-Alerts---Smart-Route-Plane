import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { api } from '@/services/api';
import { getApiErrorMessage } from '@/utils/apiError';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error('Invalid or missing token');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Failed to reset password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        <GlassCard className="p-8 shadow-2xl bg-background/60 backdrop-blur-2xl border-border/50 rounded-[2rem]">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Set new password</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Must be at least 8 characters.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">New Password</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-background/50 h-11 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Reset password"}
            </Button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};
