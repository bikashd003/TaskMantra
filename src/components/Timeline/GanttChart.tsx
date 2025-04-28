'use client';
import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, eachDayOfInterval, isSameDay, differenceInDays } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

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

export const GanttChart: React.FC<GanttChartProps> = ({ items, isLoading, onItemUpdate }) => {
  const { toast } = useToast();
  const [days, setDays] = useState<Date[]>([]);
  const [draggedItem, setDraggedItem] = useState<{
    id: string;
    type: 'start' | 'end' | 'bar';
    initialX: number;
    initialDate: Date;
    width?: number;
    startDate?: Date;
    endDate?: Date;
  } | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate the date range for the Gantt chart
  useEffect(() => {
    if (items.length === 0) {
      // If no items, show current month
      const currentDate = new Date();
      const startOfRange = addDays(currentDate, -15);
      const endOfRange = addDays(currentDate, 45);
      const daysArray = eachDayOfInterval({ start: startOfRange, end: endOfRange });
      setDays(daysArray);
      return;
    }

    // Find the earliest start date and latest end date
    let minDate = new Date();
    let maxDate = new Date();

    items.forEach(item => {
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);

      if (startDate < minDate) minDate = startDate;
      if (endDate > maxDate) maxDate = endDate;
    });

    // Add padding to the date range
    minDate = addDays(minDate, -7);
    maxDate = addDays(maxDate, 7);

    // Generate array of days in the date range
    const daysArray = eachDayOfInterval({ start: minDate, end: maxDate });
    setDays(daysArray);
  }, [items]);

  // Add custom styles to document
  useEffect(() => {
    // No external CSS needed
  }, []);

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
  const handleDragStart = (e: React.MouseEvent, id: string, type: 'start' | 'end' | 'bar') => {
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

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!draggedItem) return;

    // Update drag position indicator
    setDragPosition(e.clientX);

    // Calculate the day difference based on drag distance
    const dayWidth = 60; // Width of each day column
    const dayDiff = Math.round((e.clientX - draggedItem.initialX) / dayWidth);

    // Get the item being dragged
    const item = items.find(item => item._id === draggedItem.id || item.id === draggedItem.id);
    if (!item) return;

    const newDate = addDays(draggedItem.initialDate, dayDiff);

    // This would be handled by the parent component to update the UI
    // We're using direct DOM manipulation for visual feedback during drag
    if (item && containerRef.current) {
      const barElement = containerRef.current.querySelector(
        `[data-item-id="${draggedItem.id}"]`
      ) as HTMLElement;
      if (barElement) {
        if (draggedItem.type === 'start') {
          // Update start position and width
          const startIndex = days.findIndex(day => isSameDay(day, newDate));
          if (startIndex >= 0) {
            const endDate = new Date(item.endDate);
            const endIndex = days.findIndex(day => isSameDay(day, endDate));
            if (endIndex >= 0 && startIndex < endIndex) {
              const newLeft = startIndex * 60;
              const newWidth = (endIndex - startIndex + 1) * 60 - 4;
              barElement.style.left = `${newLeft}px`;
              barElement.style.width = `${newWidth}px`;
            }
          }
        } else if (draggedItem.type === 'end') {
          // Update width only
          const endIndex = days.findIndex(day => isSameDay(day, newDate));
          if (endIndex >= 0) {
            const startDate = new Date(item.startDate);
            const startIndex = days.findIndex(day => isSameDay(day, startDate));
            if (startIndex >= 0 && endIndex >= startIndex) {
              const newWidth = (endIndex - startIndex + 1) * 60 - 4;
              barElement.style.width = `${newWidth}px`;
            }
          }
        } else if (draggedItem.type === 'bar') {
          // Move the entire bar
          const startIndex = days.findIndex(day => isSameDay(day, newDate));
          if (startIndex >= 0) {
            const newLeft = startIndex * 60;
            barElement.style.left = `${newLeft}px`;
          }
        }
      }
    }
  };

  const handleDragEnd = async () => {
    if (!draggedItem) return;

    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);

    // Remove drag classes
    document.body.classList.remove('dragging', 'dragging-resize', 'dragging-move');

    // Clear drag position indicator
    setDragPosition(null);

    // Get the updated item
    const item = items.find(item => item._id === draggedItem.id || item.id === draggedItem.id);
    if (!item) return;

    try {
      // Calculate the day difference based on final drag distance
      const dayWidth = 60;
      const dayDiff = Math.round((draggedItem.initialX - draggedItem.initialX) / dayWidth);

      // Only update if there was an actual change
      if (dayDiff !== 0 && onItemUpdate) {
        if (draggedItem.type === 'start') {
          const newStartDate = addDays(draggedItem.initialDate, dayDiff);
          // Ensure start date is not after end date
          if (newStartDate < new Date(item.endDate)) {
            await onItemUpdate(draggedItem.id, { startDate: newStartDate });
          }
        } else if (draggedItem.type === 'end') {
          const newEndDate = addDays(draggedItem.initialDate, dayDiff);
          // Ensure end date is not before start date
          if (newEndDate > new Date(item.startDate)) {
            await onItemUpdate(draggedItem.id, { endDate: newEndDate });
          }
        } else if (draggedItem.type === 'bar') {
          const newStartDate = addDays(draggedItem.startDate!, dayDiff);
          const newEndDate = addDays(draggedItem.endDate!, dayDiff);
          await onItemUpdate(draggedItem.id, {
            startDate: newStartDate,
            endDate: newEndDate,
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

    setDraggedItem(null);
  };

  if (isLoading) {
    return (
      <Card className="border shadow-lg">
        <CardContent className="p-0 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="min-w-max">
              {/* Header Skeleton */}
              <div className="flex border-b sticky top-0 bg-background z-10">
                <div className="w-64 min-w-64 p-4 font-medium border-r">
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="flex">
                  {Array.from({ length: 14 }).map((_, index) => (
                    <div key={index} className="w-[60px] min-w-[60px] p-2 text-center border-r">
                      <Skeleton className="h-3 w-10 mx-auto mb-1" />
                      <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Items Skeleton */}
              <div>
                {Array.from({ length: 5 }).map((_, itemIndex) => (
                  <div key={itemIndex} className="flex border-b">
                    <div className="w-64 min-w-64 p-4 border-r">
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex relative">
                      {Array.from({ length: 14 }).map((_, dayIndex) => (
                        <div key={dayIndex} className="w-[60px] min-w-[60px] h-16 border-r" />
                      ))}

                      {/* Skeleton bar */}
                      <Skeleton
                        className="absolute top-2 h-12 rounded-md"
                        style={{
                          left: `${(itemIndex % 3) * 60 + 60}px`,
                          width: `${(3 + (itemIndex % 4)) * 60 - 4}px`,
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

  return (
    <Card className="border shadow-lg">
      <CardContent className="p-0 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="min-w-max" ref={containerRef}>
            {/* Header */}
            <div className="flex border-b sticky top-0 bg-background z-10">
              <div className="w-64 min-w-64 p-4 font-medium border-r sticky left-0 bg-background">
                Task
              </div>
              <div className="flex">
                {days.map((day, index) => {
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const isToday = isSameDay(day, new Date());
                  const isFirstOfMonth = day.getDate() === 1;

                  return (
                    <div
                      key={index}
                      className={cn(
                        'w-[60px] min-w-[60px] text-center text-xs font-medium p-2 border-r relative',
                        isWeekend ? 'bg-muted/50' : '',
                        isFirstOfMonth ? 'border-l-2 border-l-slate-300' : '',
                        isToday ? 'bg-blue-50' : ''
                      )}
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
                })}
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
                          const isToday = isSameDay(day, new Date());
                          const isFirstOfMonth = day.getDate() === 1;

                          return (
                            <div
                              key={index}
                              className={cn(
                                'w-[60px] min-w-[60px] h-16 border-r',
                                isWeekend ? 'bg-muted/50' : '',
                                isFirstOfMonth ? 'border-l-2 border-l-slate-300' : '',
                                isToday ? 'bg-blue-50' : ''
                              )}
                            />
                          );
                        })}

                        {/* Today indicator */}
                        {days.findIndex(day => isSameDay(day, new Date())) >= 0 && (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-[2] opacity-70"
                            style={{
                              left: `${days.findIndex(day => isSameDay(day, new Date())) * 60 + 30}px`,
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
                                    'absolute top-2 h-12 rounded-md cursor-move transition-all duration-150',
                                    getStatusColor(item.status),
                                    isHovered
                                      ? 'ring-2 ring-offset-1 ring-ring shadow-lg'
                                      : 'shadow-md',
                                    'animate-in fade-in-50 duration-300'
                                  )}
                                  style={{
                                    left: `${startIndex * 60}px`,
                                    width: `${duration * 60 - 4}px`,
                                    backgroundColor: item.color || undefined,
                                    animationDelay: `${itemIndex * 50}ms`,
                                  }}
                                  onMouseDown={e =>
                                    handleDragStart(e, item._id || item.id || '', 'bar')
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
                                  />
                                  <div
                                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 transition-colors"
                                    onMouseDown={e => {
                                      e.stopPropagation();
                                      handleDragStart(e, item._id || item.id || '', 'end');
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
