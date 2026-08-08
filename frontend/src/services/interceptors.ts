import { apiClient } from './client';
import { useAuthStore } from '@/store/authStore';
import i18n from '@/i18n/config';

export const setupInterceptors = () => {
  apiClient.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().accessToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Inject selected language for backend dynamic translations
      if (config.headers) {
        config.headers['Accept-Language'] = i18n.language || 'en';
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');
      
      // Handle 401 Unauthorized globally
      if (error.response?.status === 401 && !originalRequest?._retry && !isRefreshRequest) {
        originalRequest._retry = true;
        
        try {
          const { refreshToken, user } = useAuthStore.getState();
          if (!refreshToken) throw new Error('No refresh token available');
          if (!user) throw new Error('No user session available');
          
          // Call refresh endpoint directly using axios to avoid interceptor loops
          const { data } = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
          
          const accessToken = data.access_token;
          const newRefreshToken = data.refresh_token;
          
          // Update store
          useAuthStore.getState().setSession(accessToken, newRefreshToken, user);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear session and redirect to session-expired
          useAuthStore.getState().clearSession();
          window.location.href = '/session-expired';
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};
