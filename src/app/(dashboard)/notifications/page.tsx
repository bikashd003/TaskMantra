'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotificationContext } from '@/components/Providers/NotificationProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Clock,
  Search,
  Trash2,
  CheckCheck,
  AlertCircle,
  Inbox,
  MailOpen,
  Users,
  Settings,
  RefreshCw,
  ExternalLink,
  Eye,
  Loader2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

interface Notification {
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
}

interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const ITEM_HEIGHT = 120;
const ITEMS_PER_PAGE = 20;

export default function NotificationsPage() {
  const { markAllAsRead, clearAllNotifications } = useNotificationContext();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const getBackendFilter = useMemo(() => {
    if (activeTab === 'unread') return 'unread';
    return filter;
  }, [activeTab, filter]);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } =
    useInfiniteQuery({
      queryKey: ['notifications-infinite', getBackendFilter, debouncedSearch],
      queryFn: async ({ pageParam = 0 }) => {
        const response = await fetch(
          `/api/notifications?page=${pageParam}&limit=${ITEMS_PER_PAGE}&filter=${getBackendFilter}&search=${debouncedSearch}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        return response.json() as Promise<NotificationResponse>;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage: NotificationResponse) => {
        const { page, pages } = lastPage.pagination;
        return page + 1 < pages ? page + 1 : undefined;
      },
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    });
  const allNotifications = useMemo(() => {
    return data?.pages.flatMap((page: NotificationResponse) => page.notifications) || [];
  }, [data]);

  const totalCount = (data?.pages[0] as NotificationResponse)?.pagination.total || 0;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-infinite'] });
      toast({ title: 'Notification marked as read' });
    },
    onError: () => {
      toast({ title: 'Failed to mark notification as read', variant: 'destructive' });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-infinite'] });
      toast({ title: 'Notification deleted' });
    },
    onError: () => {
      toast({ title: 'Failed to delete notification', variant: 'destructive' });
    },
  });

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.read) {
        markAsReadMutation.mutate(notification._id);
      }
      router.push(`/notifications/${notification._id}`);
    },
    [markAsReadMutation, router]
  );

  const handleNotificationLinkClick = useCallback(
    (e: React.MouseEvent, notification: Notification) => {
      e.stopPropagation();
      if (!notification.read) {
        markAsReadMutation.mutate(notification._id);
      }
      if (notification.link) {
        router.push(`/notifications/${notification._id}`);
      }
    },
    [markAsReadMutation, router]
  );

  const handleMarkAsRead = useCallback(
    (e: React.MouseEvent, notificationId: string) => {
      e.stopPropagation();
      markAsReadMutation.mutate(notificationId);
    },
    [markAsReadMutation]
  );

  const handleDeleteNotification = useCallback(
    (e: React.MouseEvent, notificationId: string) => {
      e.stopPropagation();
      deleteNotificationMutation.mutate(notificationId);
    },
    [deleteNotificationMutation]
  );

  const isItemLoaded = useCallback(
    (index: number) => {
      return !!allNotifications[index];
    },
    [allNotifications]
  );

  const loadMoreItems = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      return fetchNextPage();
    }
    return Promise.resolve();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getNotificationIcon = useCallback((type: string) => {
    const iconClasses = 'h-5 w-5';
    switch (type) {
      case 'mention':
        return (
          <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Bell className={`${iconClasses} text-blue-600 dark:text-blue-400`} />
          </div>
        );
      case 'task':
        return (
          <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/20">
            <Clock className={`${iconClasses} text-purple-600 dark:text-purple-400`} />
          </div>
        );
      case 'team':
        return (
          <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/20">
            <Users className={`${iconClasses} text-green-600 dark:text-green-400`} />
          </div>
        );
      case 'system':
        return (
          <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/20">
            <Settings className={`${iconClasses} text-amber-600 dark:text-amber-400`} />
          </div>
        );
      case 'onboarding':
        return (
          <div className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/20">
            <Bell className={`${iconClasses} text-indigo-600 dark:text-indigo-400`} />
          </div>
        );
      default:
        return (
          <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
            <Bell className={`${iconClasses} text-gray-600 dark:text-gray-400`} />
          </div>
        );
    }
  }, []);

  const getTimeAgo = useCallback((dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="theme-surface rounded-lg theme-shadow-sm p-6 h-full w-full"
    >
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Stay updated with your latest activities ({totalCount} total)
            </p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search and Filter Group */}
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-9 h-10 bg-background/50"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {activeTab === 'all' && (
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="h-10 w-full sm:w-[180px] bg-background/50">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="mention">Mentions</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="default"
              variant="outline"
              onClick={() => markAllAsRead()}
              className="flex-1 sm:flex-none items-center gap-2 hover:bg-primary hover:text-primary-foreground"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark all read</span>
            </Button>
            <Button
              size="default"
              variant="outline"
              onClick={() => clearAllNotifications()}
              className="flex-1 sm:flex-none items-center gap-2 hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear all</span>
            </Button>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto bg-background/50 p-1 rounded-lg">
            <TabsTrigger
              value="all"
              className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Inbox className="h-4 w-4 mr-2" />
              All
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <MailOpen className="h-4 w-4 mr-2" />
              Unread
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <NotificationsList
              notifications={allNotifications}
              isLoading={isLoading}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              loadMoreItems={loadMoreItems}
              isItemLoaded={isItemLoaded}
              onNotificationClick={handleNotificationClick}
              onNotificationLinkClick={handleNotificationLinkClick}
              onMarkAsRead={handleMarkAsRead}
              onDeleteNotification={handleDeleteNotification}
              getNotificationIcon={getNotificationIcon}
              getTimeAgo={getTimeAgo}
              refetch={refetch}
            />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}

// Notification Item Component for Virtual List
interface NotificationItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
    onNotificationLinkClick: (e: React.MouseEvent, notification: Notification) => void;
    onMarkAsRead: (e: React.MouseEvent, notificationId: string) => void;
    onDeleteNotification: (e: React.MouseEvent, notificationId: string) => void;
    getNotificationIcon: (type: string) => React.ReactNode;
    getTimeAgo: (dateString: string) => string;
  };
}

const NotificationItem: React.FC<NotificationItemProps> = ({ index, style, data }) => {
  const {
    notifications,
    onNotificationClick,
    onNotificationLinkClick,
    onMarkAsRead,
    onDeleteNotification,
    getNotificationIcon,
    getTimeAgo,
  } = data;

  const notification = notifications[index];

  if (!notification) {
    return (
      <div style={style} className="p-3">
        <Card className="p-3 border shadow-sm">
          <div className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <div className="flex items-center gap-2 mt-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={style} className="">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        <Card
          className={cn(
            'group border overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-md cursor-pointer',
            !notification.read ? 'bg-primary/5 border-primary/20' : 'bg-background'
          )}
          onClick={() => onNotificationClick(notification)}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1 mb-0.5">
                  <h3 className="text-sm font-medium leading-tight truncate">
                    {notification.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    {!notification.read && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
                        New
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={e => onMarkAsRead(e, notification._id)}
                          title="Mark as read"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={e => onDeleteNotification(e, notification._id)}
                        title="Delete notification"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    {getTimeAgo(notification.createdAt)}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] px-1.5 py-0 h-4 font-normal',
                      notification.type === 'mention' &&
                        'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30',
                      notification.type === 'task' &&
                        'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30',
                      notification.type === 'team' &&
                        'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30',
                      notification.type === 'system' &&
                        'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30',
                      notification.type === 'onboarding' &&
                        'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/30'
                    )}
                  >
                    {notification.type}
                  </Badge>
                  {notification.link && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-primary/10"
                      onClick={e => onNotificationLinkClick(e, notification)}
                      title="Go to related page"
                    >
                      <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Notifications List Component with Virtual Scrolling
interface NotificationsListProps {
  notifications: Notification[];
  isLoading: boolean;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  loadMoreItems: () => Promise<any>;
  isItemLoaded: (index: number) => boolean;
  onNotificationClick: (notification: Notification) => void;
  onNotificationLinkClick: (e: React.MouseEvent, notification: Notification) => void;
  onMarkAsRead: (e: React.MouseEvent, notificationId: string) => void;
  onDeleteNotification: (e: React.MouseEvent, notificationId: string) => void;
  getNotificationIcon: (type: string) => React.ReactNode;
  getTimeAgo: (dateString: string) => string;
  refetch: () => void;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  loadMoreItems,
  isItemLoaded,
  onNotificationClick,
  onNotificationLinkClick,
  onMarkAsRead,
  onDeleteNotification,
  getNotificationIcon,
  getTimeAgo,
  refetch,
}) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = useState(600);
  const [containerWidth, setContainerWidth] = useState(800);

  // Update container dimensions when ref changes
  useEffect(() => {
    if (containerRef) {
      const updateDimensions = () => {
        const rect = containerRef.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 100; // 100px buffer
        setContainerHeight(Math.max(400, Math.min(800, availableHeight)));
        setContainerWidth(rect.width || 800);
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, [containerRef]);

  // Calculate total item count (notifications + potential loading items)
  const itemCount = hasNextPage ? notifications.length + 1 : notifications.length;

  // Item data for virtual list
  const itemData = useMemo(
    () => ({
      notifications,
      onNotificationClick,
      onNotificationLinkClick,
      onMarkAsRead,
      onDeleteNotification,
      getNotificationIcon,
      getTimeAgo,
    }),
    [
      notifications,
      onNotificationClick,
      onNotificationLinkClick,
      onMarkAsRead,
      onDeleteNotification,
      getNotificationIcon,
      getTimeAgo,
    ]
  );

  if (isLoading && notifications.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-3">
        {[1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
          >
            <Card className="p-3 border shadow-sm">
              <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex items-center gap-2 mt-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-dashed border bg-background/50 p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mt-1">No notifications found</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              No notifications match your current filters. Try adjusting your search or filter
              settings.
            </p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => refetch()}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div ref={setContainerRef} className="w-full">
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={ref}
            height={containerHeight}
            width={containerWidth}
            itemCount={itemCount}
            itemSize={ITEM_HEIGHT}
            itemData={itemData}
            onItemsRendered={({ visibleStartIndex, visibleStopIndex }) =>
              onItemsRendered({
                overscanStartIndex: visibleStartIndex,
                overscanStopIndex: visibleStopIndex,
                startIndex: visibleStartIndex,
                stopIndex: visibleStopIndex,
                visibleStartIndex,
                visibleStopIndex,
              })
            }
            overscanCount={5}
            className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
          >
            {NotificationItem}
          </List>
        )}
      </InfiniteLoader>

      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Loading more notifications...</span>
        </div>
      )}
    </div>
  );
};
