'use client';

import { useState, useEffect } from 'react';
import { useNotificationContext } from '@/components/Providers/NotificationProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Clock, Filter, Search, Trash2, CheckCheck, AlertCircle, Inbox, Archive, MailOpen, Users, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function NotificationsPage() {
  const { markAllAsRead, clearAllNotifications } = useNotificationContext();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const itemsPerPage = 10;

  // Debounce search input to prevent too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const {
    data,
    isLoading,
    refetch
  } = useQuery({
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
    const iconClasses = "h-6 w-6";
    switch (type) {
      case 'mention':
        return <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 shadow-sm shadow-blue-200 dark:shadow-blue-900/10">
          <Bell className={`${iconClasses} text-blue-600 dark:text-blue-400`} />
        </div>;
      case 'task':
        return <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20 shadow-sm shadow-purple-200 dark:shadow-purple-900/10">
          <Clock className={`${iconClasses} text-purple-600 dark:text-purple-400`} />
        </div>;
      case 'team':
        return <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20 shadow-sm shadow-green-200 dark:shadow-green-900/10">
          <Users className={`${iconClasses} text-green-600 dark:text-green-400`} />
        </div>;
      case 'system':
        return <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/20 shadow-sm shadow-amber-200 dark:shadow-amber-900/10">
          <Settings className={`${iconClasses} text-amber-600 dark:text-amber-400`} />
        </div>;
      case 'onboarding':
        return <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/20 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/10">
          <Bell className={`${iconClasses} text-indigo-600 dark:text-indigo-400`} />
        </div>;
      default:
        return <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 shadow-sm shadow-gray-200 dark:shadow-gray-900/10">
          <Bell className={`${iconClasses} text-gray-600 dark:text-gray-400`} />
        </div>;
    }
  };

  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-none shadow-xl bg-gradient-to-r from-card/80 to-card overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-60 pointer-events-none" />
          <CardHeader className="pb-4 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  Notifications
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  Stay updated with your latest activities
                </CardDescription>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => markAllAsRead()}
                  className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm border-primary/20"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </Button>
                <Button
                  variant="outline"
                  onClick={() => clearAllNotifications()}
                  className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 shadow-sm border-destructive/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear all
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10">
            <div className="flex flex-col md:flex-row gap-4 items-center bg-background/50 p-4 rounded-xl shadow-sm border border-border/30 backdrop-blur-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/60" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-10 bg-background/80 border-border/50 focus:border-primary/30 focus:ring-primary/20 transition-all duration-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary/60" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px] bg-background/80 border-border/50 focus:border-primary/30 focus:ring-primary/20 transition-all duration-300">
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
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs defaultValue="all" className="w-full mt-2">
          <TabsList className="inline-flex h-12 items-center justify-center rounded-xl p-1 shadow-md border border-border/30 backdrop-blur-sm bg-background/80">
            <TabsTrigger value="all" className="px-6 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-300 hover:bg-muted/50">
              <Inbox className="h-4 w-4 mr-2" />
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="px-6 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-300 hover:bg-muted/50">
              <MailOpen className="h-4 w-4 mr-2" />
              Unread
            </TabsTrigger>
            <TabsTrigger value="archived" className="px-6 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-300 hover:bg-muted/50">
              <Archive className="h-4 w-4 mr-2" />
              Archived
            </TabsTrigger>
          </TabsList>

        <TabsContent value="all" className="mt-8 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <Card className="overflow-hidden border border-border/40 shadow-md bg-card/80 backdrop-blur-sm">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full animate-pulse" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex items-center gap-4 mt-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border-dashed border-2 border-border/50 bg-background/50 p-12 shadow-md">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="bg-primary/10 p-4 rounded-full shadow-inner">
                        <AlertCircle className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-medium mt-2">No notifications yet</h3>
                      <p className="text-muted-foreground max-w-md">
                        When you receive notifications, they will appear here. Check back later or adjust your filter settings.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-2 border-primary/20 hover:bg-primary/10 transition-all duration-300"
                        onClick={() => refetch()}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </Card>
                </motion.div>
          ) : (
            <>
              <div className="space-y-4">
                      {notifications.map((notification: any, index: number) => (
                        <motion.div
                    key={notification._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card
                            className={cn(
                              "overflow-hidden border transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1",
                              !notification.read
                                ? "bg-primary/5 border-primary/20 shadow-md"
                                : "bg-card/90 border-border/40 backdrop-blur-sm"
                            )}
                          >
                            <CardContent className="p-0">
                              <div className="p-6">
                                <div className="flex items-start gap-4">
                                  <div>{getNotificationIcon(notification.type)}</div>
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <h3 className="text-base font-medium leading-tight">
                                        {notification.title}
                                      </h3>
                                      {!notification.read && (
                                        <Badge variant="default" className="text-xs px-2 py-0 h-5 animate-pulse">
                                          New
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {notification.description}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                      <span className="text-xs text-muted-foreground">
                                        {getTimeAgo(notification.createdAt)}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "text-xs font-medium",
                                          notification.type === 'mention' && "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
                                          notification.type === 'task' && "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30",
                                          notification.type === 'team' && "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
                                          notification.type === 'system' && "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
                                          notification.type === 'onboarding' && "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/30"
                                        )}
                                      >
                                        {notification.type}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                ))}
              </div>

              {totalPages > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <Pagination className="mt-10">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                aria-disabled={page === 1}
                                className={cn(
                                  "transition-all duration-300 shadow-sm",
                                  page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary hover:shadow-md"
                                )}
                              />
                            </PaginationItem>
                            {[...Array(totalPages)].map((_, i) => (
                              <PaginationItem key={i + 1}>
                                <PaginationLink
                                  onClick={() => setPage(i + 1)}
                                  isActive={page === i + 1}
                                  className={cn(
                                    "transition-all duration-300 shadow-sm",
                                    page === i + 1
                                      ? "bg-primary text-primary-foreground shadow-md"
                                      : "hover:bg-primary/10 hover:text-primary hover:shadow-md"
                                  )}
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                aria-disabled={page === totalPages}
                                className={cn(
                                  "transition-all duration-300 shadow-sm",
                                  page === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary hover:shadow-md"
                                )}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </motion.div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-dashed border-2 border-border/50 bg-background/50 p-12 shadow-md">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="bg-primary/10 p-4 rounded-full shadow-inner">
                    <MailOpen className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mt-2">Unread Notifications</h3>
                  <p className="text-muted-foreground max-w-md">
                    This tab will show your unread notifications. The content will be implemented in a future update.
                  </p>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="archived" className="mt-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-dashed border-2 border-border/50 bg-background/50 p-12 shadow-md">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="bg-primary/10 p-4 rounded-full shadow-inner">
                    <Archive className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mt-2">Archived Notifications</h3>
                  <p className="text-muted-foreground max-w-md">
                    This tab will show your archived notifications. The content will be implemented in a future update.
                  </p>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
      </Tabs>
      </motion.div>
    </div>
  );
}



