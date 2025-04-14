import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format } from 'date-fns';

// Add global styles for drag highlight
const addGlobalStyles = () => {
  const styleId = 'calendar-drag-styles';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.innerHTML = `
      .calendar-day-highlight {
        background-color: rgba(59, 130, 246, 0.15) !important;
        box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.4) !important;
        transition: all 0.1s ease-in-out;
      }

      .task-dragging {
        opacity: 0.8;
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        z-index: 100 !important;
      }

      .task-resize-handle {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 6px;
        cursor: ew-resize;
        transition: all 0.15s ease;
        opacity: 0;
      }

      .task-resize-handle:hover,
      .task-resize-handle:active {
        background-color: rgba(59, 130, 246, 0.5);
        opacity: 1;
      }

      .task-resize-handle-start {
        left: 0;
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
      }

      .task-resize-handle-end {
        right: 0;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      .task-card:hover .task-resize-handle {
        opacity: 0.5;
      }
    `;
    document.head.appendChild(styleEl);
  }
};
import { Task, TaskPriority } from './types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Filter,
  CheckCircle2,
  Tag,
  AlertCircle,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import CreateTaskModal from './CreateTaskModal';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
  renderPriorityBadge: (priority: TaskPriority) => React.ReactNode;
  onAddTask?: (date: Date) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

type CalendarViewMode = 'month' | 'week' | 'day';

type TaskFilter = {
  showCompleted: boolean;
  priorityFilter: 'all' | TaskPriority;
  overdueOnly: boolean;
}

