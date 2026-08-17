import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Leaf, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GoogleAuthButton } from '@/features/auth/components/GoogleAuthButton';
import { signupSchema, type SignupFormValues } from '@/features/auth/validation/auth';
import { authService } from '@/features/auth/services/auth';
import type { AuthResponse } from '@/features/auth/types/auth';
import { useAuthStore } from '@/store/authStore';
import { getApiErrorMessage } from '@/utils/apiError';

export const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite_token');
  const setSession = useAuthStore((state) => state.setSession);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const passwordValue = watch('password', '');

  const completeGoogleSignup = (res: AuthResponse) => {
    setSession(res.accessToken, res.refreshToken, res.user);
    toast.success('Welcome to AirSense.AI!');
    if (res.user.role === 'admin' || res.user.role === 'super_admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const onSubmit = async (data: SignupFormValues) => {
    try {
      if (inviteToken) {
        await authService.adminSignup(data, inviteToken);
        toast.success('Admin account created! Please sign in.');
      } else {
        await authService.signup(data);
        toast.success('Account created! Please sign in.');
      }
      navigate('/login');
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Failed to create account'));
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    try {
      setIsGoogleSubmitting(true);
      const res = await authService.googleLogin(credential);
      completeGoogleSignup(res);
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Failed to sign up with Google'));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = calculateStrength(passwordValue);

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Section - Hero Image & Branding */}
      <div className="hidden lg:flex w-[45%] relative bg-zinc-950 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity scale-105 animate-pulse duration-10000"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=3540&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30 mix-blend-overlay" />
        
        <div className="relative z-10 p-14 flex flex-col justify-between h-full w-full">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white w-fit drop-shadow-lg">
            <Leaf className="h-8 w-8 text-primary" />
            AirSense.AI
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-lg mb-12"
          >
            <h1 className="text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
              Join the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                Green Revolution.
              </span>
            </h1>
            <ul className="space-y-4 mt-8">
              {[
                "Personalized health alerts based on live AQI",
                "Smart route planning to minimize pollution exposure",
                "Real-time tracking of 6 key pollutants",
                "Join a community of health-conscious individuals"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-white/90">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                  <span className="text-base">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Right Section - Signup Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-y-auto bg-background">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl relative z-10 py-12"
        >
          <div className="lg:hidden flex items-center justify-center gap-2 text-2xl font-bold text-primary mb-10">
            <Leaf className="h-8 w-8" />
            AirSense.AI
          </div>

          <GlassCard className="p-8 sm:p-10 shadow-2xl bg-background/80 backdrop-blur-3xl border-border/60 rounded-[2rem]">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                {inviteToken ? 'Create Admin Account' : 'Create your account'}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {inviteToken ? 'Join the AirGuard admin team' : 'Start breathing better today'}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Full Name *</label>
                  <Input {...register('fullName')} placeholder="John Doe" className="bg-background/50 h-12 rounded-xl transition-all border-border/50 focus:bg-background" />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email *</label>
                  <Input {...register('email')} type="email" placeholder="name@example.com" className="bg-background/50 h-12 rounded-xl transition-all border-border/50 focus:bg-background" />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">State / Region</label>
                  <select {...register('region')} className="flex w-full bg-background/50 h-12 px-3 py-2 text-sm rounded-xl transition-all border border-border/50 focus:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option value="">Select State (Optional)</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Chhattisgarh">Chhattisgarh</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Tripura">Tripura</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                    <option value="Ladakh">Ladakh</option>
                    <option value="Lakshadweep">Lakshadweep</option>
                    <option value="Puducherry">Puducherry</option>
                  </select>
                  {errors.region && <p className="text-xs text-destructive">{errors.region.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Password *</label>
                  <div className="relative">
                    <Input {...register('password')} type={showPassword ? "text" : "password"} placeholder="••••••••" className="bg-background/50 h-12 rounded-xl pr-10 transition-all border-border/50 focus:bg-background" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                  
                  {passwordValue.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-1 h-1.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div 
                            key={level} 
                            className={`flex-1 rounded-full transition-colors duration-300 ${strength >= level ? (strength > 3 ? 'bg-primary' : strength > 2 ? 'bg-amber-500' : 'bg-destructive') : 'bg-muted'}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Confirm Password *</label>
                  <div className="relative">
                    <Input {...register('confirmPassword')} type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className="bg-background/50 h-12 rounded-xl pr-10 transition-all border-border/50 focus:bg-background" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-start space-x-3 bg-muted/30 p-4 rounded-xl border border-border/30">
                  <input {...register('termsAccepted')} type="checkbox" id="terms" className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer" />
                  <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                    I agree to the <Link to="/terms" className="text-primary font-medium hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary font-medium hover:underline">Privacy Policy</Link>. *
                  </label>
                </div>
                {errors.termsAccepted && <p className="text-xs text-destructive pl-4">{errors.termsAccepted.message}</p>}
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-xl shadow-primary/25 transition-all hover:translate-y-[-2px] hover:shadow-primary/35" disabled={isSubmitting || isGoogleSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Account"}
              </Button>
            </form>

            {!inviteToken && (
              <>
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <GoogleAuthButton
                  text="signup_with"
                  isLoading={isSubmitting || isGoogleSubmitting}
                  onCredential={handleGoogleCredential}
                  onError={(message) => toast.error(message)}
                />
              </>
            )}

            <div className="mt-8 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
