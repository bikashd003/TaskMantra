'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { NotificationService } from '@/services/Notification.service';

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

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await NotificationService.getNotificationsClient();
      return response;
    },
    enabled: !!session?.user,
  });

  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const count = await NotificationService.getUnreadCountClient();
      return count;
    },
    enabled: !!session?.user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await NotificationService.markAsReadClient(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await NotificationService.markAllAsReadClient();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const clearAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      return await NotificationService.clearAllNotificationsClient();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  useEffect(() => {
    if (!session?.user) return;

    let eventSource: EventSource | null = null;
    let reconnectAttempt = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let lastHeartbeat = Date.now();
    let heartbeatCheckInterval: ReturnType<typeof setInterval> | null = null;
    let lastEventId = '';
    const CONNECTION_STATUS_KEY = 'sse-connection-status';
    const setConnectionStatus = (status: string) => {
      try {
        localStorage.setItem(CONNECTION_STATUS_KEY, status);
      } catch (e) {
        // Ignore localStorage errors
      }
    };

    const getReconnectDelay = () => {
      const baseDelay = 1000;
      const maxDelay = 30000;
      return Math.min(baseDelay * Math.pow(1.5, reconnectAttempt), maxDelay);
    };

    const startHeartbeatCheck = () => {
      if (heartbeatCheckInterval) {
        clearInterval(heartbeatCheckInterval);
      }

      lastHeartbeat = Date.now();

      heartbeatCheckInterval = setInterval(() => {
        const now = Date.now();
        const timeSinceLastHeartbeat = now - lastHeartbeat;

        if (timeSinceLastHeartbeat > 60000) {
          if (eventSource) {
            eventSource.close();
          }

          setIsConnected(false);
          setError('Connection timeout. Reconnecting...');
          setConnectionStatus('disconnected');

          // Reconnect
          if (reconnectTimer) {
            clearTimeout(reconnectTimer);
          }
          reconnectTimer = setTimeout(connectSSE, getReconnectDelay());
        }
      }, 45000);
    };

    const connectSSE = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      if (eventSource) {
        eventSource.close();
      }

      try {
        const url = new URL('/api/notifications/sse', window.location.origin);

        url.searchParams.append('_', Date.now().toString());

        if (lastEventId) {
          url.searchParams.append('lastEventId', lastEventId);
        }

        const options = {
          withCredentials: true,
        };

        eventSource = new EventSource(url.toString(), options);

        eventSource.addEventListener('open', () => {
          setIsConnected(true);
          setError(null);
          reconnectAttempt = 0;
          setConnectionStatus('connected');
          startHeartbeatCheck();
        });

        eventSource.addEventListener('message', event => {
          try {
            if (event.lastEventId) {
              lastEventId = event.lastEventId;
            }

            lastHeartbeat = Date.now();

            const data = JSON.parse(event.data);

            if (data.type === 'heartbeat') {
              return;
            } else if (data.type === 'connection') {
              // Connection established message
            } else if (data.type === 'notification') {
              const newNotification = data.notification;

              showBrowserNotification(newNotification);

              queryClient.invalidateQueries({ queryKey: ['notifications'] });
              queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
            } else if (data.type === 'notifications') {
              queryClient.invalidateQueries({ queryKey: ['notifications'] });
              queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
            }
          } catch (error) {
            setError('Failed to parse SSE data');
          }
        });

        eventSource.addEventListener('error', () => {
          setIsConnected(false);
          setError('Connection to notification server lost. Reconnecting...');
          setConnectionStatus('disconnected');

          eventSource?.close();

          reconnectAttempt++;

          // Try to reconnect with exponential backoff
          const delay = getReconnectDelay();
          reconnectTimer = setTimeout(connectSSE, delay);
        });
      } catch (error) {
        setIsConnected(false);
        setError('Failed to establish SSE connection');
        setConnectionStatus('failed');

        reconnectAttempt++;
        const delay = getReconnectDelay();
        reconnectTimer = setTimeout(connectSSE, delay);
      }
    };

    connectSSE();

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

      setConnectionStatus('closed');
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
      const response = await NotificationService.getNotificationsClient(page);
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
