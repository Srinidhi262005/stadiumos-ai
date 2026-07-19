import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { OperationTimelineEvent } from '../types/common';
import NotificationsService from '../services/api/notifications';

export interface SystemNotification extends OperationTimelineEvent {
  read: boolean;
}

interface NotificationStoreState {
  notifications: SystemNotification[];
  loading: boolean;
  error: string | null;
  isRealtimeConnected: boolean;
  loadNotifications: () => Promise<void>;
  addNotification: (notification: Omit<SystemNotification, 'id' | 'read' | 'timestamp'>) => void;
  addNotificationRealtime: (notification: SystemNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  setRealtimeConnected: (connected: boolean) => void;
}

const normalizeNotification = (item: Record<string, unknown>): SystemNotification => ({
  id: String(item.id ?? ''),
  title: String(item.title ?? 'Notification'),
  description: String(item.message ?? item.description ?? ''),
  timestamp: String(item.createdAt ?? item.created_at ?? new Date().toISOString()),
  category: 'system',
  severity: 'info',
  read: Boolean(item.isRead ?? item.is_read ?? false),
});

export const useNotificationStore = create<NotificationStoreState>()(
  devtools((set, get) => ({
    notifications: [],
    loading: false,
    error: null,
    isRealtimeConnected: false,
    loadNotifications: async () => {
      set({ loading: true, error: null });
      try {
        const items = await NotificationsService.getNotifications();
        set({
          notifications: items.map((item) => normalizeNotification(item as unknown as Record<string, unknown>)),
          loading: false,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load notifications';
        set({ error: message, loading: false });
      }
    },
    addNotification: (notif) => set((state) => ({
      notifications: [
        {
          ...notif,
          id: `notif-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          read: false
        },
        ...state.notifications
      ]
    })),
    addNotificationRealtime: (notification) => set((state) => {
      if (state.notifications.some((existing) => existing.id === notification.id)) {
        return {
          notifications: state.notifications.map((existing) =>
            existing.id === notification.id ? notification : existing
          ),
        };
      }
      return { notifications: [notification, ...state.notifications] };
    }),
    markAsRead: (id) => set((state) => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    })),
    markAllAsRead: () => set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true }))
    })),
    clearNotification: (id) => set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),
    clearAll: () => set({ notifications: [] }),
    setRealtimeConnected: (connected) => set({ isRealtimeConnected: connected }),
  }))
);
export default useNotificationStore;
