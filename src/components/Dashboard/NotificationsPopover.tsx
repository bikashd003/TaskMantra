import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Bell,
  Clock,
  MailIcon,
  UserPlus,
  AlertCircle,
  Loader2,
  WifiOff,
  CheckCheck,
  Trash2,
  Settings,
  Users,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useNotifications, NotificationType } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationsPopover() {
  const [open, setOpen] = React.useState(false);
  const { ref, inView } = useInView();
  const {
    notifications,
    unreadCount,
    isConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    requestNotificationPermission,
  } = useNotifications();

  React.useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['notifications-infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await fetchNotifications(pageParam);
      return result;
    },
    getNextPageParam: lastPage => (lastPage.hasMore ? lastPage.nextPage : undefined),
    initialPageParam: 0,
    enabled: !!open,
  });

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const allNotifications = React.useMemo(() => {
    if (
      notifications.length === 0 &&
      (!data?.pages || data.pages.length === 0 || data.pages[0].notifications.length === 0)
    ) {
      return [];
    }

    const paginatedNotifications = data?.pages?.flatMap(page => page.notifications) || [];
    const existingIds = new Set(paginatedNotifications.map((n: NotificationType) => n._id));

    const uniqueSSENotifications = notifications.filter(
      (n: NotificationType) => !existingIds.has(n._id)
    );

    return [...uniqueSSENotifications, ...paginatedNotifications].sort(
      (a: NotificationType, b: NotificationType) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data, notifications]);

  const getNotificationIcon = (type: NotificationType['type']) => {
    const iconStyles = 'h-4 w-4';

    const getContainerStyles = (
      colorFrom: string,
      colorTo: string,
      darkColorFrom: string,
      darkColorTo: string
    ) => {
      return `p-2 rounded-lg shadow-sm bg-gradient-to-br from-${colorFrom}/15 to-${colorTo}/10 dark:from-${darkColorFrom}/15 dark:to-${darkColorTo}/10 ring-1 ring-${colorFrom}/20 dark:ring-${darkColorFrom}/20`;
    };

    const getIconStyles = (color: string, darkColor: string) => {
      return `${iconStyles} text-${color}-600 dark:text-${darkColor}-400 drop-shadow-sm`;
    };

    switch (type) {
      case 'mention':
        return (
          <div className={getContainerStyles('blue', 'sky', 'blue', 'sky')}>
            <Bell className={getIconStyles('blue', 'blue')} />
          </div>
        );
      case 'task':
        return (
          <div className={getContainerStyles('purple', 'violet', 'purple', 'violet')}>
            <Clock className={getIconStyles('purple', 'purple')} />
          </div>
        );
      case 'team':
        return (
          <div className={getContainerStyles('emerald', 'green', 'emerald', 'green')}>
            <Users className={getIconStyles('emerald', 'emerald')} />
          </div>
        );
      case 'onboarding':
        return (
          <div className={getContainerStyles('indigo', 'violet', 'indigo', 'violet')}>
            <UserPlus className={getIconStyles('indigo', 'indigo')} />
          </div>
        );
      case 'system':
        return (
          <div className={getContainerStyles('amber', 'yellow', 'amber', 'yellow')}>
            <Settings className={getIconStyles('amber', 'amber')} />
          </div>
        );
      default:
        return (
          <div className={getContainerStyles('slate', 'gray', 'slate', 'gray')}>
            <MailIcon className={getIconStyles('slate', 'slate')} />
          </div>
        );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const queryClient = useQueryClient();

  const handleClearNotifications = async () => {
    try {
      const success = await clearAllNotifications();

      if (success) {
        queryClient.setQueryData(['notifications'], { notifications: [] });
        queryClient.setQueryData(['notifications-infinite'], {
          pages: [{ notifications: [], hasMore: false }],
          pageParams: [0],
        });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-infinite'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });

        toast.success('All notifications cleared');
      } else {
        toast.error('Failed to clear notifications');
      }
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setOpen(false);
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleRefreshNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-infinite'] });
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    toast.success('Notifications refreshed');
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error: any) {
      toast.error('Failed to format timestamp', { description: error.message });
      return timestamp;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative theme-button-secondary theme-shadow-sm overflow-visible"
        >
          <span className="relative inline-flex">
            <Bell className="h-6 w-6 group-hover:text-primary transition-colors duration-300" />
            {unreadCount > 0 && <span className="absolute inset-0 z-0 animate-ping-slow" />}
          </span>

          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 text-[10px] font-medium text-white flex items-center justify-center shadow-md ring-2 ring-background"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[420px] p-0 theme-shadow-lg theme-border backdrop-blur-xl theme-surface-elevated rounded-xl overflow-hidden"
        align="end"
        sideOffset={10}
        asChild
      >
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col theme-divider">
            <div className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold theme-text-primary">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-xs px-2.5 py-0.5 h-5 font-medium rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 shadow-sm"
                  >
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full theme-button-ghost"
                onClick={handleRefreshNotifications}
                title="Refresh notifications"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between px-5 py-2.5 theme-surface">
              <div className="text-xs theme-text-secondary">
                {allNotifications.length > 0
                  ? `${allNotifications.length} notification${allNotifications.length !== 1 ? 's' : ''}`
                  : 'No notifications'}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs theme-hover-primary h-7 rounded-md"
                  onClick={handleMarkAllAsRead}
                  disabled={allNotifications.length === 0 || allNotifications.every(n => n.read)}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                  Mark all read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs hover:bg-destructive/10 hover:text-destructive theme-transition h-7 rounded-md"
                  onClick={handleClearNotifications}
                  disabled={allNotifications.length === 0}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Clear all
                </Button>
              </div>
            </div>
          </div>
          <ScrollArea className="h-[500px] overflow-y-auto">
            {!isConnected && (
              <div className="p-3 bg-amber-50/30 dark:bg-amber-950/20 border-b border-amber-100/50 dark:border-amber-800/30 flex items-center justify-center gap-2 backdrop-blur-sm">
                <WifiOff className="h-4 w-4 text-amber-500 dark:text-amber-400 animate-pulse" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Reconnecting to notification server...
                </p>
              </div>
            )}
            {status === 'pending' ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75"></div>
                    <div className="relative p-3 rounded-full bg-primary/10 backdrop-blur-sm">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  </div>
                  <p className="text-sm theme-text-secondary">Loading your notifications...</p>
                </div>
              </div>
            ) : status === 'error' ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="flex flex-col items-center gap-4 max-w-[250px] text-center">
                  <div className="p-4 rounded-full bg-destructive/10 ring-1 ring-destructive/20">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1 theme-text-primary">
                      Failed to load notifications
                    </p>
                    <p className="text-xs theme-text-secondary mb-4">
                      There was a problem connecting to the notification service
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-md theme-hover-primary theme-border"
                    onClick={handleRefreshNotifications}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            ) : allNotifications.length > 0 ? (
              <div className="divide-y divide-border/30">
                <AnimatePresence>
                  {allNotifications.map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Link
                        href={notification.link || '/dashboard/notifications'}
                        onClick={() => handleNotificationClick(notification._id)}
                        className={cn(
                          'flex items-start gap-3 px-5 py-4 theme-hover-surface relative group',
                          !notification.read ? 'bg-primary/5' : ''
                        )}
                      >
                        {!notification.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/80 to-primary/40" />
                        )}

                        <div className="shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p
                              className={cn(
                                'text-sm leading-tight truncate',
                                !notification.read
                                  ? 'font-semibold theme-text-primary'
                                  : 'font-medium theme-text-primary'
                              )}
                            >
                              {notification.title}
                            </p>
                            <p className="text-xs theme-text-secondary whitespace-nowrap flex items-center gap-1.5">
                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                              )}
                              {formatTimestamp(notification.createdAt)}
                            </p>
                          </div>
                          <p className="text-sm theme-text-secondary line-clamp-2 mt-0.5 group-hover:text-foreground/80 theme-transition">
                            {notification.description}
                          </p>
                        </div>

                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 self-center">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCheck className="h-3 w-3 text-primary" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={ref} className="py-4 flex items-center justify-center">
                  {isFetchingNextPage && (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center px-6">
                <div className="flex flex-col items-center justify-center text-center space-y-5">
                  <div className="relative">
                    {/* Decorative elements */}
                    <div className="absolute -top-6 -left-6 h-4 w-4 rounded-full bg-primary/20 animate-pulse-slow"></div>
                    <div className="absolute -bottom-8 -right-8 h-6 w-6 rounded-full bg-primary/10 animate-pulse-slow animation-delay-700"></div>
                    <div className="absolute top-1/2 -right-10 h-3 w-3 rounded-full bg-primary/15 animate-pulse-slow animation-delay-1000"></div>

                    {/* Main icon */}
                    <div className="p-5 rounded-full bg-gradient-to-br from-muted/80 to-muted/30 backdrop-blur-sm ring-1 ring-border/50 shadow-sm">
                      <Bell className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-medium mb-1.5 theme-text-primary">
                      All caught up!
                    </h3>
                    <p className="text-sm theme-text-secondary max-w-[260px]">
                      You don&apos;t have any notifications right now. We&apos;ll notify you when
                      something arrives.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="p-4 theme-divider theme-surface">
            <Link href="/home/notifications" onClick={() => setOpen(false)}>
              <Button
                size="sm"
                className="w-full font-medium rounded-md theme-button-primary theme-shadow-sm"
              >
                View all notifications
              </Button>
            </Link>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
