import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settingsService';
import type { 
  UserUpdate, 
  PasswordChange, 
  HealthProfileUpdate 
} from '../types/settings';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router';

export const settingsKeys = {
  healthProfile: ['healthProfile'] as const,
};

export function useUpdateProfile() {
  const { user, setSession } = useAuthStore();
  
  return useMutation({
    mutationFn: (data: UserUpdate) => settingsService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update global auth store with new username
      if (user) {
        setSession(
          useAuthStore.getState().accessToken || '', 
          useAuthStore.getState().refreshToken || '', 
          { ...user, fullName: updatedUser.username }
        );
      }
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: PasswordChange) => settingsService.changePassword(data),
  });
}

export function useDeactivateAccount() {
  const { clearSession } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => settingsService.deactivateAccount(),
    onSuccess: () => {
      clearSession();
      navigate('/login');
    },
  });
}

export function useHealthProfile() {
  return useQuery({
    queryKey: settingsKeys.healthProfile,
    queryFn: () => settingsService.getHealthProfile(),
  });
}

export function useUpdateHealthProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: HealthProfileUpdate) => settingsService.updateHealthProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.healthProfile });
    },
  });
}
