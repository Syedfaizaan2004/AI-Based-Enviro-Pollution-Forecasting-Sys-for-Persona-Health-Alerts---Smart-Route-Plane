import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/endpoints';
import type { AuthResponse } from '../types/auth';
import type { LoginFormValues, SignupFormValues } from '../validation/auth';

export const authService = {
  login: async (credentials: LoginFormValues): Promise<AuthResponse> => {
    const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.username, // mapping backend username to frontend fullName
        role: (data.user?.role || data.role || 'user').toLowerCase(),
        createdAt: data.user?.created_at || data.created_at,
      }
    };
  },

  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const { data } = await api.post(ENDPOINTS.AUTH.GOOGLE, { credential });
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.username,
        role: (data.user.role || 'user').toLowerCase(),
        createdAt: data.user.created_at,
      }
    };
  },
  
  signup: async (userData: SignupFormValues): Promise<AuthResponse> => {
    const payload = {
      email: userData.email,
      password: userData.password,
      username: userData.fullName, // mapping frontend fullName to backend username
    };
    const { data } = await api.post(ENDPOINTS.AUTH.REGISTER, payload);
    return {
      accessToken: '',
      refreshToken: '',
      user: {
        id: data.id,
        email: data.email,
        fullName: data.username,
        role: (data.role || 'user').toLowerCase(),
        createdAt: data.created_at,
      }
    };
  },

  adminSignup: async (userData: SignupFormValues, token: string): Promise<AuthResponse> => {
    const payload = {
      email: userData.email,
      password: userData.password,
      username: userData.fullName,
      token: token,
    };
    const { data } = await api.post('/auth/admin/register', payload);
    return {
      accessToken: '',
      refreshToken: '',
      user: {
        id: data.id,
        email: data.email,
        fullName: data.username,
        role: (data.role || 'user').toLowerCase(),
        createdAt: data.created_at,
      }
    };
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> => {
    const { data } = await api.post(ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken });
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    };
  },
  
  me: async () => {
    const { data } = await api.get('/auth/me');
    return {
      id: data.id,
      email: data.email,
      fullName: data.username,
      role: (data.role || 'user').toLowerCase(),
      createdAt: data.created_at,
    };
  }
};
