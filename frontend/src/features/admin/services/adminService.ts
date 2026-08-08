import { api } from '@/services/api';
import type { 
  AdminUserListResponse,
  AdminSystemStatus,
  SystemJobsResponse,
  CacheOperationResponse,
  AdminAnalyticsResponse,
  ApiLogListResponse,
  AdminNotificationLogListResponse,
  AdminUserDetailsResponse,
  AdminHealthAdvisoryTemplateResponse,
  AdminHealthAdvisoryTemplateUpdate
} from '../types/admin';

export const adminService = {
  // Users
  getUsers: async (skip = 0, limit = 100): Promise<AdminUserListResponse> => {
    const response = await api.get<AdminUserListResponse>(`/admin/users?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  activateUser: async (userId: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/admin/users/${userId}/activate`);
    return response.data;
  },

  deactivateUser: async (userId: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/admin/users/${userId}/deactivate`);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/admin/users/${userId}`);
    return response.data;
  },

  inviteAdmin: async (email: string): Promise<{ message: string; email: string; invite_token: string; invite_link: string }> => {
    const response = await api.post('/admin/invites', { email });
    return response.data;
  },

  sendNotification: async (userId: string, data: { title: string, message: string, notification_type: string }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/admin/users/${userId}/notify`, data);
    return response.data;
  },

  broadcastNotification: async (data: { title: string, message: string, notification_type: string, target_regions?: string[] }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/admin/notifications/broadcast', data);
    return response.data;
  },

  // System
  getSystemStatus: async (): Promise<AdminSystemStatus> => {
    const response = await api.get<AdminSystemStatus>('/admin/system/status');
    return response.data;
  },

  getJobs: async (): Promise<SystemJobsResponse> => {
    const response = await api.get<SystemJobsResponse>('/system/jobs');
    return response.data;
  },

  runJob: async (jobId: string): Promise<CacheOperationResponse> => {
    const response = await api.post<CacheOperationResponse>(`/system/jobs/run/${jobId}`);
    return response.data;
  },

  refreshCache: async (namespace: string): Promise<CacheOperationResponse> => {
    const response = await api.post<CacheOperationResponse>('/system/cache/refresh', { namespace });
    return response.data;
  },

  clearCache: async (namespace: string): Promise<CacheOperationResponse> => {
    const response = await api.delete<CacheOperationResponse>('/system/cache/clear', { data: { namespace } });
    return response.data;
  },

  // Analytics & Logs
  getAnalytics: async (): Promise<AdminAnalyticsResponse> => {
    const response = await api.get<AdminAnalyticsResponse>('/admin/analytics');
    return response.data;
  },

  getApiLogs: async (skip = 0, limit = 100): Promise<ApiLogListResponse> => {
    const response = await api.get<ApiLogListResponse>(`/admin/logs/api?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getNotificationLogs: async (skip = 0, limit = 100): Promise<AdminNotificationLogListResponse> => {
    const response = await api.get<AdminNotificationLogListResponse>(`/admin/notifications/delivery?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getUserDetails: async (userId: string): Promise<AdminUserDetailsResponse> => {
    const response = await api.get<AdminUserDetailsResponse>(`/admin/users/${userId}/details`);
    return response.data;
  },

  getHealthAdvisories: async (): Promise<AdminHealthAdvisoryTemplateResponse[]> => {
    const response = await api.get<AdminHealthAdvisoryTemplateResponse[]>('/admin/cms/health-advisories');
    return response.data;
  },

  updateHealthAdvisory: async (templateId: string, data: AdminHealthAdvisoryTemplateUpdate): Promise<AdminHealthAdvisoryTemplateResponse> => {
    const response = await api.put<AdminHealthAdvisoryTemplateResponse>(`/admin/cms/health-advisories/${templateId}`, data);
    return response.data;
  }
};
