'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function NotificationsPage() {
  const { markAllAsRead, clearAllNotifications } = useNotificationContext();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const itemsPerPage = 12; // Increased from 10 to show more notifications

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications', filter, debouncedSearch, page],
    queryFn: async () => {
      const response = await fetch(
        `/api/notifications?page=${page - 1}&limit=${itemsPerPage}&filter=${filter}&search=${debouncedSearch}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      return response.json();
    },
  });

  const notifications = data?.notifications || [];
  const totalPages = Math.ceil((data?.total || 0) / itemsPerPage);

  const getNotificationIcon = (type: string) => {
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
  };

  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm p-6 h-full w-full"
    >
      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Stay updated with your latest activities
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
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-10 w-full sm:w-[180px] bg-background/50">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All notifications</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="mention">Mentions</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
              </SelectContent>
            </Select>
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
        <Tabs defaultValue="all" className="w-full">
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
          <TabsContent value="all" className="mt-4">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-2">
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
            ) : notifications.length === 0 ? (
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
                    <h3 className="text-lg font-medium mt-1">No notifications yet</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      When you receive notifications, they will appear here. Check back later or
                      adjust your filter settings.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => refetch()}>
                      <Search className="h-3.5 w-3.5 mr-1.5" />
                      Refresh
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3">
                  {notifications.map((notification: any, index: number) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <Card
                        className={cn(
                          'group border overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-md',
                          !notification.read ? 'bg-primary/5 border-primary/20' : 'bg-background'
                        )}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1 mb-0.5">
                                <h3 className="text-sm font-medium leading-tight truncate">
                                  {notification.title}
                                </h3>
                                {!notification.read && (
                                  <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
                                    New
                                  </Badge>
                                )}
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
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {totalPages > 0 && (
                  <Pagination className="mt-6 flex justify-center">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          className="h-9 px-2 sm:px-3"
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNumber = i + 1;
                        const isCurrentPage = page === pageNumber;
                        const isWithinRange = Math.abs(pageNumber - page) <= 1;
                        const isEndPage = pageNumber === 1 || pageNumber === totalPages;

                        if (isCurrentPage || isWithinRange || isEndPage) {
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                onClick={() => setPage(pageNumber)}
                                isActive={isCurrentPage}
                                className="h-9 w-9 sm:h-10 sm:w-10"
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          (pageNumber === page - 2 && pageNumber > 2) ||
                          (pageNumber === page + 2 && pageNumber < totalPages - 1)
                        ) {
                          return (
                            <PaginationItem key={`ellipsis-${pageNumber}`}>
                              <span className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center">
                                ...
                              </span>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          className="h-9 px-2 sm:px-3"
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>
          <TabsContent value="unread" className="m-0">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-2">
                {[1, 2, 3].map(i => (
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
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-dashed border bg-background/50 p-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MailOpen className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mt-1">No unread notifications</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      You&apos;ve read all your notifications. When you receive new ones, they will
                      appear here.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => refetch()}>
                      <Search className="h-3.5 w-3.5 mr-1.5" />
                      Refresh
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
