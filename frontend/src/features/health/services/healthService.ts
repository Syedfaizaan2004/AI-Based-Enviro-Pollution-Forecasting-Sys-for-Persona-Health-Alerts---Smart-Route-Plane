import { api } from '@/services/api';
import type { 
  HealthProfileRead, 
  HealthProfileUpdate, 
  NotificationResponse, 
  HealthAdvisoryResponse,
  DashboardSummaryResponse,
  ChartDataResponse
} from '../types/health';

export const healthService = {
  getProfile: async (): Promise<HealthProfileRead> => {
    const response = await api.get<HealthProfileRead>('/health-profile');
    return response.data;
  },

  updateProfile: async (data: HealthProfileUpdate): Promise<HealthProfileRead> => {
    const response = await api.patch<HealthProfileRead>('/health-profile', data);
    return response.data;
  },

  getUnreadNotifications: async (): Promise<NotificationResponse[]> => {
    const response = await api.get<NotificationResponse[]>('/notifications/unread');
    return response.data;
  },
  
  markNotificationRead: async (id: string): Promise<NotificationResponse> => {
    const response = await api.patch<NotificationResponse>(`/notifications/${id}/read`);
    return response.data;
  },

  getLatestAdvisories: async (): Promise<HealthAdvisoryResponse[]> => {
    const response = await api.get<HealthAdvisoryResponse[]>('/health-advisories/latest');
    return response.data;
  },

  getHealthSummary: async (): Promise<DashboardSummaryResponse> => {
    const response = await api.get<DashboardSummaryResponse>('/dashboard/summary');
    return response.data;
  },
  
  getExposureCharts: async (type: 'line' | 'bar' | 'area'): Promise<ChartDataResponse> => {
    const response = await api.get<ChartDataResponse>(`/dashboard/charts?chart_type=${type}`);
    return response.data;
  }
};
