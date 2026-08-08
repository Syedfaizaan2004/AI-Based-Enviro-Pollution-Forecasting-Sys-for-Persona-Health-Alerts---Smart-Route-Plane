import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, KeyRound } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChangePassword } from '../hooks/useSettings';
import { useState } from 'react';

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirm_password: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export function SecuritySettings() {
  const changePassword = useChangePassword();
  const [successMsg, setSuccessMsg] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordForm) => {
    setSuccessMsg('');
    changePassword.mutate(
      { current_password: data.current_password, new_password: data.new_password },
      {
        onSuccess: () => {
          setSuccessMsg('Password successfully updated.');
          reset();
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Change Password</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              Current Password
            </label>
            <Input 
              type="password"
              {...register('current_password')} 
              placeholder="Enter current password" 
              className={errors.current_password ? 'border-destructive' : ''}
            />
            {errors.current_password && <p className="text-xs text-destructive">{errors.current_password.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <Input 
              type="password"
              {...register('new_password')} 
              placeholder="Enter new password" 
              className={errors.new_password ? 'border-destructive' : ''}
            />
            {errors.new_password && <p className="text-xs text-destructive">{errors.new_password.message}</p>}
            <p className="text-xs text-muted-foreground pt-1">
              Must be at least 8 characters containing an uppercase letter, lowercase letter, number, and special character.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm New Password</label>
            <Input 
              type="password"
              {...register('confirm_password')} 
              placeholder="Confirm new password" 
              className={errors.confirm_password ? 'border-destructive' : ''}
            />
            {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
          </div>

          {changePassword.isError && (
            <p className="text-sm text-destructive font-medium">
              {(changePassword.error as any)?.response?.data?.detail || 'Failed to update password.'}
            </p>
          )}

          {successMsg && (
            <p className="text-sm text-emerald-500 font-medium">{successMsg}</p>
          )}

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
