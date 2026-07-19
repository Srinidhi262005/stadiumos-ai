import apiClient from './client';
import { NotificationItem } from '../../types/notifications';

export const NotificationsService = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await apiClient.get<NotificationItem[]>('/notifications');
    return response.data;
  },
  createNotification: async (input: Omit<NotificationItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationItem> => {
    const response = await apiClient.post<NotificationItem>('/notifications', {
      user_id: input.userId,
      title: input.title,
      message: input.message,
      is_read: input.isRead,
    });
    return response.data;
  },
  updateNotification: async (id: string, payload: { isRead?: boolean }): Promise<NotificationItem> => {
    const response = await apiClient.put<NotificationItem>(`/notifications/${id}`, {
      is_read: payload.isRead,
    });
    return response.data;
  },
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};

export default NotificationsService;
