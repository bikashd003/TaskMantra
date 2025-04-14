import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
} from '@dnd-kit/core';
import { Task, TaskPriority } from './types';
import { Calendar as CalendarIcon } from 'lucide-react';
import CreateTaskModal from './CreateTaskModal';
import CalendarHeader, { CalendarViewMode, TaskFilter } from './CalendarComponents/CalendarHeader';
import CalendarGrid from './CalendarComponents/CalendarGrid';
import useCalendarStyles from './CalendarComponents/CalendarStyles';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
  renderPriorityBadge?: (priority: TaskPriority) => React.ReactNode;
  onAddTask?: (date: Date) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onTaskClick,
  onAddTask,
  onTaskUpdate
}) => {
  // Apply calendar styles
  useCalendarStyles();

  // State for calendar view
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [taskFilter, setTaskFilter] = useState<TaskFilter>({
    showCompleted: true,
    priorityFilter: 'all',
    overdueOnly: false
  });

  // State for task creation modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDateForTask, setSelectedDateForTask] = useState<Date | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Local state for tasks to enable smooth updates
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [_activeDragTask, setActiveDragTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Ref for calendar grid
  const calendarGridRef = useRef<HTMLDivElement | null>(null);

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: () => {
        // Handle keyboard navigation for accessibility
        return { x: 0, y: 0 };
      },
    })
  );

  // Get current year and month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();



  // Helper function to get all dates between start and end dates
  const getDatesInRange = (startDate: Date, endDate: Date) => {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);

    // Set hours to 0 to compare dates only
    currentDate.setHours(0, 0, 0, 0);
    const endDateNormalized = new Date(endDate);
    endDateNormalized.setHours(0, 0, 0, 0);

    // Add all dates from start to end (inclusive)
    while (currentDate <= endDateNormalized) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // Update local tasks when props tasks change (except during drag)
  useEffect(() => {
    if (!isDragging) {
      setLocalTasks(tasks);
    }
  }, [tasks, isDragging]);

  // Filter tasks by date and other filters
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    // Apply filters
    const filteredTasks = localTasks.filter(task => {
      // Filter by completion status
      if (!taskFilter.showCompleted && task.status === 'Completed') {
        return false;
      }

      // Filter by priority
      if (taskFilter.priorityFilter !== 'all' && task.priority !== taskFilter.priorityFilter) {
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
    });

    filteredTasks.forEach(task => {
      if (task.startDate && task.dueDate) {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.dueDate);

        // Get all dates between start and end date
        const datesInRange = getDatesInRange(startDate, endDate);

        // Add task to each date in the range
        datesInRange.forEach(date => {
          const dateKey = date.toDateString();
          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          grouped[dateKey].push(task);
        });
      } else if (task.dueDate) {
        // Fallback to just using dueDate if startDate is not available
        const dateKey = new Date(task.dueDate).toDateString();
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });

    return grouped;
  }, [tasks, taskFilter]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // Handle add task for a specific date
  const handleAddTask = (date: Date) => {
    setSelectedDateForTask(date);
    setIsEditingTask(false);
    setTaskToEdit(null);
    setIsCreateModalOpen(true);
  };

  // Handle edit task
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsEditingTask(true);
    setIsCreateModalOpen(true);
  };

  // Handle create or update task
  const handleCreateOrUpdateTask = (taskData: any) => {
    if (isEditingTask && taskToEdit && onTaskUpdate) {
      onTaskUpdate(taskToEdit.id, taskData);
    } else if (onAddTask && selectedDateForTask) {
      // For new tasks, we'll use the selected date
      onAddTask(selectedDateForTask);
    }

    // Close the modal
    setIsCreateModalOpen(false);
  };

  // Toggle task filter
  const toggleTaskFilter = (filterKey: keyof TaskFilter, value: any) => {
    setTaskFilter(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  // Handle view mode change
  const handleViewModeChange = (mode: CalendarViewMode) => {
    setViewMode(mode);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.task) {
      const task = event.active.data.current.task as Task;
      setActiveDragTask(task);
      setIsDragging(true);

      // Add visual feedback for the dragged element
      const draggedElement = document.getElementById(event.active.id.toString());
      if (draggedElement) {
        draggedElement.classList.add('task-dragging');
      }

      // Highlight potential drop targets
      const calendarDays = document.querySelectorAll('.calendar-day');
      calendarDays.forEach(day => {
        day.classList.add('calendar-day-highlight');
      });
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    setActiveDragTask(null);

    // Remove visual feedback
    const draggedElement = document.getElementById(active.id.toString());
    if (draggedElement) {
      draggedElement.classList.remove('task-dragging');
    }

    // Remove highlights from calendar days
    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(day => {
      day.classList.remove('calendar-day-highlight');
    });

    if (!over || !active.data.current?.task) return;

    const task = active.data.current.task as Task;
    const type = active.data.current.type as 'start' | 'end' | 'move';
    const targetDate = new Date(over.id as string);

    if (onTaskUpdate) {
      const updates: Partial<Task> = {};

      // Normalize dates for comparison (remove time component)
      const normalizeDate = (date: Date): Date => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      };

      if (type === 'start') {
        // Don't allow start date to be after end date
        const normalizedTarget = normalizeDate(targetDate);
        const normalizedDueDate = normalizeDate(new Date(task.dueDate));

        if (normalizedTarget <= normalizedDueDate) {
          updates.startDate = targetDate;

          // Update local state immediately for smooth UI
          setLocalTasks(prevTasks =>
            prevTasks.map(t =>
              t.id === task.id ? { ...t, startDate: targetDate } : t
            )
          );
        }
      } else if (type === 'end') {
        // Don't allow end date to be before start date
        const normalizedTarget = normalizeDate(targetDate);
        const normalizedStartDate = normalizeDate(new Date(task.startDate));

        if (normalizedTarget >= normalizedStartDate) {
          updates.dueDate = targetDate;

          // Update local state immediately for smooth UI
          setLocalTasks(prevTasks =>
            prevTasks.map(t =>
              t.id === task.id ? { ...t, dueDate: targetDate } : t
            )
          );
        }
      } else if (type === 'move') {
        // Move the entire task (preserving duration)
        const currentStartDate = new Date(task.startDate);
        const currentEndDate = new Date(task.dueDate);
        const duration = currentEndDate.getTime() - currentStartDate.getTime();

        const newStartDate = new Date(targetDate);
        const newEndDate = new Date(newStartDate.getTime() + duration);

        updates.startDate = newStartDate;
        updates.dueDate = newEndDate;

        // Update local state immediately for smooth UI
        setLocalTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === task.id ? {
              ...t,
              startDate: newStartDate,
              dueDate: newEndDate
            } : t
          )
        );
      }

      if (Object.keys(updates).length > 0) {
        // Apply the updates to the backend
        onTaskUpdate(task.id, updates);
      }
    }
  };



  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg border border-slate-200/50 p-5 w-full transition-all backdrop-blur-sm relative hover:shadow-xl">
      {/* Visual indicator for drag operation */}
      {isDragging && (
        <div className="absolute inset-0 rounded-xl border-2 border-blue-400 pointer-events-none z-10 animate-pulse opacity-50"></div>
      )}
      {/* Task Creation/Edit Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateOrUpdateTask}
        isLoading={false}
        initialDate={selectedDateForTask}
        editTask={taskToEdit}
      />

      {/* Calendar Header */}
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        taskFilter={taskFilter}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
        onViewModeChange={handleViewModeChange}
        onFilterChange={toggleTaskFilter}
      />

      {/* Calendar Grid - Only show for month view */}
      {viewMode === 'month' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div ref={calendarGridRef}>
            <CalendarGrid
              currentDate={currentDate}
              selectedDate={selectedDate}
              tasksByDate={tasksByDate}
              onDateClick={handleDateClick}
              onAddTask={handleAddTask}
              onTaskClick={onTaskClick || (() => { })}
              onEditTask={handleEditTask}
            />
          </div>
        </DndContext>
      )}

      {viewMode === 'week' && (
        <div className="border border-slate-200 rounded-xl p-6 bg-white/80 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Week View
            </h3>
          </div>
          <div className="flex items-center justify-center py-16 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg border border-slate-200/70">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                <CalendarIcon className="h-8 w-8 text-indigo-500" />
              </div>
              <p className="text-slate-600 font-medium">Week view is coming soon</p>
              <p className="text-slate-500 text-sm mt-1">Check back for updates</p>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'day' && (
        <div className="border border-slate-200 rounded-xl p-6 bg-white/80 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-lg shadow-md">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : format(currentDate, 'EEEE, MMMM d, yyyy')}
            </h3>
          </div>
          <div className="flex items-center justify-center py-16 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg border border-slate-200/70">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <CalendarIcon className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-slate-600 font-medium">Day view is coming soon</p>
              <p className="text-slate-500 text-sm mt-1">Check back for updates</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
