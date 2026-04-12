import { create } from 'zustand';

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (message: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (message) => set((state) => ({
    notifications: [{ id: Math.random().toString(), message, timestamp: new Date() }, ...state.notifications]
  })),
  clearNotifications: () => set({ notifications: [] }),
}));
