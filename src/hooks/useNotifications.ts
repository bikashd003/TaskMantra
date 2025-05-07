'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { NotificationService } from '@/services/Notifications.service';

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

export function useNotifications() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Query for notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await NotificationService.getNotifications();
      return response;
    },
    enabled: !!session?.user,
  });

  // Query for unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const count = await NotificationService.getUnreadCount();
      return count;
    },
    enabled: !!session?.user,
  });

  // Mutation to mark a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await NotificationService.markAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  // Mutation to mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await NotificationService.markAllAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  // Mutation to clear all notifications
  const clearAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      return await NotificationService.clearAllNotifications();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  // Set up SSE connection for real-time notifications
  useEffect(() => {
    if (!session?.user) return;

    let eventSource: EventSource | null = null;
    let reconnectAttempt = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let lastHeartbeat = Date.now();
    let heartbeatCheckInterval: ReturnType<typeof setInterval> | null = null;

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

      // Set last heartbeat to now
      lastHeartbeat = Date.now();

      // Check every 30 seconds if we've received a heartbeat in the last 45 seconds
      heartbeatCheckInterval = setInterval(() => {
        const now = Date.now();
        const timeSinceLastHeartbeat = now - lastHeartbeat;

        // If no heartbeat for 45 seconds, reconnect
        if (timeSinceLastHeartbeat > 45000) {
          // Close existing connection
          if (eventSource) {
            eventSource.close();
          }

          // Reset connection state
          setIsConnected(false);
          setError('Connection timeout. Reconnecting...');

          // Reconnect
          if (reconnectTimer) {
            clearTimeout(reconnectTimer);
          }
          reconnectTimer = setTimeout(connectSSE, getReconnectDelay());
        }
      }, 30000);
    };

    const connectSSE = () => {
      // Clear any existing timers
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      // Close any existing connection
      if (eventSource) {
        eventSource.close();
      }

      // Create a new EventSource connection
      eventSource = new EventSource('/api/notifications/sse');

      // Connection opened
      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempt = 0; // Reset reconnect attempts on successful connection
        startHeartbeatCheck(); // Start monitoring heartbeats
      };

      // Handle incoming messages
      eventSource.onmessage = event => {
        try {
          const data = JSON.parse(event.data);

          // Update last heartbeat timestamp for any message
          lastHeartbeat = Date.now();

          if (data.type === 'heartbeat') {
            // Just a heartbeat, no need to process further
            return;
          } else if (data.type === 'connection') {
            // Connection established message
          } else if (data.type === 'notification') {
            // Single new notification
            const newNotification = data.notification;

            // Show browser notification if enabled
            showBrowserNotification(newNotification);

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
          } else if (data.type === 'notifications') {
            // Batch of notifications - invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
          }
        } catch (error) {
          setError('Failed to parse SSE data');
        }
      };

      // Handle errors
      eventSource.onerror = _err => {
        setIsConnected(false);
        setError('Connection to notification server lost. Reconnecting...');

        // Close the connection
        eventSource?.close();

        // Increment reconnect attempt counter
        reconnectAttempt++;

        // Try to reconnect with exponential backoff
        const delay = getReconnectDelay();
        reconnectTimer = setTimeout(connectSSE, delay);
      };
    };

    // Initial connection
    connectSSE();

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      if (heartbeatCheckInterval) {
        clearInterval(heartbeatCheckInterval);
      }
    };
  }, [session, queryClient]);

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
    } catch (error) {
      return false;
    }
  }, []);

  // Wrapper functions to maintain the same API
  const markAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
      return true;
    } catch (err) {
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();

      // Update local state to mark all notifications as read
      const currentData = queryClient.getQueryData<{ notifications: NotificationType[] }>([
        'notifications',
      ]);
      if (currentData?.notifications) {
        const updatedNotifications = currentData.notifications.map(notification => ({
          ...notification,
          read: true,
        }));
        queryClient.setQueryData(['notifications'], {
          ...currentData,
          notifications: updatedNotifications,
        });
      }

      return true;
    } catch (err) {
      return false;
    }
  };

  const clearAllNotifications = async () => {
    try {
      await clearAllNotificationsMutation.mutateAsync();
      // Update local state to reflect cleared notifications
      queryClient.setQueryData(['notifications'], { notifications: [] });
      return true;
    } catch (err) {
      return false;
    }
  };

  // For backward compatibility and pagination support
  const fetchNotifications = useCallback(async (page = 0) => {
    try {
      const response = await NotificationService.getNotifications(page);
      return {
        notifications: response.notifications || [],
        hasMore: response.pagination?.page < response.pagination?.pages - 1,
        nextPage: response.pagination?.page + 1,
      };
    } catch (error) {
      setError('Failed to fetch notifications');
      return { notifications: [], hasMore: false };
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    return unreadCountData || 0;
  }, [unreadCountData]);

  return {
    notifications: notificationsData?.notifications || [],
    unreadCount: unreadCountData || 0,
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
