import { api } from '@/services/api';
import type { 
  UserUpdate, 
  PasswordChange, 
  HealthProfileRead, 
  HealthProfileUpdate 
} from '../types/settings';
import type { UserPreferencesRead, UserPreferencesUpdate } from '@/features/notifications/types/notification';

export const settingsService = {
  // Users
  updateProfile: async (data: UserUpdate): Promise<{ username: string }> => {
    const response = await api.patch<{ username: string }>('/users/me', data);
    return response.data;
  },

  changePassword: async (data: PasswordChange): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>('/users/change-password', data);
    return response.data;
  },

  deactivateAccount: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/users/me');
    return response.data;
  },

  // Health Profile
  getHealthProfile: async (): Promise<HealthProfileRead> => {
    const response = await api.get<HealthProfileRead>('/health-profile');
    return response.data;
  },

  updateHealthProfile: async (data: HealthProfileUpdate): Promise<HealthProfileRead> => {
    const response = await api.patch<HealthProfileRead>('/health-profile', data);
    return response.data;
  },

  // UI/General Preferences (We reuse the /preferences endpoint)
  updatePreferences: async (data: UserPreferencesUpdate): Promise<UserPreferencesRead> => {
    const response = await api.patch<UserPreferencesRead>('/preferences', data);
    return response.data;
  }
};
