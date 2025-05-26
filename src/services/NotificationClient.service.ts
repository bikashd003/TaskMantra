// Client-side notification service - for client components only
'use client';

import axios from 'axios';

export interface NotificationData {
  userId: string;
  title: string;
  description: string;
  type:
    | 'mention'
    | 'task'
    | 'team'
    | 'system'
    | 'onboarding'
    | 'integration'
    | 'success'
    | 'info'
    | 'error';
  link?: string;
  metadata?: Record<string, any>;
}

export class NotificationClientService {
  static async getNotificationsClient(
    page = 0,
    limit = 10,
    filter = 'all',
    search = ''
  ): Promise<any> {
    const response = await axios.get('/api/notifications', {
      params: { page, limit, filter, search },
    });
    return response.data;
  }

  static async markAsReadClient(notificationId: string): Promise<any> {
    const response = await axios.patch(`/api/notifications/${notificationId}/read`);
    return response.data.notification;
  }

  static async markAllAsReadClient(): Promise<any> {
    const response = await axios.patch('/api/notifications/mark-all-read');
    return response.data.result;
  }

  static async deleteNotificationClient(notificationId: string): Promise<any> {
    const response = await axios.delete(`/api/notifications/${notificationId}`);
    return response.data.result;
  }

  static async clearAllNotificationsClient(): Promise<any> {
    const response = await axios.delete('/api/notifications/clear-all');
    return response.data.result;
  }

  static async getUnreadCountClient(): Promise<number> {
    const response = await axios.get('/api/notifications/unread-count');
    return response.data.count;
  }

  static async createNotificationClient(data: Omit<NotificationData, 'userId'>): Promise<any> {
    const notification = {
      title: data.title,
      description: data.description,
      type: data.type,
      link: data.link || '',
      metadata: data.metadata || {},
    };

    const response = await axios.post('/api/notifications', notification);
    return response.data;
  }
}
