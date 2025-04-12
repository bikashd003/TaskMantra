'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useNotifications, NotificationType } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { showBrowserNotification } from '@/utils/notifications';

// Create context
type NotificationContextType = {
  notifications: NotificationType[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (_id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  clearAllNotifications: () => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    requestNotificationPermission,
  } = useNotifications();

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Show toast and browser notification when a new notification arrives
  useEffect(() => {
    // We need to track the last notification we've seen
    const lastNotificationKey = 'last-notification-id';
    const lastNotificationId = localStorage.getItem(lastNotificationKey);
    
    // Check if there are any new notifications
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // Only show notification if it's new and unread
      if (
        latestNotification._id !== lastNotificationId && 
        !latestNotification.read
      ) {
        // Save this notification ID as the last one we've seen
        localStorage.setItem(lastNotificationKey, latestNotification._id);
        
        // Show toast notification
        toast({
          title: latestNotification.title,
          description: latestNotification.description,
          action: (
            <a 
              href={latestNotification.link} 
              className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              onClick={() => markAsRead(latestNotification._id)}
            >
              View
            </a>
          ),
        });
        
        // Show browser notification
        showBrowserNotification(latestNotification.title, {
          body: latestNotification.description,
          icon: '/public/logo.png', 
        });
      }
    }
  }, [notifications, toast, markAsRead]);

  // Provide the notification context to children
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use the notification context
export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
