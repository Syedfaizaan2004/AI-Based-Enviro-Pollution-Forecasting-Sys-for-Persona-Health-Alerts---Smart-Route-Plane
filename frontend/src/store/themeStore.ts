import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light' | 'system';
type Accent = 'emerald' | 'blue' | 'indigo' | 'rose';

interface ThemeState {
  theme: Theme;
  accent: Accent;
  highContrast: boolean;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
  setHighContrast: (enabled: boolean) => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      accent: 'emerald',
      highContrast: false,
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setHighContrast: (highContrast) => set({ highContrast }),
    }),
    {
      name: 'airsense-theme',
    }
  )
);