// Days of the week
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onTaskClick,
  onAddTask,
  onTaskUpdate
}) => {
  // Add global styles for drag highlight
  useEffect(() => {
    addGlobalStyles();
  }, []);
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

  // State for drag-and-drop functionality
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragType, setDragType] = useState<'start' | 'end' | 'move' | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Ref for calendar grid
  const calendarGridRef = useRef<HTMLDivElement | null>(null);

  // Get current year and month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    // Get the first day of the month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();

    // Get the last day of the month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Get the last day of the previous month
    const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0);
    const daysInPrevMonth = lastDayOfPrevMonth.getDate();

    const days: { date: Date; isCurrentMonth: boolean; }[] = [];

    // Add days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(currentYear, currentMonth - 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    // Add days from current month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Add days from next month to complete the grid (6 rows x 7 columns = 42 cells)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  }, [currentYear, currentMonth]);

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

  // Filter tasks by date and other filters
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    // Apply filters
    const filteredTasks = tasks.filter(task => {
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

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Check if a date is selected
  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
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

  // Function to get date from mouse position
  const getDateFromPosition = (x: number, y: number): Date | null => {
    if (!calendarGridRef.current) return null;

    const grid = calendarGridRef.current;
    const gridRect = grid.getBoundingClientRect();

    // Check if mouse is within grid bounds
    if (x < gridRect.left || x > gridRect.right || y < gridRect.top || y > gridRect.bottom) {
      return null;
    }

    // Calculate which cell we're over
    const cellWidth = gridRect.width / 7; // 7 days per week
    const cellHeight = (gridRect.height - 30) / Math.ceil(calendarDays.length / 7); // Subtract header height

    const colIndex = Math.floor((x - gridRect.left) / cellWidth);
    const rowIndex = Math.floor((y - gridRect.top - 30) / cellHeight); // Subtract header height

    const dayIndex = rowIndex * 7 + colIndex;
    if (dayIndex >= 0 && dayIndex < calendarDays.length) {
      return calendarDays[dayIndex].date;
    }

    return null;
  };

  // Handle mouse down on task
  const handleTaskMouseDown = (e: React.MouseEvent, task: Task, type: 'start' | 'end' | 'move') => {
    e.stopPropagation();
    e.preventDefault();

    setIsDragging(true);
    setDraggedTask(task);
    setDragType(type);

    // Set up mouse move and mouse up handlers
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !draggedTask || !dragType) return;

    // Update mouse position
    setMousePosition({ x: e.clientX, y: e.clientY });

    // Get the date from the current mouse position
    const targetDate = getDateFromPosition(e.clientX, e.clientY);
    if (!targetDate) return;

    // Update hover date
    setHoverDate(targetDate);

    // Add visual feedback during dragging
    const dateElement = document.getElementById(targetDate.toISOString());
    if (dateElement) {
      // Remove highlight from all cells
      document.querySelectorAll('.calendar-day-highlight').forEach(el => {
        el.classList.remove('calendar-day-highlight');
      });

      // Add highlight to the target cell
      dateElement.classList.add('calendar-day-highlight');

      // Add visual preview of the task's new dates
      if (dragType === 'start') {
        // Preview start date change
        const currentEndDate = new Date(draggedTask.dueDate);
        if (targetDate <= currentEndDate) {
          // Highlight all dates between new start date and current end date
          highlightDateRange(targetDate, currentEndDate);
        }
      } else if (dragType === 'end') {
        // Preview end date change
        const currentStartDate = new Date(draggedTask.startDate);
        if (targetDate >= currentStartDate) {
          // Highlight all dates between current start date and new end date
          highlightDateRange(currentStartDate, targetDate);
        }
      } else if (dragType === 'move') {
        // Preview task move
        const currentStartDate = new Date(draggedTask.startDate);
        const currentEndDate = new Date(draggedTask.dueDate);
        const duration = currentEndDate.getTime() - currentStartDate.getTime();
        const newEndDate = new Date(targetDate.getTime() + duration);

        // Highlight all dates in the new range
        highlightDateRange(targetDate, newEndDate);
      }
    }
  };

  // Helper function to highlight a range of dates
  const highlightDateRange = (startDate: Date, endDate: Date) => {
    const dates = getDatesInRange(startDate, endDate);
    dates.forEach(date => {
      const dateElement = document.getElementById(date.toISOString());
      if (dateElement) {
        dateElement.classList.add('calendar-day-highlight');
      }
    });
  };

  // Handle mouse up to end drag
  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging || !draggedTask || !dragType) {
      cleanupDrag();
      return;
    }

    const targetDate = getDateFromPosition(e.clientX, e.clientY);
    if (!targetDate) {
      cleanupDrag();
      return;
    }

    // Normalize dates for comparison (remove time component)
    const normalizeDate = (date: Date): Date => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    };

    // Update the task with new dates
    if (onTaskUpdate) {
      const updates: Partial<Task> = {};

      if (dragType === 'start') {
        // Don't allow start date to be after end date
        const normalizedTarget = normalizeDate(targetDate);
        const normalizedDueDate = normalizeDate(new Date(draggedTask.dueDate));

        if (normalizedTarget <= normalizedDueDate) {
          updates.startDate = targetDate;
        }
      } else if (dragType === 'end') {
        // Don't allow end date to be before start date
        const normalizedTarget = normalizeDate(targetDate);
        const normalizedStartDate = normalizeDate(new Date(draggedTask.startDate));

        if (normalizedTarget >= normalizedStartDate) {
          updates.dueDate = targetDate;
        }
      } else if (dragType === 'move') {
        // Move the entire task (preserving duration)
        const currentStartDate = new Date(draggedTask.startDate);
        const currentEndDate = new Date(draggedTask.dueDate);
        const duration = currentEndDate.getTime() - currentStartDate.getTime();

        const newStartDate = new Date(targetDate);
        const newEndDate = new Date(newStartDate.getTime() + duration);

        updates.startDate = newStartDate;
        updates.dueDate = newEndDate;
      }

      if (Object.keys(updates).length > 0) {
        // Apply the updates
        onTaskUpdate(draggedTask.id, updates);
      }
    }

    // Reset state
    setMousePosition(null);
    setHoverDate(null);
    cleanupDrag();
  };

  // Clean up drag state and event listeners
  const cleanupDrag = () => {
    setIsDragging(false);
    setDraggedTask(null);
    setDragType(null);

    // Remove any highlight classes
    document.querySelectorAll('.calendar-day-highlight').forEach(el => {
      el.classList.remove('calendar-day-highlight');
    });

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
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

  // Render a visual indicator for the mouse position during dragging
  const renderDragIndicator = () => {
    if (!isDragging || !mousePosition) return null;

    return (
      <div
        className="fixed w-4 h-4 rounded-full bg-blue-500 shadow-lg pointer-events-none z-50 opacity-70"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
          transform: 'translate(-50%, -50%)',
        }}
      />
    );
  };

  return (
    <div className={cn(
      "bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md border border-slate-200/50 p-5 w-full transition-all backdrop-blur-sm relative",
      isDragging && "from-blue-50 to-blue-100/70 border-blue-200"
    )}>
      {/* Drag indicator */}
      {renderDragIndicator()}

      {/* Drag operation indicator */}
      {isDragging && dragType && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm font-medium">
          {dragType === 'start' && 'Changing start date...'}
          {dragType === 'end' && 'Changing end date...'}
          {dragType === 'move' && 'Moving task...'}
        </div>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md">
            <CalendarIcon className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100/80 rounded-xl overflow-hidden p-1 shadow-inner">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-lg transition-all duration-200",
                viewMode === 'month' ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-blue-500"
              )}
              onClick={() => handleViewModeChange('month')}
            >
              Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-lg transition-all duration-200",
                viewMode === 'week' ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-blue-500"
              )}
              onClick={() => handleViewModeChange('week')}
            >
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-lg transition-all duration-200",
                viewMode === 'day' ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-blue-500"
              )}
              onClick={() => handleViewModeChange('day')}
            >
              Day
            </Button>
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 bg-white/80 border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm"
              >
                <Filter className="h-4 w-4 text-blue-500" /> Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 shadow-lg bg-white/95 backdrop-blur-sm">
              <div className="p-3 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">Show Completed</span>
                  </div>
                  <div className="relative inline-flex h-5 w-10 items-center rounded-full bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer"
                    onClick={() => toggleTaskFilter('showCompleted', !taskFilter.showCompleted)}
                  >
                    <span className={cn("absolute mx-0.5 h-4 w-4 rounded-full bg-white transition-transform", taskFilter.showCompleted ? "translate-x-5 shadow-md" : "translate-x-0")} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                    <span className="text-sm font-medium">Overdue Only</span>
                  </div>
                  <div className="relative inline-flex h-5 w-10 items-center rounded-full bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer"
                    onClick={() => toggleTaskFilter('overdueOnly', !taskFilter.overdueOnly)}
                  >
                    <span className={cn("absolute mx-0.5 h-4 w-4 rounded-full bg-white transition-transform", taskFilter.overdueOnly ? "translate-x-5 shadow-md" : "translate-x-0")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium">Priority</span>
                  </div>
                  <select
                    value={taskFilter.priorityFilter}
                    onChange={(e) => toggleTaskFilter('priorityFilter', e.target.value)}
                    className="w-full text-sm p-2 border border-slate-200 rounded-lg bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="all">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="bg-white/80 border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm font-medium"
          >
            Today
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
              className="bg-white/80 border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              className="bg-white/80 border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm h-8 w-8"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid - Only show for month view */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-7 rounded-xl overflow-hidden shadow-sm border border-slate-200/70 bg-white/50" ref={calendarGridRef}>
          {/* Day Headers */}
          {DAYS.map((day, index) => (
            <div
              key={index}
              className={cn(
                "text-center font-medium py-3 border-b bg-gradient-to-b from-slate-50 to-slate-100/80",
                index === 0 || index === 6 ? "text-blue-500" : "text-slate-600"
              )}
            >
              <span className="text-xs tracking-wide uppercase">{day.slice(0, 3)}</span>
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map(({ date, isCurrentMonth }, index) => {
            const dateKey = date.toDateString();
            const dayTasks = tasksByDate[dateKey] || [];
            const hasOverdueTasks = dayTasks.some(task => new Date(task.dueDate) < new Date());
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div
                key={index}
                id={date.toISOString()}
                className={cn(
                  "min-h-[120px] p-2 relative group",
                  index % 7 !== 6 ? "border-r border-slate-100" : "",
                  index < calendarDays.length - 7 ? "border-b border-slate-100" : "",
                  isCurrentMonth ? "bg-white" : "bg-slate-50/30",
                  isToday(date) ? "bg-blue-50/40" : "",
                  isSelected(date) ? "ring-2 ring-inset ring-blue-400" : "",
                  isWeekend && isCurrentMonth && "bg-slate-50/50",
                  "transition-all duration-200 hover:bg-blue-50/20"
                )}
                onClick={() => handleDateClick(date)}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={cn(
                      "font-medium rounded-full h-7 w-7 flex items-center justify-center transition-all duration-200",
                      isToday(date) ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md" : "",
                      isSelected(date) && !isToday(date) ? "bg-blue-100 text-blue-700" : "",
                      !isCurrentMonth ? "text-slate-400 text-xs" : "text-slate-700",
                      isCurrentMonth && !isToday(date) && !isSelected(date) ? "group-hover:bg-blue-100 group-hover:text-blue-700" : ""
                    )}
                  >
                    {date.getDate()}
                  </span>

                  {isCurrentMonth && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all duration-200 hover:bg-blue-100 hover:text-blue-600 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTask(date);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {/* Tasks for this day - we'll render them differently */}
                <div className="mt-1 space-y-1 relative">
                  {/* Task bars that span multiple days */}
                  {dayTasks.map((task, taskIndex) => {
                    // Determine task position in the calendar
                    const taskStartDate = new Date(task.startDate);
                    const taskEndDate = new Date(task.dueDate);
                    const isStartDate = taskStartDate.toDateString() === date.toDateString();
                    const isMultiDayTask = taskStartDate.toDateString() !== taskEndDate.toDateString();

                    // Skip if we're not at the start date for multi-day tasks
                    // We'll render the entire bar from the start date
                    if (isMultiDayTask && !isStartDate) {
                      return null;
                    }

                    // Calculate task duration for width styling
                    const taskDuration = Math.ceil((taskEndDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days

                    // Get status color
                    const getStatusColor = () => {
                      switch (task.status) {
                        case "To Do":
                          return "bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border-slate-300 shadow-sm";
                        case "In Progress":
                          return "bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 border-blue-300 shadow-sm";
                        case "Review":
                          return "bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 border-amber-300 shadow-sm";
                        case "Completed":
                          return "bg-gradient-to-r from-emerald-100 to-emerald-200 hover:from-emerald-200 hover:to-emerald-300 border-emerald-300 shadow-sm";
                        default:
                          return "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border-gray-300 shadow-sm";
                      }
                    };

                    // Get initials from assignee
                    const getAssigneeInitials = () => {
                      if (task.assignedTo && task.assignedTo.length > 0) {
                        const user = task.assignedTo[0];
                        return user.initials || user.name?.substring(0, 2).toUpperCase() || 'U';
                      }
                      return 'U';
                    };

                    // Get avatar color
                    const getAvatarColor = () => {
                      const colors = [
                        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500',
                        'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
                      ];
                      const hash = task.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                      return colors[hash % colors.length];
                    };

                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "absolute h-6 rounded-md border text-xs flex items-center overflow-hidden cursor-pointer transition-all duration-200 task-card",
                          getStatusColor(),
                          isMultiDayTask ? "z-10" : "mx-1",
                          isDragging && draggedTask?.id === task.id ? "task-dragging" : "",
                          hoverDate && isDragging && draggedTask?.id === task.id ? "pointer-events-none" : ""
                        )}
                        style={{
                          top: `${(taskIndex * 26) + 32}px`,
                          left: isMultiDayTask ? 0 : '4px',
                          width: isMultiDayTask ? `calc(${taskDuration * 100}% - 2px)` : 'calc(100% - 8px)',
                          zIndex: isMultiDayTask ? 10 + taskIndex : 5
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick?.(task.id);
                        }}
                        onMouseDown={(e) => handleTaskMouseDown(e, task, 'move')}
                      >
                        {/* Task content */}
                        <div className="flex items-center h-full w-full px-2">
                          {/* Assignee avatar */}
                          <div className="flex-shrink-0 mr-1.5">
                            <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-sm", getAvatarColor())}>
                              {getAssigneeInitials()}
                            </div>
                          </div>

                          {/* Task name */}
                          <span className="truncate flex-grow font-medium">{task.name}</span>

                          {/* Edit button - only show on hover */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 ml-auto hover:bg-white/50 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTask(task);
                            }}
                          >
                            <Edit className="h-2.5 w-2.5" />
                          </Button>
                        </div>

                        {/* Drag handles */}
                        {isMultiDayTask && (
                          <>
                            <div
                              className="task-resize-handle task-resize-handle-start"
                              onMouseDown={(e) => handleTaskMouseDown(e, task, 'start')}
                              title="Drag to change start date"
                            />
                            <div
                              className="task-resize-handle task-resize-handle-end"
                              onMouseDown={(e) => handleTaskMouseDown(e, task, 'end')}
                              title="Drag to change end date"
                            />
                          </>
                        )}
                      </div>
                    );
                  })}

                  {dayTasks.length > 3 && (
                    <div className="mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs w-full h-6 bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-800 rounded-md transition-all duration-200 shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        +{dayTasks.length - 3} more
                      </Button>
                    </div>
                  )}

                  {/* Indicator for overdue tasks */}
                  {hasOverdueTasks && (
                    <div className="absolute top-1 right-1">
                      <div className="h-3 w-3 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-sm animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
