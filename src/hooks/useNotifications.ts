'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';

export type NotificationType = {
  _id: string;
  userId: string;
  title: string;
  description: string;
  type: 'mention' | 'task' | 'team' | 'system' | 'onboarding';
  read: boolean;
  link: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

// Global connection tracking to prevent multiple connections
// Using a singleton pattern for the EventSource connection
class NotificationConnection {
  private static instance: NotificationConnection;
  private eventSource: EventSource | null = null;
  private lastHeartbeat: number = Date.now();
  private connectedClients: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): NotificationConnection {
    if (!NotificationConnection.instance) {
      NotificationConnection.instance = new NotificationConnection();
    }
    return NotificationConnection.instance;
  }

  public connect(clientId: string): EventSource {
    this.connectedClients.add(clientId);

    if (!this.eventSource || this.eventSource.readyState === EventSource.CLOSED) {
      // console.log('Creating new SSE connection');
      this.eventSource = new EventSource('/api/notifications/sse');
    }

    return this.eventSource;
  }

  public disconnect(clientId: string): void {
    this.connectedClients.delete(clientId);

    if (this.connectedClients.size === 0 && this.eventSource) {
      // console.log('Closing SSE connection - no more clients');
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  public updateHeartbeat(): void {
    this.lastHeartbeat = Date.now();
  }

  public getLastHeartbeat(): number {
    return this.lastHeartbeat;
  }

  public getEventSource(): EventSource | null {
    return this.eventSource;
  }
}

// Get the singleton instance
const notificationConnection = NotificationConnection.getInstance();

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Function to fetch notifications
  const fetchNotifications = useCallback(async (page = 0, limit = 10) => {
    try {
      const response = await axios.get(`/api/notifications?page=${page}&limit=${limit}`);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
      return { notifications: [], hasMore: false };
    }
  }, []);

  // Function to fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get('/api/notifications/unread-count');
      setUnreadCount(response.data.count);
      return response.data.count;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch unread count');
      return 0;
    }
  }, []);

  // Function to mark a notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await axios.patch(`/api/notifications/${notificationId}/read`);

        // Update local state
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === notificationId ? { ...notification, read: true } : notification
          )
        );

        // Decrement unread count if the notification was unread
        const notification = notifications.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['notifications'] });

        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to mark notification as read');
        return false;
      }
    },
    [notifications, queryClient]
  );

  // Function to mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read');

      // Update local state
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));

      // Reset unread count
      setUnreadCount(0);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
      return false;
    }
  }, [queryClient]);

  // Function to clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      await axios.delete('/api/notifications/clear-all');

      // Update local state
      setNotifications([]);
      setUnreadCount(0);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to clear notifications');
      return false;
    }
  }, [queryClient]);

  // Set up SSE connection
  useEffect(() => {
    if (!session?.user) return;

    // Generate a unique client ID for this component instance
    const clientId = `notification-client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Track if this component instance is mounted
    const isMounted = { current: true };
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let heartbeatCheckInterval: ReturnType<typeof setInterval> | null = null;
    let reconnectAttempt = 0;

    // Function to calculate backoff time based on reconnect attempts
    const getReconnectDelay = () => {
      // Exponential backoff with a maximum of 30 seconds
      const baseDelay = 1000; // 1 second
      const maxDelay = 30000; // 30 seconds
      return Math.min(baseDelay * Math.pow(1.5, reconnectAttempt), maxDelay);
    };

    // Function to check if the connection is still alive based on heartbeats
    const startHeartbeatCheck = () => {
      // Clear any existing interval
      if (heartbeatCheckInterval) {
        clearInterval(heartbeatCheckInterval);
      }

      // Check every 30 seconds if we've received a heartbeat in the last 45 seconds
      heartbeatCheckInterval = setInterval(() => {
        if (!isMounted.current) return;

        const now = Date.now();
        const lastHeartbeat = notificationConnection.getLastHeartbeat();
        const timeSinceLastHeartbeat = now - lastHeartbeat;

        // If no heartbeat for 45 seconds, reconnect
        if (timeSinceLastHeartbeat > 45000) {
          // Reset connection state
          setIsConnected(false);
          setError('Connection timeout. Reconnecting...');

          // Reconnect
          if (reconnectTimer) {
            clearTimeout(reconnectTimer);
          }

          // Increment reconnect attempt counter
          reconnectAttempt++;

          // Try to reconnect with exponential backoff
          const delay = getReconnectDelay();
          reconnectTimer = setTimeout(connectSSE, delay);
        }
      }, 30000);
    };

    const handleMessage = (event: MessageEvent) => {
      if (!isMounted.current) return;

      try {
        const data = JSON.parse(event.data);

        // Update last heartbeat timestamp for any message
        notificationConnection.updateHeartbeat();

        if (data.type === 'heartbeat') {
          // Just a heartbeat, no need to process further
          return;
        } else if (data.type === 'connection') {
          // Connection established message
          setIsConnected(true);
        } else if (data.type === 'notification') {
          // Single new notification
          const newNotification = data.notification;

          setNotifications(prev => [newNotification, ...prev]);

          if (!newNotification.read) {
            setUnreadCount(prev => prev + 1);
          }

          // Show browser notification if enabled
          showBrowserNotification(newNotification);

          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        } else if (data.type === 'notifications') {
          // Batch of notifications
          const newNotifications = data.notifications;

          setNotifications(prev => {
            // Merge notifications, avoiding duplicates
            const existingIds = new Set(prev.map((n: NotificationType) => n._id));
            const uniqueNew = newNotifications.filter(
              (n: NotificationType) => !existingIds.has(n._id)
            );
            return [...uniqueNew, ...prev];
          });

          // Update unread count
          fetchUnreadCount();

          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      } catch (error) {
        setError('Failed to parse SSE data');
      }
    };

    const handleError = async () => {
      if (!isMounted.current) return;

      setIsConnected(false);
      setError('Connection to notification server lost. Reconnecting...');

      // Check if the error is due to a 429 response (too many requests)
      try {
        const response = await fetch('/api/notifications/sse');

        if (response.status === 429) {
          // Get retry-after header or default to 5 seconds
          const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
          const retryMs = retryAfter * 1000;

          setError(`Too many connection attempts. Retrying in ${retryAfter} seconds.`);

          // Set a longer delay for reconnection
          if (reconnectTimer) {
            clearTimeout(reconnectTimer);
          }
          reconnectTimer = setTimeout(connectSSE, retryMs);
          return;
        }
      } catch (fetchError) {
        // Continue with standard reconnection
      }

      // Increment reconnect attempt counter
      reconnectAttempt++;

      // Try to reconnect with exponential backoff
      const delay = getReconnectDelay();

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      reconnectTimer = setTimeout(connectSSE, delay);
    };

    const connectSSE = () => {
      if (!isMounted.current) return;

      try {
        // Get the EventSource from the singleton
        const eventSource = notificationConnection.connect(clientId);

        // Set up event handlers
        eventSource.onmessage = handleMessage;
        eventSource.onerror = handleError;
        eventSource.onopen = () => {
          if (!isMounted.current) return;

          setIsConnected(true);
          setError(null);
          reconnectAttempt = 0; // Reset reconnect attempts on successful connection
          startHeartbeatCheck(); // Start monitoring heartbeats
        };

        // Start heartbeat check
        startHeartbeatCheck();
      } catch (error) {
        setError('Failed to establish notification connection');

        // Try to reconnect
        reconnectAttempt++;
        const delay = getReconnectDelay();
        reconnectTimer = setTimeout(connectSSE, delay);
      }
    };

    // Initial connection
    connectSSE();

    // Initial data fetch
    fetchNotifications().then(data => {
      if (isMounted.current) {
        setNotifications(data.notifications || []);
      }
    });

    fetchUnreadCount();

    // Cleanup on unmount
    return () => {
      isMounted.current = false;

      // Disconnect this client from the notification connection
      notificationConnection.disconnect(clientId);

      // Clear timers
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      if (heartbeatCheckInterval) {
        clearInterval(heartbeatCheckInterval);
      }
    };
  }, [session, fetchNotifications, fetchUnreadCount, queryClient]);

  // Function to show browser notifications
  const showBrowserNotification = (notification: NotificationType) => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(notification.title, {
        body: notification.description,
        icon: '/public/logo.png',
      });
    }
  };

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        // Always request permission unless already granted
        if (Notification.permission !== 'granted') {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        }
        return true;
      }
      return false;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  }, []);
  return {
    notifications,
    unreadCount,
    isConnected,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    requestNotificationPermission,
  };
}
