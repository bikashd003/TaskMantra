import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Task } from '../types';
import CalendarDay from './CalendarDay';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  tasksByDate: Record<string, Task[]>;
  onDateClick: (date: Date) => void;
  onAddTask: (date: Date) => void;
  onTaskClick: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

// Days of the week
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  selectedDate,
  tasksByDate,
  onDateClick,
  onAddTask,
  onTaskClick,
  onEditTask,
}) => {
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

  // Check if a date is a weekend
  const isWeekend = (date: Date) => {
    return date.getDay() === 0 || date.getDay() === 6;
  };

  return (
    <div className="grid grid-cols-7 rounded-xl overflow-hidden shadow-sm border border-slate-200/70 bg-white/50">
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

        return (
          <CalendarDay
            key={index}
            date={date}
            isCurrentMonth={isCurrentMonth}
            isToday={isToday(date)}
            isSelected={isSelected(date)}
            isWeekend={isWeekend(date)}
            tasks={dayTasks}
            onDateClick={onDateClick}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
            onEditTask={onEditTask}
          />
        );
      })}
    </div>
  );
};

export default CalendarGrid;
