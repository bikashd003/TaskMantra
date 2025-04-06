'use client';

import { useState } from 'react';
import { useNotificationContext } from '@/components/Providers/NotificationProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Clock, Filter, Search, Trash2, CheckCheck, AlertCircle, Inbox, Archive, MailOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
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

export default function NotificationsPage() {
  const { markAllAsRead, clearAllNotifications } = useNotificationContext();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ['notifications', filter, search, page],
    queryFn: async () => {
      const response = await fetch(
        `/api/notifications?page=${page}&limit=${itemsPerPage}&filter=${filter}&search=${search}`
      );
      return response.json();
    },
  });

  const notifications = data?.notifications || [];
  const totalPages = Math.ceil((data?.total || 0) / itemsPerPage);

  const getNotificationIcon = (type: string) => {
    const iconClasses = "h-6 w-6";
    switch (type) {
      case 'mention':
        return <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
          <Bell className={`${iconClasses} text-blue-600 dark:text-blue-400`} />
        </div>;
      case 'task':
        return <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
          <Clock className={`${iconClasses} text-purple-600 dark:text-purple-400`} />
        </div>;
      default:
        return <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
          <Bell className={`${iconClasses} text-gray-600 dark:text-gray-400`} />
        </div>;
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-10 space-y-8 px-4 sm:px-6">
      <Card className="border-none shadow-lg bg-gradient-to-r from-card/80 to-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
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
                className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
              <Button
                variant="outline"
                onClick={() => clearAllNotifications()}
                className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
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
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-card p-1 shadow-md border border-border/30">
          <TabsTrigger value="all" className="px-6 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-300">
            <Inbox className="h-4 w-4 mr-2" />
            All
          </TabsTrigger>
          <TabsTrigger value="unread" className="px-6 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-300">
            <MailOpen className="h-4 w-4 mr-2" />
            Unread
          </TabsTrigger>
          <TabsTrigger value="archived" className="px-6 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all duration-300">
            <Archive className="h-4 w-4 mr-2" />
            Archived
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-8 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden border border-border/40 shadow-md">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
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
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <Card className="border-dashed border-2 border-border/50 bg-background/50 p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <AlertCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium">No notifications yet</h3>
                <p className="text-muted-foreground max-w-md">
                  When you receive notifications, they will appear here. Check back later or adjust your filter settings.
                </p>
              </div>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {notifications.map((notification: any) => (
                  <Card
                    key={notification._id}
                    className={cn(
                      "overflow-hidden border transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1",
                      !notification.read
                        ? "bg-primary/5 border-primary/20 shadow-md"
                        : "bg-card border-border/40"
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
                                <Badge variant="default" className="text-xs px-2 py-0 h-5">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(notification.createdAt), 'MMM d, yyyy • h:mm a')}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs font-medium",
                                  notification.type === 'mention' && "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
                                  notification.type === 'task' && "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30",
                                  notification.type === 'team' && "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
                                  notification.type === 'system' && "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700/30"
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
                ))}
              </div>

              {totalPages > 0 && (
                <Pagination className="mt-10">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        aria-disabled={page === 1}
                        className={cn(
                          "transition-all duration-300",
                          page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary"
                        )}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => setPage(i + 1)}
                          isActive={page === i + 1}
                          className={cn(
                            "transition-all duration-300",
                            page === i + 1 ? "bg-primary text-primary-foreground" : "hover:bg-primary/10 hover:text-primary"
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
                          "transition-all duration-300",
                          page === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-8">
          <Card className="border-dashed border-2 border-border/50 bg-background/50 p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MailOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Unread Notifications</h3>
              <p className="text-muted-foreground max-w-md">
                This tab will show your unread notifications. The content will be implemented in a future update.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="archived" className="mt-8">
          <Card className="border-dashed border-2 border-border/50 bg-background/50 p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Archive className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Archived Notifications</h3>
              <p className="text-muted-foreground max-w-md">
                This tab will show your archived notifications. The content will be implemented in a future update.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



