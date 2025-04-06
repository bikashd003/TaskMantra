import { connectDB } from '@/Utility/db';
import { Notification } from '@/models/Notification';
import { sendNotificationToUser } from '@/app/api/notifications/sse/route';

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
      await connectDB();

      const notification = new Notification({
        userId: data.userId,
        title: data.title,
        description: data.description,
        type: data.type,
        link: data.link || '',
        metadata: data.metadata || {},
        read: false,
        createdAt: new Date()
      });

      await notification.save();

      await sendNotificationToUser(data.userId, notification);

      return notification;
  }

  static async getNotifications(userId: string, page = 0, limit = 10): Promise<any> {
      await connectDB();

      const skip = page * limit;

      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments({ userId });

      return {
        notifications,
        nextPage: skip + notifications.length < total ? page + 1 : null,
        hasMore: skip + notifications.length < total
      };
  }


  static async markAsRead(notificationId: string, userId: string): Promise<any> {
      await connectDB();

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true },
        { new: true }
      );

      return notification;
  }

  static async markAllAsRead(userId: string): Promise<any> {
      await connectDB();

      const result = await Notification.updateMany(
        { userId, read: false },
        { read: true }
      );

      return result;
  }

  static async deleteNotification(notificationId: string, userId: string): Promise<any> {
      await connectDB();

      const result = await Notification.findOneAndDelete({ _id: notificationId, userId });

      return result;
  }

  static async clearAllNotifications(userId: string): Promise<any> {

      await connectDB();

      const result = await Notification.deleteMany({ userId });

      return result;
  }

  static async getUnreadCount(userId: string): Promise<number> {
      await connectDB();

      const count = await Notification.countDocuments({ userId, read: false });

      return count;
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
      metadata: { taskId, assignedBy }
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
      metadata: { organizationName }
    });
  }
}
