'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Check, X, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TaskDetailSidebar from '../Tasks/TaskDetailSidebar';
import { TaskService } from '@/services/Task.service';
import QuickTaskForm from './QuickTaskForm';

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
    setError,
    selectedTask,
    setSelectedTask,
    convertApiTaskToCalendarTask,
    filters,
  } = useCalendarStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [quickAddTaskDate, setQuickAddTaskDate] = useState<Date | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>(filters.searchQuery);

  // Debounce search query to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(filters.searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => TaskService.deleteTask(taskId),
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
      return TaskService.updateTask(id, { status: status as any });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-tasks'] });
      toast.success('Task status updated');
    },
    onError: (_error: Error) => {
      toast.error('Failed to update task status');
    },
  });

  // Add staleTime and refetchOnWindowFocus options to optimize API calls
  const { isLoading, error } = useQuery({
    queryKey: [
      'calendar-tasks',
      dateRange,
      filters.status,
      filters.priority,
      filters.assignedTo,
      debouncedSearchQuery,
    ],
    queryFn: async () => {
      try {
        const from = dateRange?.from
          ? format(startOfDay(dateRange.from), 'yyyy-MM-dd')
          : format(startOfDay(currentDate), 'yyyy-MM-dd');
        const to = dateRange?.to
          ? format(startOfDay(dateRange.to), 'yyyy-MM-dd')
          : format(startOfDay(addDays(currentDate, 6)), 'yyyy-MM-dd');
        const apiTasks = await TaskService.getAllTasks({
          dateRange: { from, to },
          status: filters.status !== 'all' ? filters.status : undefined,
          priority: filters.priority !== 'all' ? filters.priority : undefined,
          assignedTo: filters.assignedTo || undefined,
          searchQuery: debouncedSearchQuery || undefined,
        });

        const calendarTasks = apiTasks.map(convertApiTaskToCalendarTask);
        setTasks(calendarTasks);
        return calendarTasks;
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tasks');
        throw err;
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  const startDate = dateRange?.from
    ? startOfDay(new Date(dateRange.from))
    : startOfDay(currentDate);
  const endDate = dateRange?.to ? startOfDay(new Date(dateRange.to)) : addDays(startDate, 6);

  const weekDays = useMemo(() => {
    const days: DayInfo[] = [];
    let currentDay = startDate;

    while (currentDay <= endDate) {
      days.push({
        date: currentDay,
        dayName: format(currentDay, 'EEE'),
        dayNumber: format(currentDay, 'd'),
        fullDate: format(currentDay, 'yyyy-MM-dd'),
      });
      currentDay = addDays(currentDay, 1);
    }

    return days;
  }, [startDate, endDate]);

  const tasksByDate = useMemo(() => {
    const groupedTasks: Record<string, any[]> = {};

    tasks.forEach(task => {
      const taskStartDate = parseISO(task.startDate);
      const taskEndDate = parseISO(task.endDate);

      if (
        (!dateRange?.from || taskStartDate >= dateRange.from) &&
        (!dateRange?.to || taskStartDate <= dateRange.to)
      ) {
        const dateKey = format(taskStartDate, 'yyyy-MM-dd');

        if (!groupedTasks[dateKey]) {
          groupedTasks[dateKey] = [];
        }

        const taskWithMeta = {
          ...task,
          isStartDate: true,
          isEndDate: isSameDay(taskStartDate, taskEndDate),
          isContinuation: false,
        };

        groupedTasks[dateKey].push(taskWithMeta);
      }
    });

    return groupedTasks;
  }, [tasks, dateRange]);

  const filteredWeekDays = useMemo(() => {
    return weekDays.filter(day => {
      if (!dateRange?.from || !dateRange?.to) return true;

      const fromDate = startOfDay(new Date(dateRange.from));
      const toDate = startOfDay(new Date(dateRange.to));

      return (
        (isSameDay(day.date, fromDate) || isAfter(day.date, fromDate)) &&
        (isSameDay(day.date, toDate) || isBefore(day.date, toDate))
      );
    });
  }, [weekDays, dateRange]);

  const handleTaskClick = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsSidebarOpen(true);
  };

  const handleQuickAddTask = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(date);
    setQuickAddTaskDate(date);
  };

  const createTaskMutation = useMutation({
    mutationFn: (taskData: any) => TaskService.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-tasks'] });
      toast.success('Task created successfully');
    },
    onError: (_error: Error) => {
      toast.error('Failed to create task');
    },
  });

  const handleTaskUpdate = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      TaskService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-tasks'] });
      toast.success('Task updated successfully');
    },
    onError: (_error: Error) => {
      toast.error('Failed to update task');
    },
  });

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
              className="absolute top-0 right-0 h-7 w-7 p-0 rounded-full bg-white shadow-sm border border-gray-100 text-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all z-10"
              onClick={e => handleQuickAddTask(day.date, e)}
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Tasks for the day */}
            <div className="space-y-2 mt-4 h-full">
              {isLoading ? (
                <>
                  {[...Array(2)].map((_, index) => (
                    <Skeleton key={index} className="h-20 w-full rounded-lg" />
                  ))}
                </>
              ) : (
                <>
                  {tasksByDate[day.fullDate]?.map((task: any) => (
                    <motion.div
                      key={`${task._id}-${day.fullDate}`}
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
                                  setIsSidebarOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  if (confirm('Are you sure you want to delete this task?')) {
                                    deleteTaskMutation.mutate(task._id);
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
                                      id: task._id,
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
                                      id: task._id,
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
                          <div className="text-xs text-gray-600 line-clamp-2">
                            {task.description}
                          </div>
                        )}
                        <div className="flex gap-2 items-center mt-1">
                          <Badge
                            variant={task.completed ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}

              {/* Add task button for empty days */}
              {/* Quick task form */}
              {quickAddTaskDate && isSameDay(quickAddTaskDate, day.date) && (
                <div className="absolute top-10 right-2 left-2 z-20">
                  <QuickTaskForm
                    date={day.date}
                    onSubmit={taskData => {
                      // Prepare task data with required fields
                      const newTaskData = {
                        name: taskData.name,
                        description: '',
                        startDate: taskData.startDate,
                        dueDate: taskData.dueDate,
                        status: 'To Do',
                        priority: 'Medium',
                        estimatedTime: 0,
                        loggedTime: 0,
                        assignedTo: [],
                        subtasks: [],
                        tags: [],
                      };

                      // Create task using TaskService
                      createTaskMutation.mutate(newTaskData);
                      setQuickAddTaskDate(null);
                    }}
                    onCancel={() => setQuickAddTaskDate(null)}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Task Sidebar */}
      {isSidebarOpen && useCalendarStore.getState().selectedTask && (
        <TaskDetailSidebar
          task={selectedTask as any}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onTaskUpdate={({ taskId, updates }: any) => {
            handleTaskUpdate.mutate({ id: taskId, updates: updates });
          }}
        />
      )}
    </div>
  );
};

export default TaskCalendar;
