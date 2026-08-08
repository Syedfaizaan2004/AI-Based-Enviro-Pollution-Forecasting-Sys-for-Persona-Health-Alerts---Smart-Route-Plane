import { api } from '@/services/api';
import type { 
  NotificationResponse, 
  HealthAdvisoryResponse, 
  UserPreferencesRead, 
  UserPreferencesUpdate 
} from '../types/notification';

export const notificationService = {
  getNotifications: async (unreadOnly: boolean = false): Promise<NotificationResponse[]> => {
    const endpoint = unreadOnly ? '/notifications/unread' : '/notifications';
    const response = await api.get<NotificationResponse[]>(endpoint);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  markAsRead: async (id: string): Promise<NotificationResponse> => {
    const response = await api.patch<NotificationResponse>(`/notifications/${id}/read`);
    return response.data;
  },

  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },

  getCurrentAdvisory: async (): Promise<HealthAdvisoryResponse> => {
    const response = await api.get<HealthAdvisoryResponse>('/health-advisories/current');
    return response.data;
  },

  getPreferences: async (): Promise<UserPreferencesRead> => {
    const response = await api.get<UserPreferencesRead>('/preferences');
    return response.data;
  },

  updatePreferences: async (data: UserPreferencesUpdate): Promise<UserPreferencesRead> => {
    const response = await api.patch<UserPreferencesRead>('/preferences', data);
    return response.data;
  }
};
