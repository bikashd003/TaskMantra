import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bell, Clock, MailIcon, UserPlus, AlertCircle, Loader2, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useInView } from "react-intersection-observer"
import { useNotifications, NotificationType } from "@/hooks/useNotifications"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

export function NotificationsPopover() {
  const [open, setOpen] = React.useState(false)
  const { ref, inView } = useInView()
  const {
    notifications,
    unreadCount,
    isConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    requestNotificationPermission
  } = useNotifications()

  // Request notification permission when component mounts
  React.useEffect(() => {
    requestNotificationPermission()
  }, [requestNotificationPermission])

  // Fetch more notifications when scrolling to the bottom
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await fetchNotifications(pageParam)
      return result
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    initialPageParam: 0
  })

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage])

  // Combine SSE notifications with paginated ones, removing duplicates
  const allNotifications = React.useMemo(() => {
    const paginatedNotifications = data?.pages?.flatMap(page => page.notifications) || []

    // Create a Set of IDs from paginated notifications
    const existingIds = new Set(paginatedNotifications.map(n => n._id))

    // Filter out SSE notifications that are already in the paginated results
    const uniqueSSENotifications = notifications.filter(n => !existingIds.has(n._id))

    // Combine and sort by creation date (newest first)
    return [...uniqueSSENotifications, ...paginatedNotifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [data, notifications])

  const getNotificationIcon = (type: NotificationType['type']) => {
    switch (type) {
      case 'mention':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'task':
        return <Clock className="h-4 w-4 text-purple-500" />
      case 'team':
        return <UserPlus className="h-4 w-4 text-green-500" />
      case 'onboarding':
        return <UserPlus className="h-4 w-4 text-green-500" />
      case 'system':
      default:
        return <MailIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  const handleClearNotifications = () => {
    clearAllNotifications()
  }

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId)
    setOpen(false)
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (error: any) {
      toast.error("Failed to format timestamp", { description: error.message })
      return timestamp
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-muted/50 transition-colors duration-200"
        >
          <Bell className="h-5 w-5" />
          <div className="relative">
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center animate-in zoom-in">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] p-0 shadow-lg"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs hover:bg-muted/50"
              onClick={handleMarkAllAsRead}
            >
              Mark all read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs hover:bg-muted/50"
              onClick={handleClearNotifications}
            >
              Clear all
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[400px] overflow-y-auto">
          {!isConnected && (
            <div className="p-2 bg-yellow-50 border-b border-yellow-100 flex items-center justify-center gap-2">
              <WifiOff className="h-4 w-4 text-yellow-500" />
              <p className="text-xs text-yellow-700">Reconnecting to notification server...</p>
            </div>
          )}
          {status === 'pending' ? (
            <div className="flex h-[200px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : status === 'error' ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              Failed to load notifications
            </div>
          ) : allNotifications.length > 0 ? (
            <div className="divide-y divide-border">
              {allNotifications.map((notification) => (
                <Link
                  key={notification._id}
                  href={notification.link}
                  onClick={() => handleNotificationClick(notification._id)}
                  className={cn(
                    "flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors duration-200",
                    !notification.read && "bg-muted/30"
                  )}
                >
                  <div className="mt-1 shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate mb-1">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="shrink-0 h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </Link>
              ))}
              <div
                ref={ref}
                className="py-2 flex items-center justify-center"
              >
                {isFetchingNextPage && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          )}
        </ScrollArea>
        <div className="p-4 border-t">
          <Link href="/dashboard/notifications" onClick={() => setOpen(false)}>
            <Button size="sm" className="w-full font-medium">
              View all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}







