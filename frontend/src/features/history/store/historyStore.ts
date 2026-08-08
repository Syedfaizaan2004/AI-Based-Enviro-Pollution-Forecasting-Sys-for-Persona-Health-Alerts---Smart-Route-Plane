import { create } from 'zustand';
import type { HistoryFilters } from '../types/history';

export type HistoryTab = 'predictions' | 'routes' | 'health';

interface HistoryState {
  activeTab: HistoryTab;
  filters: HistoryFilters;
  
  setActiveTab: (tab: HistoryTab) => void;
  setFilters: (filters: Partial<HistoryFilters>) => void;
  resetFilters: () => void;
}

const initialFilters: HistoryFilters = {
  page: 1,
  size: 10,
  sort_desc: true,
};

export const useHistoryStore = create<HistoryState>((set) => ({
  activeTab: 'predictions',
  filters: initialFilters,

  setActiveTab: (tab) => set({ activeTab: tab, filters: initialFilters }),
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters, page: newFilters.page ?? 1 } 
  })),
  resetFilters: () => set({ filters: initialFilters }),
}));
