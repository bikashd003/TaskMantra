/* eslint-disable no-unused-vars */
/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Clock, Circle, ChevronDown, Filter, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectTimelineStore, FrontendTimelineItem } from '@/stores/projectTimelineStore';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TimelineProps {
  projectId?: string;
  onCreateItem?: () => void;
}

const Timeline: React.FC<TimelineProps> = ({ projectId, onCreateItem }) => {
  const { items, isLoading, filter, fetchTimelineItems, updateItemStatus, setFilter } =
    useProjectTimelineStore();

  useEffect(() => {
    const filters: any = {};
    if (projectId) {
      filters.projectId = projectId;
    }
    if (filter !== 'all') {
      filters.status = filter;
    }
    fetchTimelineItems(filters);
  }, [fetchTimelineItems, projectId, filter]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const handleStatusChange = async (itemId: string, newStatus: FrontendTimelineItem['status']) => {
    await updateItemStatus(itemId, newStatus);
  };

  const getStatusConfig = (status: FrontendTimelineItem['status']) => {
    const configs = {
      in_progress: {
        badge: 'bg-primary/10 text-primary border-primary/20',
        ring: 'border-primary ring-primary/30',
        icon: <Clock className="w-4 h-4" />,
        label: 'In Progress',
      },
      done: {
        badge: 'bg-success/10 text-success border-success/20',
        ring: 'border-success ring-success/30',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Completed',
      },
      pending: {
        badge: 'bg-muted/50 text-muted-foreground border-muted',
        ring: 'border-muted-foreground ring-muted-foreground/30',
        icon: <Circle className="w-4 h-4" />,
        label: 'Pending',
      },
    };
    return configs[status];
  };

  const TimelineItemComponent = ({ item }: { item: FrontendTimelineItem }) => {
    const statusConfig = getStatusConfig(item.status);
    const dateRange =
      format(new Date(item.startDate), 'MMM d, yyyy') +
      ' - ' +
      format(new Date(item.endDate), 'MMM d, yyyy');

    return (
      <div className="relative group animate-fadeIn">
        <div
          className={cn(
            'absolute left-[-27px] top-8 w-4 h-4 rounded-full',
            'border-[3px] bg-background z-10 transition-all duration-300',
            'group-hover:scale-125 group-hover:ring-2 group-hover:ring-offset-2',
            'ring-offset-background shadow-md',
            statusConfig.ring
          )}
        />

        {/* Timeline Card */}
        <div
          className={cn(
            'p-4 sm:p-6 rounded-2xl transition-all duration-300',
            'bg-card/50 backdrop-blur-sm hover:bg-card',
            'border border-border/50 hover:border-border',
            'transform hover:-translate-y-1 hover:shadow-xl'
          )}
        >
          <div className="flex flex-col gap-4">
            {/* Header Section */}
            <div className="flex flex-col gap-3">
              <div className="space-y-2">
                {/* Title and Status */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-tight break-words pr-2 max-w-full overflow-hidden text-ellipsis">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-default">{item.title}</span>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start" className="max-w-xs">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'px-3 py-1 rounded-full text-sm font-medium',
                        'flex items-center gap-1.5 whitespace-nowrap',
                        'border shadow-sm shrink-0',
                        statusConfig.badge
                      )}
                    >
                      {statusConfig.icon}
                      <span className="hidden sm:inline">{statusConfig.label}</span>
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span className="truncate">{dateRange}</span>
                </div>
              </div>

              {/* Status Update Button */}
              <div className="flex justify-start sm:justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'w-full sm:w-auto',
                        'transition-all duration-300',
                        'hover:bg-accent hover:text-accent-foreground',
                        'active:scale-95'
                      )}
                    >
                      Update Status
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(item.id, 'pending')}
                      className="flex items-center gap-2"
                    >
                      <Circle className="w-4 h-4" />
                      Set as Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(item.id, 'in_progress')}
                      className="flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Set as In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(item.id, 'done')}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Set as Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Description Section */}
            {item.description && (
              <div className="prose prose-sm max-w-none">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-muted-foreground leading-relaxed text-sm break-words line-clamp-3 cursor-default">
                        {item.description}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start" className="max-w-md">
                      <p className="text-sm">{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            {/* Users Section */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {item.users.slice(0, 3).map(user => (
                  <div key={user.id} className="relative group/avatar">
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
                      }
                      alt={user.name}
                      className={cn(
                        'w-8 h-8 sm:w-10 sm:h-10 rounded-full',
                        'border-2 border-background',
                        'ring-2 ring-border/50',
                        'transition-transform hover:scale-110 hover:z-10'
                      )}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover/avatar:opacity-100 transition-opacity z-50">
                      {user.name}
                    </div>
                  </div>
                ))}
                {item.users.length > 3 && (
                  <div className="relative group/avatar">
                    <div
                      className={cn(
                        'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center',
                        'bg-muted text-muted-foreground text-xs sm:text-sm font-medium',
                        'border-2 border-background',
                        'ring-2 ring-border/50',
                        'transition-transform hover:scale-110 hover:z-10'
                      )}
                    >
                      +{item.users.length - 3}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover/avatar:opacity-100 transition-opacity z-50">
                      {item.users
                        .slice(3)
                        .map(u => u.name)
                        .join(', ')}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {item.users.length} {item.users.length === 1 ? 'member' : 'members'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="relative pl-6">
          <div className="absolute -left-6 top-8 w-4 h-4 rounded-full bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="space-y-3">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-5 w-1/4" />
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card
      className={cn(
        'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/50',
        'border border-gray-100 dark:border-gray-800 shadow-lg h-full'
      )}
    >
      <div className="max-h-[86vh] overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Project Timeline</h2>
            <p className="text-sm text-muted-foreground">
              Track your project milestones and progress
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {onCreateItem && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={onCreateItem}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Timeline Item
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create a new timeline item</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleFilterChange('all')}>
                  All Items
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('pending')}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('in_progress')}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('done')}>
                  Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="h-[calc(100%-5rem)]">
          <ScrollArea className="h-full pr-4 -mr-4">
            <div className="relative pl-8 space-y-6 pb-6">
              {/* Vertical Timeline Line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border/50" />

              {isLoading && <LoadingSkeleton />}

              {!isLoading &&
                items.length > 0 &&
                items.map(item => <TimelineItemComponent key={item.id} item={item} />)}

              {!isLoading && items.length === 0 && (
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <PlusCircle className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">
                    No timeline items yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Create your first timeline item to start tracking your project milestones and
                    progress.
                  </p>
                  {onCreateItem && (
                    <Button variant="outline" size="sm" className="mt-4" onClick={onCreateItem}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Timeline Item
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </div>
    </Card>
  );
};

export default Timeline;
