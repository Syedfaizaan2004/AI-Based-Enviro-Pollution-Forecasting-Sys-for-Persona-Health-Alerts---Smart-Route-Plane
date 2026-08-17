import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Leaf, Wind, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GoogleAuthButton } from '@/features/auth/components/GoogleAuthButton';
import { loginSchema, type LoginFormValues } from '@/features/auth/validation/auth';
import { authService } from '@/features/auth/services/auth';
import type { AuthResponse } from '@/features/auth/types/auth';
import { useAuthStore } from '@/store/authStore';
import { getApiErrorMessage } from '@/utils/apiError';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const completeLogin = (res: AuthResponse) => {
    setSession(res.accessToken, res.refreshToken, res.user);
    toast.success('Welcome back!');
    if (res.user.role === 'admin' || res.user.role === 'super_admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await authService.login(data);
      completeLogin(res);
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Failed to login'));
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    try {
      setIsGoogleSubmitting(true);
      const res = await authService.googleLogin(credential);
      completeLogin(res);
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Failed to login with Google'));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Section - Hero Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-950 overflow-hidden">
        {/* Dynamic Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 mix-blend-luminosity scale-105 animate-pulse duration-10000"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=3113&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/40 mix-blend-overlay" />
        
        <div className="relative z-10 p-14 flex flex-col justify-between h-full w-full">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white w-fit drop-shadow-lg">
            <Leaf className="h-8 w-8 text-primary" />
            AirSense.AI
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-xl"
          >
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight drop-shadow-xl">
              Breathe Better, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                Live Healthier.
              </span>
            </h1>
            <p className="text-lg text-white leading-relaxed font-medium drop-shadow-md">
              Harness the power of AI to track environmental pollution, receive personalized health alerts, and plan the smartest routes for your daily commute.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Wind className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Live Analytics</h3>
                  <p className="text-xs text-white/90">Real-time AQI tracking</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Health Alerts</h3>
                  <p className="text-xs text-white/90">Personalized safety</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-hidden bg-background">
        {/* Subtle background glow for right side */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="lg:hidden flex items-center justify-center gap-2 text-2xl font-bold text-primary mb-10">
            <Leaf className="h-8 w-8" />
            AirSense.AI
          </div>

          <GlassCard className="p-8 sm:p-10 shadow-2xl bg-background/80 backdrop-blur-3xl border-border/60 rounded-[2rem]">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Enter your credentials to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input 
                  {...register('email')} 
                  type="email" 
                  placeholder="name@example.com"
                  className="bg-background/50 h-12 rounded-xl transition-all border-border/50 focus:bg-background"
                  autoComplete="email"
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input 
                    {...register('password')} 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-background/50 h-12 rounded-xl pr-10 transition-all border-border/50 focus:bg-background"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input type="checkbox" id="remember" className="rounded border-border text-primary focus:ring-primary h-4 w-4" />
                <label htmlFor="remember" className="text-sm text-muted-foreground font-medium cursor-pointer">
                  Remember me for 30 days
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-base font-semibold shadow-xl shadow-primary/25 transition-all hover:translate-y-[-2px] hover:shadow-primary/35"
                disabled={isSubmitting || isGoogleSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign in"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <GoogleAuthButton
              text="signin_with"
              isLoading={isSubmitting || isGoogleSubmitting}
              onCredential={handleGoogleCredential}
              onError={(message) => toast.error(message)}
            />

            <div className="mt-8 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-primary font-semibold hover:underline">
                Create an account
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
