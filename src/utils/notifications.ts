import { NotificationType } from '@/hooks/useNotifications';

/**
 * Format a notification timestamp to a human-readable string
 */
export function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Get a notification title based on its type and metadata
 */
export function getNotificationTitle(notification: NotificationType): string {
  const { type, metadata, title } = notification;
  
  // If there's a custom title, use it
  if (title) return title;
  
  // Otherwise, generate a title based on the type
  switch (type) {
    case 'task':
      return 'New Task Assignment';
    case 'mention':
      return 'You were mentioned';
    case 'team':
      return 'Team Update';
    case 'onboarding':
      return `Welcome to ${metadata?.organizationName || 'TaskMantra'}`;
    case 'system':
    default:
      return 'System Notification';
  }
}

/**
 * Get a notification description based on its type and metadata
 */
export function getNotificationDescription(notification: NotificationType): string {
  const { type, metadata, description } = notification;
  
  // If there's a custom description, use it
  if (description) return description;
  
  // Otherwise, generate a description based on the type
  switch (type) {
    case 'task':
      return `You have been assigned to "${metadata?.taskName || 'a task'}" by ${metadata?.assignedBy || 'a team member'}`;
    case 'mention':
      return `${metadata?.mentionedBy || 'Someone'} mentioned you in ${metadata?.context || 'a comment'}`;
    case 'team':
      return `${metadata?.action || 'An update'} in your team ${metadata?.teamName || ''}`;
    case 'onboarding':
      return `You have been successfully onboarded to ${metadata?.organizationName || 'TaskMantra'}`;
    case 'system':
    default:
      return 'You have a new system notification';
  }
}

/**
 * Get a notification link based on its type and metadata
 */
export function getNotificationLink(notification: NotificationType): string {
  const { type, metadata, link } = notification;
  
  // If there's a custom link, use it
  if (link) return link;
  
  // Otherwise, generate a link based on the type
  switch (type) {
    case 'task':
      return `/dashboard/tasks/${metadata?.taskId || ''}`;
    case 'mention':
      return metadata?.link || '/dashboard';
    case 'team':
      return `/dashboard/team/${metadata?.teamId || ''}`;
    case 'onboarding':
      return '/dashboard/getting-started';
    case 'system':
    default:
      return '/dashboard';
  }
}

/**
 * Check if browser notifications are supported
 */
export function areBrowserNotificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Request permission for browser notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!areBrowserNotificationsSupported()) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

/**
 * Show a browser notification
 */
export function showBrowserNotification(
  title: string, 
  options?: globalThis.NotificationOptions
): void {
  if (
    areBrowserNotificationsSupported() && 
    Notification.permission === 'granted'
  ) {
    new Notification(title, options);
  }
}

