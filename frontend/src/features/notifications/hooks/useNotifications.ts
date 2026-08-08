import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import type { UserPreferencesUpdate } from '../types/notification';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (unreadOnly: boolean) => [...notificationKeys.all, 'list', unreadOnly] as const,
  advisories: ['health-advisories'] as const,
  currentAdvisory: () => [...notificationKeys.advisories, 'current'] as const,
  preferences: ['preferences'] as const,
};

export function useNotificationsList(unreadOnly: boolean = false) {
  return useQuery({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: () => notificationService.getNotifications(unreadOnly),
    refetchInterval: 60000, // Poll every minute for new notifications
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useCurrentAdvisory() {
  return useQuery({
    queryKey: notificationKeys.currentAdvisory(),
    queryFn: () => notificationService.getCurrentAdvisory(),
    refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes
    retry: false, // Avoid retrying on 404 (No current advisory)
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences,
    queryFn: () => notificationService.getPreferences(),
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UserPreferencesUpdate) => notificationService.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences });
    },
  });
}
