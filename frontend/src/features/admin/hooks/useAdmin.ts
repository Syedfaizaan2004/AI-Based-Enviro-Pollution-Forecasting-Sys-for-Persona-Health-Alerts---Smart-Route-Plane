import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

export const adminKeys = {
  users: (skip: number, limit: number) => ['adminUsers', skip, limit] as const,
  systemStatus: ['adminSystemStatus'] as const,
  jobs: ['adminJobs'] as const,
  analytics: ['adminAnalytics'] as const,
  apiLogs: (skip: number, limit: number) => ['adminApiLogs', skip, limit] as const,
  notificationLogs: (skip: number, limit: number) => ['adminNotificationLogs', skip, limit] as const,
  userDetails: (userId: string) => ['adminUserDetails', userId] as const,
  healthAdvisories: ['adminHealthAdvisories'] as const,
};

// --- Users ---
export function useAdminUsers(skip = 0, limit = 100) {
  return useQuery({
    queryKey: adminKeys.users(skip, limit),
    queryFn: () => adminService.getUsers(skip, limit),
    refetchInterval: 30000,
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminService.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminService.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: adminKeys.systemStatus });
    },
  });
}

export function useInviteAdmin() {
  return useMutation({
    mutationFn: (email: string) => adminService.inviteAdmin(email),
  });
}

export function useAdminInvites() {
  return useQuery({
    queryKey: ['adminInvites'],
    queryFn: () => adminService.getAdminInvites(),
    refetchInterval: 30000,
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string, data: { title: string, message: string, notification_type: string } }) => 
      adminService.sendNotification(userId, data),
    onSuccess: () => {
      // Invalidate notification logs so the new one shows up immediately
      queryClient.invalidateQueries({ queryKey: ['adminNotificationLogs'] });
    },
  });
}

export function useBroadcastNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string, message: string, notification_type: string, target_regions?: string[] }) => 
      adminService.broadcastNotification(data),
    onSuccess: () => {
      // Invalidate notification logs so the new ones show up immediately
      queryClient.invalidateQueries({ queryKey: ['adminNotificationLogs'] });
    },
  });
}

// --- System ---
export function useSystemStatus() {
  return useQuery({
    queryKey: adminKeys.systemStatus,
    queryFn: () => adminService.getSystemStatus(),
    refetchInterval: 15000,
  });
}

export function useSystemJobs() {
  return useQuery({
    queryKey: adminKeys.jobs,
    queryFn: () => adminService.getJobs(),
    refetchInterval: 15000,
  });
}

export function useRunJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => adminService.runJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.jobs });
    },
  });
}

export function useRefreshCache() {
  return useMutation({
    mutationFn: (namespace: string) => adminService.refreshCache(namespace),
  });
}

export function useClearCache() {
  return useMutation({
    mutationFn: (namespace: string) => adminService.clearCache(namespace),
  });
}

// --- Analytics & Logs ---
export function useAdminAnalytics() {
  return useQuery({
    queryKey: adminKeys.analytics,
    queryFn: () => adminService.getAnalytics(),
    refetchInterval: 60000,
  });
}

export function useApiLogs(skip = 0, limit = 100) {
  return useQuery({
    queryKey: adminKeys.apiLogs(skip, limit),
    queryFn: () => adminService.getApiLogs(skip, limit),
    refetchInterval: 15000,
  });
}

export function useNotificationLogs(skip = 0, limit = 100) {
  return useQuery({
    queryKey: adminKeys.notificationLogs(skip, limit),
    queryFn: () => adminService.getNotificationLogs(skip, limit),
    refetchInterval: 30000,
  });
}

export function useUserDetails(userId: string | null) {
  return useQuery({
    queryKey: adminKeys.userDetails(userId!),
    queryFn: () => adminService.getUserDetails(userId!),
    enabled: !!userId,
  });
}

// --- CMS ---
export function useHealthAdvisories() {
  return useQuery({
    queryKey: adminKeys.healthAdvisories,
    queryFn: adminService.getHealthAdvisories,
  });
}

export function useUpdateHealthAdvisory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: { general_advice?: string, sensitive_group_advice?: string } }) =>
      adminService.updateHealthAdvisory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.healthAdvisories });
    },
  });
}
