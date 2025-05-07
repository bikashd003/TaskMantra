import axios from 'axios';

export interface NotificationData {
  userId: string;
  title: string;
  description: string;
  type: 'mention' | 'task' | 'team' | 'system' | 'onboarding';
  link?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  static async createNotification(data: NotificationData): Promise<any> {
    const notification = {
      userId: data.userId,
      title: data.title,
      description: data.description,
      type: data.type,
      link: data.link || '',
      metadata: data.metadata || {},
      read: false,
      createdAt: new Date(),
    };

    const response = await axios.post('/api/notifications', notification);
    return response.data;
  }

  static async getNotifications(page = 0, limit = 10, filter = 'all', search = ''): Promise<any> {
    const response = await axios.get('/api/notifications', {
      params: { page, limit, filter, search },
    });
    return response.data;
  }

  static async markAsRead(notificationId: string): Promise<any> {
    const response = await axios.patch(`/api/notifications/${notificationId}/read`);
    return response.data.notification;
  }

  static async markAllAsRead(): Promise<any> {
    const response = await axios.patch('/api/notifications/mark-all-read');
    return response.data.result;
  }

  static async deleteNotification(notificationId: string): Promise<any> {
    const response = await axios.delete(`/api/notifications/${notificationId}`);
    return response.data.result;
  }

  static async clearAllNotifications(): Promise<any> {
    const response = await axios.delete('/api/notifications/clear-all');
    return response.data.result;
  }

  static async getUnreadCount(): Promise<number> {
    const response = await axios.get('/api/notifications/unread-count');
    return response.data.count;
  }

  /**
   * Create a task assignment notification
   */
  static async createTaskAssignedNotification(
    userId: string,
    taskId: string,
    taskName: string,
    assignedBy: string
  ): Promise<any> {
    return this.createNotification({
      userId,
      title: 'New Task Assigned',
      description: `You have been assigned to "${taskName}" by ${assignedBy}`,
      type: 'task',
      link: `/home/tasks/${taskId}`,
      metadata: { taskId, assignedBy },
    });
  }

  /**
   * Create an onboarding notification
   */
  static async createOnboardingNotification(
    userId: string,
    organizationName: string
  ): Promise<any> {
    return this.createNotification({
      userId,
      title: 'Welcome to TaskMantra',
      description: `You have been successfully onboarded to ${organizationName}`,
      type: 'onboarding',
      link: '/home',
      metadata: { organizationName },
    });
  }

  /**
   * Create a task status change notification
   */
  static async createTaskStatusChangeNotification(
    userId: string,
    taskId: string,
    taskName: string,
    oldStatus: string,
    newStatus: string
  ): Promise<any> {
    return this.createNotification({
      userId,
      title: 'Task Status Changed',
      description: `Task "${taskName}" moved from ${oldStatus} to ${newStatus}`,
      type: 'task',
      link: `/tasks?id=${taskId}`,
      metadata: { taskId, oldStatus, newStatus },
    });
  }

  /**
   * Create a task comment notification
   */
  static async createTaskCommentNotification(
    userId: string,
    taskId: string,
    taskName: string,
    commenterName: string
  ): Promise<any> {
    return this.createNotification({
      userId,
      title: 'New Comment on Task',
      description: `${commenterName} commented on task "${taskName}"`,
      type: 'task',
      link: `/tasks?id=${taskId}`,
      metadata: { taskId, commenterName },
    });
  }
}
