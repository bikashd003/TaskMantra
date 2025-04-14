import React, { useState, useMemo, useRef } from 'react';
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
  const handleMouseMove = (_e: MouseEvent) => {
    if (!isDragging || !draggedTask) return;
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
    
    // Update the task with new dates
    if (onTaskUpdate) {
      const updates: Partial<Task> = {};
      
      if (dragType === 'start') {
        // Don't allow start date to be after end date
        if (targetDate <= new Date(draggedTask.dueDate)) {
          updates.startDate = targetDate;
        }
      } else if (dragType === 'end') {
        // Don't allow end date to be before start date
        if (targetDate >= new Date(draggedTask.startDate)) {
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
        onTaskUpdate(draggedTask.id, updates);
      }
    }
    
    cleanupDrag();
  };
  
  // Clean up drag state and event listeners
  const cleanupDrag = () => {
    setIsDragging(false);
    setDraggedTask(null);
    setDragType(null);
    
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

  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border p-4 w-full transition-all",
      isDragging && "bg-blue-50 border-blue-200"
    )}>
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
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-bold">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'month' ? "default" : "ghost"}
              size="sm"
              className={`rounded-none ${viewMode === 'month' ? '' : 'text-gray-500'}`}
              onClick={() => handleViewModeChange('month')}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? "default" : "ghost"}
              size="sm"
              className={`rounded-none ${viewMode === 'week' ? '' : 'text-gray-500'}`}
              onClick={() => handleViewModeChange('week')}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'day' ? "default" : "ghost"}
              size="sm"
              className={`rounded-none ${viewMode === 'day' ? '' : 'text-gray-500'}`}
              onClick={() => handleViewModeChange('day')}
            >
              Day
            </Button>
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Show Completed</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={taskFilter.showCompleted}
                    onChange={(e) => toggleTaskFilter('showCompleted', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Overdue Only</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={taskFilter.overdueOnly}
                    onChange={(e) => toggleTaskFilter('overdueOnly', e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Priority</span>
                  </div>
                  <select
                    value={taskFilter.priorityFilter}
                    onChange={(e) => toggleTaskFilter('priorityFilter', e.target.value)}
                    className="w-full text-sm p-1 border rounded"
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

          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid - Only show for month view */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-7 border-t border-l" ref={calendarGridRef}>
          {/* Day Headers */}
          {DAYS.map((day, index) => (
            <div
              key={index}
              className="text-center text-xs font-medium text-gray-500 py-2 border-r border-b bg-gray-50"
            >
              {day.slice(0, 3)}
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
                  "min-h-[100px] p-1 border-r border-b relative",
                  isCurrentMonth ? "bg-white" : "bg-gray-50/50",
                  isToday(date) ? "bg-blue-50/30" : "",
                  isSelected(date) ? "ring-1 ring-inset ring-blue-500" : "",
                  isWeekend && "bg-gray-50/30",
                  "transition-all hover:bg-gray-50/70"
                )}
                onClick={() => handleDateClick(date)}
              >
                <div className="flex justify-between items-start p-1">
                  <span
                    className={cn(
                      "text-xs font-medium rounded-full h-6 w-6 flex items-center justify-center",
                      isToday(date) ? "bg-blue-500 text-white" : "",
                      !isCurrentMonth ? "text-gray-400" : ""
                    )}
                  >
                    {date.getDate()}
                  </span>

                  {isCurrentMonth && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTask(date);
                      }}
                    >
                      <Plus className="h-3 w-3" />
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
                          return "bg-slate-200 hover:bg-slate-300 border-slate-300";
                        case "In Progress":
                          return "bg-blue-200 hover:bg-blue-300 border-blue-300";
                        case "Review":
                          return "bg-amber-200 hover:bg-amber-300 border-amber-300";
                        case "Completed":
                          return "bg-green-200 hover:bg-green-300 border-green-300";
                        default:
                          return "bg-gray-200 hover:bg-gray-300 border-gray-300";
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
                          "absolute h-5 rounded-sm border text-xs flex items-center overflow-hidden cursor-pointer transition-all",
                          getStatusColor(),
                          isMultiDayTask ? "z-10" : "mx-1"
                        )}
                        style={{
                          top: `${(taskIndex * 24) + 30}px`,
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
                        <div className="flex items-center h-full w-full px-1">
                          {/* Assignee avatar */}
                          <div className="flex-shrink-0 mr-1">
                            <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold", getAvatarColor())}>
                              {getAssigneeInitials()}
                            </div>
                          </div>

                          {/* Task name */}
                          <span className="truncate flex-grow">{task.name}</span>

                          {/* Edit button - only show on hover */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTask(task);
                            }}
                          >
                            <Edit className="h-2 w-2" />
                          </Button>
                        </div>

                        {/* Drag handles */}
                        {isMultiDayTask && (
                          <>
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-400 hover:w-2"
                              onMouseDown={(e) => handleTaskMouseDown(e, task, 'start')}
                            />
                            <div
                              className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-400 hover:w-2"
                              onMouseDown={(e) => handleTaskMouseDown(e, task, 'end')}
                            />
                          </>
                        )}
                      </div>
                    );
                  })}

                  {dayTasks.length > 3 && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs w-full h-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        +{dayTasks.length - 3} more
                      </Button>
                    </div>
                  )}

                  {/* Indicator for overdue tasks */}
                  {hasOverdueTasks && (
                    <div className="absolute top-1 right-1">
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'week' && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Week View</h3>
          <p className="text-gray-500">Week view is coming soon</p>
        </div>
      )}

      {viewMode === 'day' && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">
            {selectedDate ? selectedDate.toDateString() : currentDate.toDateString()}
          </h3>
          <p className="text-gray-500">Day view is coming soon</p>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
