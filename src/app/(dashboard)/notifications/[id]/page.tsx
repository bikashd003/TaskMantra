'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowLeft,
  Bell,
  Clock,
  Users,
  Settings,
  ExternalLink,
  Trash2,
  CheckCircle,
  AlertTriangle,
  WifiOff,
  Copy,
  Share2,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { NotificationService } from '@/services/Notification.service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axios from 'axios';

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

export default function NotificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const notificationId = params.id as string;
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const {
    data: notification,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notification', notificationId],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/notifications/${notificationId}`);
        setRetryCount(0);
        return response.data as { notification: Notification };
      } catch (error: any) {
        setRetryCount(prev => prev + 1);
        if (error.name === 'TypeError' && !isOnline) {
          throw new Error('No internet connection. Please check your network and try again.');
        }

        throw error;
      }
    },
    enabled: !!notificationId && isOnline,
    retry: (failureCount, error: any) => {
      if (error.message.includes('404') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async () => {
      return await NotificationService.deleteNotification(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast({ title: 'Notification deleted successfully' });
      router.push('/notifications');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to delete notification';
      toast({ title: errorMessage, variant: 'destructive' });
    },
  });

  const handleCopyLink = useCallback(async () => {
    try {
      const url = `${window.location.origin}/notifications/${notificationId}`;
      await navigator.clipboard.writeText(url);
      toast({ title: 'Notification link copied to clipboard' });
    } catch (error) {
      toast({ title: 'Failed to copy link', variant: 'destructive' });
    }
  }, [notificationId, toast]);

  const handleShare = useCallback(async () => {
    if (navigator.share && notification?.notification) {
      try {
        await navigator.share({
          title: notification.notification.title,
          text: notification.notification.description,
          url: `${window.location.origin}/notifications/${notificationId}`,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast({ title: 'Failed to share notification', variant: 'destructive' });
        }
      }
    } else {
      handleCopyLink();
    }
  }, [notification, notificationId, handleCopyLink, toast]);

  const getNotificationIcon = (type: string) => {
    const iconClasses = 'h-6 w-6';
    switch (type) {
      case 'mention':
        return (
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Bell className={`${iconClasses} text-blue-600 dark:text-blue-400`} />
          </div>
        );
      case 'task':
        return (
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
            <Clock className={`${iconClasses} text-purple-600 dark:text-purple-400`} />
          </div>
        );
      case 'team':
        return (
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
            <Users className={`${iconClasses} text-green-600 dark:text-green-400`} />
          </div>
        );
      case 'system':
        return (
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/20">
            <Settings className={`${iconClasses} text-amber-600 dark:text-amber-400`} />
          </div>
        );
      case 'onboarding':
        return (
          <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/20">
            <Bell className={`${iconClasses} text-indigo-600 dark:text-indigo-400`} />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
            <Bell className={`${iconClasses} text-gray-600 dark:text-gray-400`} />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto p-6 max-w-4xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Card className="theme-surface theme-shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error || !notification?.notification) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto p-6 max-w-4xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </motion.div>
    );
  }

  const notif = notification.notification;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto p-6 max-w-4xl"
    >
      {/* Enhanced Header with Network Status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notifications
          </Button>

          {/* Network Status Indicator */}
          {!isOnline && (
            <div className="flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm">
              <WifiOff className="h-3 w-3" />
              Offline
            </div>
          )}

          {retryCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-sm">
              <AlertTriangle className="h-3 w-3" />
              Retried {retryCount} time{retryCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              {typeof window !== 'undefined' && 'share' in navigator && (
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => deleteNotificationMutation.mutate()}
                disabled={deleteNotificationMutation.isPending}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteNotificationMutation.isPending ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Notification Details */}
      <Card
        className={cn(
          'overflow-hidden',
          !notif.read ? 'bg-primary/5 border-primary/20' : 'bg-background'
        )}
      >
        <CardHeader>
          <div className="flex items-start gap-4">
            {getNotificationIcon(notif.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <CardTitle className="text-xl">{notif.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {!notif.read && (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Unread
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      notif.type === 'mention' &&
                        'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
                      notif.type === 'task' &&
                        'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400',
                      notif.type === 'team' &&
                        'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400',
                      notif.type === 'system' &&
                        'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400',
                      notif.type === 'onboarding' &&
                        'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400'
                    )}
                  >
                    {notif.type}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description Section */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Description
            </h4>
            <p className="text-muted-foreground leading-relaxed text-base">{notif.description}</p>
          </div>

          {/* Timestamps Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-1">Created</h5>
              <p className="text-sm">{format(new Date(notif.createdAt), 'PPP p')}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
              </p>
            </div>
            {notif.updatedAt !== notif.createdAt && (
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h5>
                <p className="text-sm">{format(new Date(notif.updatedAt), 'PPP p')}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notif.updatedAt), { addSuffix: true })}
                </p>
              </div>
            )}
          </div>

          {/* Related Link Section */}
          {notif.link && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Related Link
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push(notif.link)}
                  className="flex-1 sm:flex-none"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Go to Related Page
                </Button>
                <div className="flex-1 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground break-all">{notif.link}</p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata Section */}
          {notif.metadata && Object.keys(notif.metadata).length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Additional Information
              </h4>
              <div className="bg-muted/30 rounded-lg p-4 border">
                <div className="space-y-2">
                  {Object.entries(notif.metadata).map(([key, value]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground min-w-0 sm:w-32">
                        {key}:
                      </span>
                      <span className="text-sm bg-background px-2 py-1 rounded border flex-1 break-all">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
