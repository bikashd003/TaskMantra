'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Calendar as BigCalendar, Views, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './big-calendar.css';
import { Task, TaskPriority, TaskStatus } from './types';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, AlertCircle, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import CreateTaskModal from './CreateTaskModal';
import CalendarHeader from './CalendarHeader';
import { toast } from 'sonner';

// Setup the localizer
const localizer = momentLocalizer(moment);

// Define the event type for the calendar
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
  status: TaskStatus;
  priority: TaskPriority;
  color?: string;
}

// Define the filter type
interface TaskFilter {
  showCompleted: boolean;
  priorityFilter: 'all' | TaskPriority;
  overdueOnly: boolean;
  projectFilter: string | null;
}

interface BigCalendarViewProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
  renderPriorityBadge?: (priority: TaskPriority) => React.ReactNode;
  onAddTask?: (date: Date) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

const BigCalendarView: React.FC<BigCalendarViewProps> = ({
  tasks,
  onTaskClick,
  onAddTask,
  onTaskUpdate,
}) => {
  // State for calendar view
  const [isHovered, setIsHovered] = React.useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<string>(Views.MONTH);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>({
    showCompleted: true,
    priorityFilter: 'all',
    overdueOnly: false,
    projectFilter: null,
  });

  // State for task creation modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDateForTask, setSelectedDateForTask] = useState<Date | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Convert tasks to calendar events
  const events = useMemo(() => {
    return tasks
      .filter(task => {
        // Filter by completion status
        if (!taskFilter.showCompleted && task.status === 'Completed') {
          return false;
        }

        // Filter by priority
        if (taskFilter.priorityFilter !== 'all' && task.priority !== taskFilter.priorityFilter) {
          return false;
        }

        // Filter by project
        if (taskFilter.projectFilter && task.projectId !== taskFilter.projectFilter) {
          return false;
        }

        // Filter by overdue status
        if (taskFilter.overdueOnly) {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (dueDate >= today) {
            return false;
          }
        }

        return true;
      })
      .map(task => {
        // Ensure we have valid dates
        const start = new Date(task.startDate);
        const end = new Date(task.dueDate);

        // Add one day to end date for proper display in calendar
        const adjustedEnd = new Date(end);
        adjustedEnd.setDate(adjustedEnd.getDate() + 1);

        return {
          id: task.id,
          title: task.name,
          start,
          end: adjustedEnd,
          allDay: true,
          resource: task,
          status: task.status,
          priority: task.priority,
          color: task.color,
        };
      });
  }, [tasks, taskFilter]);

  // Get task status color
  const getTaskStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'To Do':
        return '#d1d5db'; // gray-300
      case 'In Progress':
        return '#3b82f6'; // blue-500
      case 'Review':
        return '#f59e0b'; // amber-500
      case 'Completed':
        return '#10b981'; // emerald-500
      default:
        return '#d1d5db'; // gray-300
    }
  };

  // Custom event styling
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const backgroundColor = event.color || getTaskStatusColor(event.status);
    const isPastDue = new Date(event.end) < new Date() && event.status !== 'Completed';

    const style = {
      backgroundColor,
      borderRadius: '6px',
      opacity: 0.85,
      color: '#fff',
      border: '0px',
      display: 'block',
      fontWeight: event.priority === 'High' ? '600' : '500',
      boxShadow: isPastDue ? '0 0 0 1px rgba(239, 68, 68, 0.7)' : undefined,
      borderLeft: event.priority === 'High' ? '3px solid rgba(255, 255, 255, 0.7)' : undefined,
    };

    return {
      style,
      className: cn(
        event.priority === 'High' && 'high-priority-task',
        isPastDue && 'past-due-task'
      ),
    };
  }, []);

  // Handle date selection
  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    setSelectedDateForTask(start);
    setIsEditingTask(false);
    setTaskToEdit(null);
    setIsCreateModalOpen(true);
  }, []);

  // Handle event selection (task click)
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      try {
        if (onTaskClick) {
          onTaskClick(event.id);
        } else {
          // If no click handler is provided, open the edit modal
          const taskData = event.resource as Task;
          if (taskData) {
            setTaskToEdit(taskData);
            setIsEditingTask(true);
            setIsCreateModalOpen(true);
          }
        }
      } catch (error) {
        toast.error('Failed to handle task click', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    [onTaskClick]
  );

  // Handle create or update task
  const handleCreateOrUpdateTask = (taskData: any) => {
    if (isEditingTask && taskToEdit && onTaskUpdate) {
      onTaskUpdate(taskToEdit.id, taskData);
    } else if (onAddTask && selectedDateForTask) {
      onAddTask(selectedDateForTask);
    }

    // Close the modal
    setIsCreateModalOpen(false);
  };

  // Handle view change
  const handleViewChange = (newView: string) => {
    setView(newView as any);
  };

  // Handle date change
  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  // Toggle task filter
  const toggleTaskFilter = (filterKey: keyof TaskFilter, value: any) => {
    setTaskFilter(prev => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Navigate to previous period
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === Views.MONTH) {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === Views.WEEK) {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === Views.DAY) {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next period
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === Views.MONTH) {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === Views.WEEK) {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === Views.DAY) {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="bg-white rounded shadow-md border border-gray-200 p-4 w-full relative">
      {/* Task Creation/Edit Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateOrUpdateTask}
        isLoading={false}
        initialDate={selectedDateForTask}
        editTask={taskToEdit}
      />

      {/* Calendar */}
      <div className="h-[700px]">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          view={view as any}
          date={currentDate}
          onNavigate={handleNavigate}
          onView={handleViewChange as any}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          popup
          components={{
            event: props => {
              const event = props.event as CalendarEvent;
              const task = event.resource as Task;

              return (
                <Popover open={isHovered}>
                  <PopoverTrigger asChild>
                    <div
                      className="truncate px-1 py-0.5 cursor-pointer hover:opacity-80 transition-opacity"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      {event.title}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 shadow-lg" align="start">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-base">{task.name}</h4>
                        <div
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            task.status === 'To Do' && 'bg-gray-100 text-gray-700',
                            task.status === 'In Progress' && 'bg-blue-100 text-blue-700',
                            task.status === 'Review' && 'bg-amber-100 text-amber-700',
                            task.status === 'Completed' && 'bg-green-100 text-green-700'
                          )}
                        >
                          {task.status}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">{task.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-gray-700">
                            Start: {format(new Date(task.startDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-gray-700">
                            Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <AlertCircle
                            className={cn(
                              'h-3.5 w-3.5',
                              task.priority === 'High'
                                ? 'text-red-500'
                                : task.priority === 'Medium'
                                  ? 'text-amber-500'
                                  : 'text-green-500'
                            )}
                          />
                          <span className="text-gray-700">{task.priority} Priority</span>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={e => {
                            e.stopPropagation();
                            setTaskToEdit(task);
                            setIsEditingTask(true);
                            setIsCreateModalOpen(true);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit Task
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            },
            toolbar: () => (
              <CalendarHeader
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                view={view}
                setView={setView}
                taskFilter={taskFilter}
                toggleTaskFilter={toggleTaskFilter}
                goToToday={goToToday}
                goToPrevious={goToPrevious}
                goToNext={goToNext}
                handleViewChange={handleViewChange}
                tasks={tasks}
              />
            ),
          }}
        />
      </div>
    </div>
  );
};

export default BigCalendarView;
