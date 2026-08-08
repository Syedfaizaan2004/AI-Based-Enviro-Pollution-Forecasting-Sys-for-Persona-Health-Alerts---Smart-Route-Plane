import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { api } from '@/services/api';

export const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');

  useEffect(() => {
    if (token) {
      api.post('/auth/verify-email', { token })
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    }
  }, [token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <GlassCard className="p-8 text-center shadow-2xl bg-background/60 backdrop-blur-2xl border-border/50 rounded-[2rem]">
          {status === 'loading' && (
            <div className="py-6 flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <h2 className="text-2xl font-semibold tracking-tight">Verifying Email...</h2>
              <p className="text-sm text-muted-foreground mt-2">Please wait while we verify your link.</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="py-6 flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
              <h2 className="text-2xl font-semibold tracking-tight">Email Verified!</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-6">Your account has been successfully verified.</p>
              <Button asChild className="w-full h-11"><Link to="/login">Continue to Login</Link></Button>
            </div>
          )}

          {status === 'error' && (
            <div className="py-6 flex flex-col items-center">
              <XCircle className="h-16 w-16 text-destructive mb-4" />
              <h2 className="text-2xl font-semibold tracking-tight">Verification Failed</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-6">The link is invalid or has expired.</p>
              <Button asChild className="w-full h-11" variant="outline"><Link to="/login">Back to Login</Link></Button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
