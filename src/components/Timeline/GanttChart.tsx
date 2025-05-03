'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { format, addDays, eachDayOfInterval, isSameDay, differenceInDays, isToday } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';

// Types
type DragType = 'start' | 'end' | 'bar';

interface TimelineItem {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  startDate: string | Date;
  endDate: string | Date;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  projectId: any;
  progress?: number;
  users?: any[];
  color?: string;
}

interface GanttChartProps {
  items: TimelineItem[];
  isLoading: boolean;
  onItemUpdate?: (id: string, data: Partial<TimelineItem>) => Promise<void>;
}

// Helper functions
const getStatusColor = (status: TimelineItem['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500 text-white';
    case 'in_progress':
      return 'bg-blue-500 text-white';
    case 'delayed':
      return 'bg-amber-500 text-white';
    default:
      return 'bg-slate-500 text-white';
  }
};

// Day column component
const DayColumn = ({ day, dayWidth }: { day: Date; dayWidth: number }) => {
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  const isTodayDate = isToday(day);
  const isFirstOfMonth = day.getDate() === 1;

  return (
    <div
      className={cn(
        'text-center text-xs font-medium p-2 border-r relative',
        isWeekend ? 'bg-muted/50' : '',
        isFirstOfMonth ? 'border-l-2 border-l-slate-300' : '',
        isTodayDate ? 'bg-blue-50' : ''
      )}
      style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px` }}
    >
      <div>{format(day, 'EEE')}</div>
      <div>{format(day, 'MMM d')}</div>

      {isFirstOfMonth && (
        <div className="absolute -top-6 left-0 right-0 text-center text-xs font-medium text-slate-500 py-1">
          {format(day, 'MMMM yyyy')}
        </div>
      )}
    </div>
  );
};

export const GanttChart: React.FC<GanttChartProps> = ({ items, isLoading, onItemUpdate }) => {
  const { toast } = useToast();
  const [days, setDays] = useState<Date[]>([]);
  const [draggedItem, setDraggedItem] = useState<{
    id: string;
    type: DragType;
    initialX: number;
    initialDate: Date;
    width?: number;
    startDate?: Date;
    endDate?: Date;
  } | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive day width based on screen size
  const isSmallScreen = useMediaQuery('(max-width: 640px)');
  const isMediumScreen = useMediaQuery('(max-width: 1024px)');
  const dayWidth = useMemo(
    () => (isSmallScreen ? 40 : isMediumScreen ? 50 : 60),
    [isSmallScreen, isMediumScreen]
  );

  // Calculate the date range for the Gantt chart
  useEffect(() => {
    // Default date range if no items
    if (items.length === 0) {
      const currentDate = new Date();
      setDays(
        eachDayOfInterval({
          start: addDays(currentDate, -15),
          end: addDays(currentDate, 45),
        })
      );
      return;
    }

    // Find min and max dates from items
    const dates = items.flatMap(item => [new Date(item.startDate), new Date(item.endDate)]);
    const minDate = addDays(new Date(Math.min(...dates.map(d => d.getTime()))), -7);
    const maxDate = addDays(new Date(Math.max(...dates.map(d => d.getTime()))), 7);

    setDays(eachDayOfInterval({ start: minDate, end: maxDate }));
  }, [items]);

  // Touch event handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent, id: string, type: DragType) => {
    const touch = e.touches[0];
    handleDragStart(
      {
        clientX: touch.clientX,
        preventDefault: () => {},
        currentTarget: e.currentTarget,
      } as unknown as React.MouseEvent,
      id,
      type
    );
  };
  const handleDragStart = (e: React.MouseEvent, id: string, type: DragType) => {
    e.preventDefault();
    const item = items.find(item => item._id === id || item.id === id);
    if (!item) return;

    // Get the bar element to calculate its width
    const barElement = e.currentTarget.closest('.gantt-bar') as HTMLElement;
    const barWidth = barElement?.offsetWidth || 0;

    // Store initial dates for both start and end to handle bar dragging
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);

    setDraggedItem({
      id,
      type,
      initialX: e.clientX,
      initialDate: type === 'end' ? endDate : startDate,
      width: barWidth,
      startDate,
      endDate,
    });

    // Set visual indicator for drag position
    setDragPosition(e.clientX);

    // Add classes to body for cursor changes
    document.body.classList.add('dragging');
    if (type === 'start' || type === 'end') {
      document.body.classList.add('dragging-resize');
    } else {
      document.body.classList.add('dragging-move');
    }

    // Add touch event listeners for mobile support
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  // Touch move handler for mobile support
  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while dragging
    if (!draggedItem || e.touches.length === 0) return;

    const touch = e.touches[0];
    const mouseEvent = {
      clientX: touch.clientX,
    } as MouseEvent;

    handleDragMove(mouseEvent);
  };

  // Touch end handler for mobile support
  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!draggedItem) return;
    setDragPosition(e.clientX);

    // Calculate day difference and find item
    const dayDiff = Math.round((e.clientX - draggedItem.initialX) / dayWidth);
    const item = items.find(item => item._id === draggedItem.id || item.id === draggedItem.id);
    if (!item) return;

    const newDate = addDays(draggedItem.initialDate, dayDiff);
    const barElement = containerRef.current?.querySelector(
      `[data-item-id="${draggedItem.id}"]`
    ) as HTMLElement;

    if (!barElement) return;

    // Update visual position based on drag type
    const { type } = draggedItem;
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);
    const startIndex = days.findIndex(day =>
      isSameDay(day, type === 'start' ? newDate : startDate)
    );
    const endIndex = days.findIndex(day => isSameDay(day, type === 'end' ? newDate : endDate));

    if (type === 'start' && startIndex >= 0 && endIndex >= 0 && startIndex < endIndex) {
      // Update start position and width
      barElement.style.left = `${startIndex * dayWidth}px`;
      barElement.style.width = `${(endIndex - startIndex + 1) * dayWidth - 4}px`;
    } else if (type === 'end' && startIndex >= 0 && endIndex >= 0 && endIndex >= startIndex) {
      // Update width only
      barElement.style.width = `${(endIndex - startIndex + 1) * dayWidth - 4}px`;
    } else if (type === 'bar') {
      // Move the entire bar
      const newStartIndex = days.findIndex(day => isSameDay(day, newDate));
      if (newStartIndex >= 0) {
        barElement.style.left = `${newStartIndex * dayWidth}px`;
      }
    }
  };

  const handleDragEnd = async () => {
    if (!draggedItem) return;

    // Clean up event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.body.classList.remove('dragging', 'dragging-resize', 'dragging-move');

    // Get final position
    const item = items.find(item => item._id === draggedItem.id || item.id === draggedItem.id);
    if (!item) return;

    try {
      const dayDiff = Math.round(((dragPosition || 0) - draggedItem.initialX) / dayWidth);

      // Only update if there was an actual change
      if (dayDiff !== 0 && onItemUpdate) {
        const { type, initialDate, startDate, endDate } = draggedItem;

        if (type === 'start') {
          const newStartDate = addDays(initialDate, dayDiff);
          if (newStartDate < new Date(item.endDate)) {
            await onItemUpdate(draggedItem.id, { startDate: newStartDate });
          }
        } else if (type === 'end') {
          const newEndDate = addDays(initialDate, dayDiff);
          if (newEndDate > new Date(item.startDate)) {
            await onItemUpdate(draggedItem.id, { endDate: newEndDate });
          }
        } else if (type === 'bar' && startDate && endDate) {
          await onItemUpdate(draggedItem.id, {
            startDate: addDays(startDate, dayDiff),
            endDate: addDays(endDate, dayDiff),
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update timeline item',
        variant: 'destructive',
      });
    }

    setDragPosition(null);
    setDraggedItem(null);
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <Card className="border shadow-lg">
        <CardContent className="p-0 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-250px)] md:h-[calc(100vh-200px)]">
            <div className="min-w-max">
              {/* Header Skeleton */}
              <div className="flex border-b sticky top-0 bg-background z-10">
                <div className="w-64 min-w-64 p-4 font-medium border-r">
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="flex">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="p-2 text-center border-r"
                      style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px` }}
                    >
                      <Skeleton className="h-3 w-10 mx-auto mb-1" />
                      <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Items Skeleton */}
              <div>
                {Array.from({ length: 4 }).map((_, itemIndex) => (
                  <div key={itemIndex} className="flex border-b">
                    <div className="w-64 min-w-64 p-4 border-r">
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex relative">
                      {Array.from({ length: 10 }).map((_, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="h-16 border-r"
                          style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px` }}
                        />
                      ))}

                      {/* Skeleton bar */}
                      <Skeleton
                        className="absolute top-2 h-12 rounded-md"
                        style={{
                          left: `${(itemIndex % 3) * dayWidth + dayWidth}px`,
                          width: `${(3 + (itemIndex % 4)) * dayWidth - 4}px`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  // Render the chart
  return (
    <Card className="border shadow-lg">
      <CardContent className="p-0 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-250px)] md:h-[calc(100vh-200px)]">
          <div className="min-w-max" ref={containerRef}>
            {/* Header */}
            <div className="flex border-b sticky top-0 bg-background z-10">
              <div className="w-64 min-w-64 p-4 font-medium border-r sticky left-0 bg-background">
                Task
              </div>
              <div className="flex">
                {days.map((day, index) => (
                  <DayColumn key={index} day={day} dayWidth={dayWidth} />
                ))}
              </div>
            </div>

            {/* Timeline Items */}
            <div>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <div className="text-4xl mb-3">📅</div>
                  <div className="text-lg font-medium">No timeline items found</div>
                  <div className="text-sm mt-1">Create a new item to get started</div>
                </div>
              ) : (
                items.map((item, itemIndex) => {
                  const startDate = new Date(item.startDate);
                  const endDate = new Date(item.endDate);
                  const duration = differenceInDays(endDate, startDate) + 1;
                  const startIndex = days.findIndex(day => isSameDay(day, startDate));
                  const isHovered = hoveredItem === (item._id || item.id);

                  return (
                    <div
                      key={item._id || item.id}
                      className="flex border-b hover:bg-slate-50 transition-colors duration-150"
                      onMouseEnter={() => setHoveredItem(item._id || item.id || '')}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="w-64 min-w-64 p-4 border-r flex items-center sticky left-0 bg-background z-[1]">
                        <div className="w-full">
                          <div className="font-medium truncate">{item.title}</div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center">
                            <span
                              className="inline-block w-2 h-2 rounded-full mr-1.5"
                              style={{ backgroundColor: item.color || '#94a3b8' }}
                            ></span>
                            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
                          </div>
                        </div>
                      </div>
                      <div className="flex relative flex-1">
                        {days.map((day, index) => {
                          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                          const isTodayDate = isToday(day);
                          const isFirstOfMonth = day.getDate() === 1;

                          return (
                            <div
                              key={index}
                              className={cn(
                                'h-16 border-r',
                                isWeekend ? 'bg-muted/50' : '',
                                isFirstOfMonth ? 'border-l-2 border-l-slate-300' : '',
                                isTodayDate ? 'bg-blue-50' : ''
                              )}
                              style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px` }}
                            />
                          );
                        })}

                        {/* Today indicator */}
                        {days.findIndex(day => isToday(day)) >= 0 && (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-[2] opacity-70"
                            style={{
                              left: `${days.findIndex(day => isToday(day)) * dayWidth + dayWidth / 2}px`,
                              animation: 'pulse 2s infinite',
                            }}
                          />
                        )}

                        {/* Drag position indicator */}
                        {dragPosition && (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-primary z-[5] pointer-events-none"
                            style={{
                              left: `${dragPosition - (containerRef.current?.getBoundingClientRect().left || 0) + (containerRef.current?.scrollLeft || 0)}px`,
                            }}
                          />
                        )}

                        {/* The actual timeline bar */}
                        {startIndex >= 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  data-item-id={item._id || item.id}
                                  className={cn(
                                    'absolute top-2 h-12 rounded-md cursor-move transition-all duration-150 gantt-bar',
                                    getStatusColor(item.status),
                                    isHovered
                                      ? 'ring-2 ring-offset-1 ring-ring shadow-lg'
                                      : 'shadow-md',
                                    'animate-in fade-in-50 duration-300'
                                  )}
                                  style={{
                                    left: `${startIndex * dayWidth}px`,
                                    width: `${duration * dayWidth - 4}px`,
                                    backgroundColor: item.color || undefined,
                                    animationDelay: `${itemIndex * 50}ms`,
                                  }}
                                  onMouseDown={e =>
                                    handleDragStart(e, item._id || item.id || '', 'bar')
                                  }
                                  onTouchStart={e =>
                                    handleTouchStart(e, item._id || item.id || '', 'bar')
                                  }
                                >
                                  <div className="px-2 py-1 text-xs font-medium truncate">
                                    {item.title}
                                  </div>

                                  {item.progress !== undefined && (
                                    <div className="h-1.5 bg-black/20 mt-1 mx-1 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-white transition-all duration-300"
                                        style={{ width: `${item.progress}%` }}
                                      />
                                    </div>
                                  )}

                                  {/* Drag handles */}
                                  <div
                                    className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 transition-colors"
                                    onMouseDown={e => {
                                      e.stopPropagation();
                                      handleDragStart(e, item._id || item.id || '', 'start');
                                    }}
                                    onTouchStart={e => {
                                      e.stopPropagation();
                                      handleTouchStart(e, item._id || item.id || '', 'start');
                                    }}
                                  />
                                  <div
                                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 transition-colors"
                                    onMouseDown={e => {
                                      e.stopPropagation();
                                      handleDragStart(e, item._id || item.id || '', 'end');
                                    }}
                                    onTouchStart={e => {
                                      e.stopPropagation();
                                      handleTouchStart(e, item._id || item.id || '', 'end');
                                    }}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="p-3 max-w-xs">
                                <div className="space-y-2">
                                  <div className="font-bold text-sm">{item.title}</div>
                                  {item.description && (
                                    <div className="text-xs text-muted-foreground">
                                      {item.description}
                                    </div>
                                  )}
                                  <div className="text-xs flex items-center gap-1.5">
                                    <span className="font-medium">Duration:</span>
                                    {format(startDate, 'MMM d, yyyy')} -{' '}
                                    {format(endDate, 'MMM d, yyyy')}
                                    <span className="text-slate-500 ml-1">({duration} days)</span>
                                  </div>
                                  <div className="text-xs flex items-center gap-1.5">
                                    <span className="font-medium">Status:</span>
                                    <span
                                      className={cn(
                                        'px-1.5 py-0.5 rounded-full text-xs',
                                        item.status === 'completed'
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : item.status === 'in_progress'
                                            ? 'bg-blue-100 text-blue-700'
                                            : item.status === 'delayed'
                                              ? 'bg-amber-100 text-amber-700'
                                              : 'bg-slate-100 text-slate-700'
                                      )}
                                    >
                                      {item.status.replace('_', ' ')}
                                    </span>
                                  </div>
                                  {item.progress !== undefined && (
                                    <div className="text-xs">
                                      <span className="font-medium">Progress:</span> {item.progress}
                                      %
                                      <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                        <div
                                          className={cn(
                                            'h-full rounded-full',
                                            item.status === 'completed'
                                              ? 'bg-emerald-500'
                                              : item.status === 'in_progress'
                                                ? 'bg-blue-500'
                                                : item.status === 'delayed'
                                                  ? 'bg-amber-500'
                                                  : 'bg-slate-500'
                                          )}
                                          style={{ width: `${item.progress}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
