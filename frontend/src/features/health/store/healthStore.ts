import { create } from 'zustand';

interface HealthState {
  isProfileModalOpen: boolean;
  activeChartFilter: 'daily' | 'weekly' | 'monthly';
  
  setProfileModalOpen: (isOpen: boolean) => void;
  setActiveChartFilter: (filter: 'daily' | 'weekly' | 'monthly') => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  isProfileModalOpen: false,
  activeChartFilter: 'weekly',

  setProfileModalOpen: (isOpen) => set({ isProfileModalOpen: isOpen }),
  setActiveChartFilter: (filter) => set({ activeChartFilter: filter }),
}));
