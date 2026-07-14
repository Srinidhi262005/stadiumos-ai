import { create } from 'zustand';
import { OperationTimelineEvent } from '../types/common';

export interface SystemNotification extends OperationTimelineEvent {
  read: boolean;
}

interface NotificationStoreState {
  notifications: SystemNotification[];
  addNotification: (notification: Omit<SystemNotification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  notifications: [
    {
      id: 'mock-1',
      title: 'Gate 4 High Traffic',
      description: 'AI model detects crowd surge at Gate 4. Rerouting recommendation generated.',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      category: 'ai',
      severity: 'warning',
      read: false
    },
    {
      id: 'mock-2',
      title: 'Elevator operational loss',
      description: 'Elevator #2 (North Stand) reporting standard engine maintenance fault.',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      category: 'system',
      severity: 'info',
      read: true
    }
  ],
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
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  clearNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  clearAll: () => set({ notifications: [] })
}));
export default useNotificationStore;
