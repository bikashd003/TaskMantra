'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Calendar as BigCalendar, Views, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './big-calendar.css';
import { Task, TaskPriority, TaskStatus } from './types';
import { cn } from '@/lib/utils';

import CreateTaskModal from './CreateTaskModal';
import CalendarHeader from './CalendarHeader';
import { toast } from 'sonner';
import TaskDetailSidebar from './TaskDetailSidebar';

const localizer = momentLocalizer(moment);

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

interface TaskFilter {
  showCompleted: boolean;
  priorityFilter: 'all' | TaskPriority;
  overdueOnly: boolean;
  projectFilter: string | null;
}

interface BigCalendarViewProps {
  tasks: Task[];
  onAddTask?: (date: Date) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

const BigCalendarView: React.FC<BigCalendarViewProps> = ({ tasks, onAddTask, onTaskUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<string>(Views.MONTH);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>({
    showCompleted: true,
    priorityFilter: 'all',
    overdueOnly: false,
    projectFilter: null,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDateForTask, setSelectedDateForTask] = useState<Date | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const events = useMemo(() => {
    return tasks
      .filter(task => {
        if (!taskFilter.showCompleted && task.status === 'Completed') {
          return false;
        }
        if (taskFilter.priorityFilter !== 'all' && task.priority !== taskFilter.priorityFilter) {
          return false;
        }
        if (taskFilter.projectFilter && task.projectId !== taskFilter.projectFilter) {
          return false;
        }
        if (taskFilter.overdueOnly) {
          if (!task.dueDate) return false;
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
        // Use default dates if startDate or dueDate is undefined
        const start = task.startDate ? new Date(task.startDate) : new Date();
        const end = task.dueDate ? new Date(task.dueDate) : new Date();

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
        };
      });
  }, [tasks, taskFilter]);

  const getTaskStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'To Do':
        return '#d1d5db';
      case 'In Progress':
        return '#3b82f6';
      case 'Review':
        return '#f59e0b';
      case 'Completed':
        return '#10b981';
      default:
        return '#d1d5db';
    }
  };

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

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    setSelectedDateForTask(start);
    setIsEditingTask(false);
    setTaskToEdit(null);
    setIsCreateModalOpen(true);
    setIsSidebarOpen(false);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    try {
      const taskData = event.resource as Task;
      if (taskData) {
        setTaskToEdit(taskData);
        setIsEditingTask(true);
        setIsSidebarOpen(true);
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      toast.error('Failed to handle task click', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  const handleCreateOrUpdateTask = (taskData: any) => {
    if (isEditingTask && taskToEdit && onTaskUpdate) {
      onTaskUpdate(taskToEdit.id, taskData);
    } else if (onAddTask && selectedDateForTask) {
      onAddTask(selectedDateForTask);
    }

    setIsCreateModalOpen(false);
    setIsSidebarOpen(false);
  };

  const handleViewChange = (newView: string) => {
    setView(newView as any);
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const toggleTaskFilter = (filterKey: keyof TaskFilter, value: any) => {
    setTaskFilter(prev => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

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
      <TaskDetailSidebar
        task={taskToEdit}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onTaskUpdate={handleCreateOrUpdateTask}
      />
    </div>
  );
};

export default BigCalendarView;
