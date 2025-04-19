'use client';
import React, { useState } from 'react';
import {
  format,
  addDays,
  isToday,
  isSameDay,
  startOfDay,
  isAfter,
  isBefore,
  parseISO,
} from 'date-fns';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCalendarStore } from '@/stores/calendarStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarService } from '@/services/Calendar.service';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Check, X, MoreHorizontal } from 'lucide-react';
import TaskDetailModal from './TaskDetailModal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TaskDetailSidebar from '../Tasks/TaskDetailSidebar';

interface DayInfo {
  date: Date;
  dayName: string;
  dayNumber: string;
  fullDate: string;
}

const TaskCalendar = () => {
  const currentDate = new Date();
  const {
    selectedDate,
    setSelectedDate,
    dateRange,
    setTasks,
    tasks,
    setIsLoading,
    setError,
    setSelectedTask,
    convertApiTaskToCalendarTask,
    filters,
  } = useCalendarStore();

  // State for task detail modal and sidebar
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => CalendarService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (_error: Error) => {
      toast.error('Failed to delete task');
    },
  });

  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      return CalendarService.updateTask(id, { status: status as any });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-tasks'] });
      toast.success('Task status updated');
    },
    onError: (_error: Error) => {
      toast.error('Failed to update task status');
    },
  });

  // Fetch tasks from API based on date range and filters
  const { isLoading, error } = useQuery({
    queryKey: ['calendar-tasks', dateRange, filters],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const apiTasks = await CalendarService.getTasksByDateRange(dateRange, {
          status: filters.status !== 'all' ? filters.status : undefined,
          priority: filters.priority !== 'all' ? filters.priority : undefined,
          assignedTo: filters.assignedTo || undefined,
          searchQuery: filters.searchQuery || undefined,
        });
        // Convert API tasks to calendar format
        const calendarTasks = apiTasks.map(convertApiTaskToCalendarTask);
        setTasks(calendarTasks);
        return calendarTasks;
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tasks');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const startDate = dateRange?.from
    ? startOfDay(new Date(dateRange.from))
    : startOfDay(currentDate);
  const endDate = dateRange?.to ? startOfDay(new Date(dateRange.to)) : addDays(startDate, 6);

  // Generate days based on the range
  const weekDays: DayInfo[] = [];
  let currentDay = startDate;

  while (currentDay <= endDate) {
    weekDays.push({
      date: currentDay,
      dayName: format(currentDay, 'EEE'),
      dayNumber: format(currentDay, 'd'),
      fullDate: format(currentDay, 'yyyy-MM-dd'),
    });
    currentDay = addDays(currentDay, 1);
  }
  // Group tasks by date and filter by dateRange
  const tasksByDate: Record<string, any[]> = {};

  // Process each task
  tasks.forEach(task => {
    // Only show tasks on their start date
    const taskStartDate = parseISO(task.startDate);
    const taskEndDate = parseISO(task.endDate);

    // Only add if the start day is within our visible range
    if (
      (!dateRange?.from || taskStartDate >= dateRange.from) &&
      (!dateRange?.to || taskStartDate <= dateRange.to)
    ) {
      const dateKey = format(taskStartDate, 'yyyy-MM-dd');

      // Initialize array for this date if it doesn't exist
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }

      // Add metadata to indicate if this is start/end/continuation
      const taskWithMeta = {
        ...task,
        isStartDate: true,
        isEndDate: isSameDay(taskStartDate, taskEndDate),
        isContinuation: false,
      };

      // Add task to the date's array
      tasksByDate[dateKey].push(taskWithMeta);
    }
  });

  // Filter weekDays based on dateRange
  const filteredWeekDays = weekDays.filter(day => {
    if (!dateRange?.from || !dateRange?.to) return true;

    const fromDate = startOfDay(new Date(dateRange.from));
    const toDate = startOfDay(new Date(dateRange.to));

    return (
      (isSameDay(day.date, fromDate) || isAfter(day.date, fromDate)) &&
      (isSameDay(day.date, toDate) || isBefore(day.date, toDate))
    );
  });

  // Handle opening task sidebar
  const handleTaskClick = (task: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering day click
    setSelectedTask(task);
    setIsSidebarOpen(true);
  };

  // Handle creating a new task
  const handleCreateTask = (date: Date) => {
    setSelectedDate(date);
    setIsCreatingTask(true);
    setIsTaskModalOpen(true);
  };

  // Handle task update from sidebar
  const handleTaskUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['calendar-tasks'] });
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-xl shadow-sm">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-6 w-12 mx-auto mb-2" />
              <Skeleton className="h-10 w-10 rounded-full mx-auto" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">
          Error loading calendar: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm">
      {/* Week days header */}
      <div className="grid grid-cols-7 gap-4 mb-4">
        {filteredWeekDays.map(day => (
          <div key={day.fullDate} className="text-center">
            <div className="font-medium text-gray-400 text-sm">{day.dayName}</div>
            <div
              className={cn(
                'w-10 h-10 rounded-full mx-auto flex items-center justify-center text-sm transition-colors',
                isToday(day.date) && 'bg-blue-500 text-white font-semibold',
                selectedDate && isSameDay(selectedDate, day.date) && 'bg-blue-100'
              )}
            >
              {day.dayNumber}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-4">
        {filteredWeekDays.map(day => (
          <motion.div
            key={day.fullDate}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'min-h-[200px] border rounded-xl p-3 transition-colors relative',
              isToday(day.date) ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100',
              'hover:border-blue-200 cursor-pointer'
            )}
            onClick={() => setSelectedDate(day.date)}
          >
            {/* Add task button */}
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
              onClick={e => {
                e.stopPropagation();
                handleCreateTask(day.date);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Tasks for the day */}
            <div className="space-y-2 mt-2">
              {tasksByDate[day.fullDate]?.map((task: any) => (
                <motion.div
                  key={`${task.id}-${day.fullDate}`}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    'p-3 rounded-lg shadow-sm border transition-all group relative',
                    task.color || 'bg-blue-100 hover:bg-blue-200 border-blue-200',
                    task.isContinuation && 'border-dashed',
                    task.isStartDate && !task.isEndDate && 'border-l-4 border-l-blue-500',
                    !task.isStartDate && task.isEndDate && 'border-r-4 border-r-blue-500'
                  )}
                  onClick={e => handleTaskClick(task, e)}
                >
                  {/* Quick actions */}
                  {task.isStartDate && (
                    <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 hover:bg-gray-200/80"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedTask(task);
                              setIsCreatingTask(false);
                              setIsTaskModalOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this task?')) {
                                deleteTaskMutation.mutate(task.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                          {task.status !== 'Completed' ? (
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                updateTaskStatusMutation.mutate({
                                  id: task.id,
                                  status: 'Completed',
                                });
                              }}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4 mr-2" /> Mark Complete
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                updateTaskStatusMutation.mutate({
                                  id: task.id,
                                  status: 'In Progress',
                                });
                              }}
                            >
                              <X className="h-4 w-4 mr-2" /> Mark Incomplete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <div className="font-medium text-sm">{task.title}</div>
                    {!task.isContinuation && (
                      <div className="text-xs text-gray-600">
                        {format(parseISO(task.startDate), 'MMM d')} -{' '}
                        {format(parseISO(task.endDate), 'MMM d')}
                      </div>
                    )}
                    {task.isStartDate && (
                      <div className="text-xs text-gray-600 line-clamp-2">{task.description}</div>
                    )}
                    <div className="flex gap-2 items-center mt-1">
                      <Badge variant={task.completed ? 'default' : 'secondary'} className="text-xs">
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Add task button for empty days */}
              {(!tasksByDate[day.fullDate] || tasksByDate[day.fullDate].length === 0) && (
                <div className="h-full flex flex-col items-center justify-center py-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={e => {
                      e.stopPropagation();
                      handleCreateTask(day.date);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Task
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        isCreating={isCreatingTask}
      />

      {/* Task Sidebar */}
      {isSidebarOpen && useCalendarStore.getState().selectedTask && (
        <TaskDetailSidebar
          task={
            {
              ...useCalendarStore.getState().selectedTask,
              // Add missing properties required by Task type
              createdBy: '',
              estimatedTime: 0,
              loggedTime: 0,
              dependencies: [],
              subtasks: [],
              comments: [],
              tags: [],
              createdAt: new Date(),
            } as any
          }
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onTaskUpdate={() => {
            handleTaskUpdate();
          }}
        />
      )}
    </div>
  );
};

export default TaskCalendar;
