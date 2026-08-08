import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../features/auth/types/auth';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setSession: (accessToken: string, refreshToken: string, user: User) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      loading: false,
      setSession: (accessToken, refreshToken, user) => 
        set({ accessToken, refreshToken, user, isAuthenticated: true }),
      clearSession: () => 
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'airsense-auth',
    }
  )
);
