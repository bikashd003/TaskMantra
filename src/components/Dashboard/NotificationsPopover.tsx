import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bell, Clock, MailIcon, UserPlus, AlertCircle, Loader2, WifiOff, CheckCheck, Trash2, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useInView } from "react-intersection-observer"
import { useNotifications, NotificationType } from "@/hooks/useNotifications"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

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
    const iconStyles = "h-4 w-4"
    const containerStyles = "p-2 rounded-xl shadow-lg backdrop-blur-sm"

    switch (type) {
      case 'mention':
        return (
          <div className={`${containerStyles} bg-blue-500/10 dark:bg-blue-400/10`}>
            <Bell className={`${iconStyles} text-blue-600 dark:text-blue-400`} />
          </div>
        )
      case 'task':
        return (
          <div className={`${containerStyles} bg-purple-500/10 dark:bg-purple-400/10`}>
            <Clock className={`${iconStyles} text-purple-600 dark:text-purple-400`} />
          </div>
        )
      case 'team':
        return (
          <div className={`${containerStyles} bg-green-500/10 dark:bg-green-400/10`}>
            <Users className={`${iconStyles} text-green-600 dark:text-green-400`} />
          </div>
        )
      case 'onboarding':
        return (
          <div className={`${containerStyles} bg-indigo-500/10 dark:bg-indigo-400/10`}>
            <UserPlus className={`${iconStyles} text-indigo-600 dark:text-indigo-400`} />
          </div>
        )
      case 'system':
        return (
          <div className={`${containerStyles} bg-amber-500/10 dark:bg-amber-400/10`}>
            <Settings className={`${iconStyles} text-amber-600 dark:text-amber-400`} />
          </div>
        )
      default:
        return (
          <div className={`${containerStyles} bg-gray-500/10 dark:bg-gray-400/10`}>
            <MailIcon className={`${iconStyles} text-gray-600 dark:text-gray-400`} />
          </div>
        )
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
          className="relative hover:bg-muted/50 transition-all duration-300 group"
        >
          <Bell className="h-5 w-5 group-hover:text-primary transition-colors duration-300" />
            {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-medium text-white flex items-center justify-center shadow-lg"
            >
                {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] p-0 shadow-md border border-border/40 backdrop-blur-md bg-card/95 rounded-2xl overflow-hidden"
        align="end"
        sideOffset={8}
        asChild
      >
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-background/80 via-background to-background/80">
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs px-2.5 py-0.5 h-5 font-medium rounded-full bg-gradient-to-r from-red-500 to-pink-500">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs hover:bg-primary/10 hover:text-primary transition-all duration-300 h-8 rounded-full"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs hover:bg-destructive/10 hover:text-destructive transition-all duration-300 h-8 rounded-full"
                onClick={handleClearNotifications}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Clear all
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[500px] overflow-y-auto">
            {!isConnected && (
              <div className="p-3 bg-amber-50/30 dark:bg-amber-950/20 border-b border-amber-100/50 dark:border-amber-800/30 flex items-center justify-center gap-2 backdrop-blur-sm">
                <WifiOff className="h-4 w-4 text-amber-500 dark:text-amber-400 animate-pulse" />
                <p className="text-xs text-amber-700 dark:text-amber-400">Reconnecting to notification server...</p>
              </div>
            )}
            {status === 'pending' ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                  <p className="text-sm text-muted-foreground animate-pulse">Loading notifications...</p>
                </div>
              </div>
            ) : status === 'error' ? (
                <div className="flex h-[300px] items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-destructive/10">
                      <AlertCircle className="h-8 w-8 text-destructive/70" />
                    </div>
                    <p className="text-sm font-medium">Failed to load notifications</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300"
                      onClick={() => window.location.reload()}
                    >
                      Try again
                    </Button>
                  </div>
                </div>
              ) : allNotifications.length > 0 ? (
                  <div className="divide-y divide-border/60">
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
                              "flex items-start gap-4 p-6 hover:bg-muted/50 transition-all duration-300",
                              !notification.read && "bg-primary/5"
                            )}
                          >
                            <div className="shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <p className="text-sm font-semibold leading-none truncate">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatTimestamp(notification.createdAt)}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {notification.description}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="shrink-0 h-2 w-2 rounded-full bg-gradient-to-r from-primary to-primary-foreground animate-pulse shadow-lg" />
                            )}
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div
                      ref={ref}
                      className="py-4 flex items-center justify-center"
                    >
                      {isFetchingNextPage && (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ) : (
              <div className="flex h-[300px] items-center justify-center px-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-muted/50 backdrop-blur-sm">
                    <Bell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-medium">No notifications yet</h3>
                  <p className="text-sm text-muted-foreground max-w-[260px]">
                    When you get notifications, they&apos;ll show up here
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="p-4 border-t bg-gradient-to-r from-background/80 via-background to-background/80">
            <Link href="/dashboard/notifications" onClick={() => setOpen(false)}>
              <Button
                size="sm"
                className="w-full font-medium rounded-full bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/90 text-primary-foreground transition-all duration-300"
              >
                View all notifications
              </Button>
            </Link>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  )
}


