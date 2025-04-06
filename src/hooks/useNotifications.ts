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
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
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
  }, [notifications, queryClient]);

  // Function to mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read');
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
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

    let eventSource: EventSource | null = null;
    
    const connectSSE = () => {
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
      };
      
      // Handle incoming messages
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification') {
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
          } 
          else if (data.type === 'notifications') {
            // Batch of notifications
            const newNotifications = data.notifications;
            
            setNotifications(prev => {
              // Merge notifications, avoiding duplicates
              const existingIds = new Set(prev.map(n => n._id));
              const uniqueNew = newNotifications.filter(n => !existingIds.has(n._id));
              return [...uniqueNew, ...prev];
            });
            
            // Update unread count
            fetchUnreadCount();
            
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          setError('Failed to parse SSE data');
        }
      };
      
      // Handle errors
      eventSource.onerror = (_err) => {
        setIsConnected(false);
        setError('Connection to notification server lost. Reconnecting...');
        
        // Close the connection
        eventSource?.close();
        
        // Try to reconnect after a delay
        setTimeout(connectSSE, 5000);
      };
    };
    
    // Initial connection
    connectSSE();
    
    // Initial data fetch
    fetchNotifications().then(data => {
      setNotifications(data.notifications || []);
    });
    
    fetchUnreadCount();
    
    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
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
        icon: '/public/logo.png' 
      });
    }
  };

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    try {
      if (
        typeof window !== 'undefined' && 
        'Notification' in window
      ) {
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
    requestNotificationPermission
  };
}
