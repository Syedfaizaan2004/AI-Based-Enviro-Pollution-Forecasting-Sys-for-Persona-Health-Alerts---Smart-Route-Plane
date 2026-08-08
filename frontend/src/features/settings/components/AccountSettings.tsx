import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Shield, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { useUpdateProfile, useDeactivateAccount } from '../hooks/useSettings';
import { useState } from 'react';

const accountSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
});

type AccountForm = z.infer<typeof accountSchema>;

export function AccountSettings() {
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const deactivateAccount = useDeactivateAccount();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      username: user?.fullName || '',
    }
  });

  const onSubmit = (data: AccountForm) => {
    updateProfile.mutate(data);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Account Information</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input 
                {...register('username')} 
                placeholder="Enter username" 
                className={errors.username ? 'border-destructive' : ''}
              />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={user.email} 
                  disabled 
                  className="pl-9 bg-muted/50" 
                  title="Email cannot be changed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Account Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={user.role.toUpperCase()} 
                  disabled 
                  className="pl-9 bg-muted/50" 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 flex justify-end">
            <Button 
              type="submit" 
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </GlassCard>

      <GlassCard className="p-6 border-destructive/20 bg-destructive/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Deactivating your account will immediately log you out and soft-delete your profile. This action cannot be easily undone.
            </p>
          </div>
          
          {!showDeleteConfirm ? (
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteConfirm(true)}
            >
              Deactivate Account
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deactivateAccount.isPending}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deactivateAccount.mutate()}
                disabled={deactivateAccount.isPending}
              >
                {deactivateAccount.isPending ? 'Deactivating...' : 'Confirm Deactivation'}
              </Button>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
