import { create } from 'zustand';

interface NotificationState {
  isDrawerOpen: boolean;
  filterUnreadOnly: boolean;
  
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  
  setFilterUnreadOnly: (unreadOnly: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isDrawerOpen: false,
  filterUnreadOnly: false,
  
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  
  setFilterUnreadOnly: (unreadOnly) => set({ filterUnreadOnly: unreadOnly }),
}));
