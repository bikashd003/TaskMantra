import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
  tasks: Task[];
  onDateClick: (date: Date) => void;
  onAddTask: (date: Date) => void;
  onTaskClick: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  isWeekend,
  tasks,
  onDateClick,
  onAddTask,
  onTaskClick,
  onEditTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: date.toISOString(),
    data: {
      date,
    },
  });

  // Helper function to determine if a task starts on this date
  const isTaskStartDate = (task: Task) => {
    const taskStartDate = new Date(task.startDate);
    return taskStartDate.toDateString() === date.toDateString();
  };

  // Helper function to calculate task duration
  const getTaskDuration = (task: Task) => {
    const taskStartDate = new Date(task.startDate);
    const taskEndDate = new Date(task.dueDate);
    return Math.ceil((taskEndDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  };

  // Helper function to determine if a task spans multiple days
  const isMultiDayTask = (task: Task) => {
    const taskStartDate = new Date(task.startDate);
    const taskEndDate = new Date(task.dueDate);
    return taskStartDate.toDateString() !== taskEndDate.toDateString();
  };

  // Check if any tasks are overdue
  const hasOverdueTasks = tasks.some(task => new Date(task.dueDate) < new Date());

  return (
    <div
      ref={setNodeRef}
      id={date.toISOString()}
      className={cn(
        "min-h-[120px] p-2 relative group calendar-day",
        "border-r border-slate-100",
        "border-b border-slate-100",
        isCurrentMonth ? "bg-white" : "bg-slate-50/30",
        isToday ? "bg-blue-50/40" : "",
        isSelected ? "ring-2 ring-inset ring-blue-400" : "",
        isWeekend && isCurrentMonth && "bg-slate-50/50",
        "transition-all duration-200 hover:bg-blue-50/20",
        isOver && "bg-blue-100/50"
      )}
      onClick={() => onDateClick(date)}
    >
      <div className="flex justify-between items-start">
        <span
          className={cn(
            "font-medium rounded-full h-7 w-7 flex items-center justify-center transition-all duration-200",
            isToday ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md" : "",
            isSelected && !isToday ? "bg-blue-100 text-blue-700" : "",
            !isCurrentMonth ? "text-slate-400 text-xs" : "text-slate-700",
            isCurrentMonth && !isToday && !isSelected ? "group-hover:bg-blue-100 group-hover:text-blue-700" : ""
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
              onAddTask(date);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Tasks for this day */}
      <div className="mt-1 space-y-1 relative">
        {tasks.map((task, taskIndex) => (
          <TaskItem
            key={task.id}
            task={task}
            isMultiDayTask={isMultiDayTask(task)}
            isStartDate={isTaskStartDate(task)}
            taskDuration={getTaskDuration(task)}
            taskIndex={taskIndex}
            onTaskClick={onTaskClick}
            onEditTask={onEditTask}
          />
        ))}

        {tasks.length > 3 && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs w-full h-6 bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-800 rounded-md transition-all duration-200 shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              +{tasks.length - 3} more
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
};

export default CalendarDay;
