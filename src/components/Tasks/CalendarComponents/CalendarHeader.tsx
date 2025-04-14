import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  CheckCircle2,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { TaskPriority } from '../types';

export type CalendarViewMode = 'month' | 'week' | 'day';

export type TaskFilter = {
  showCompleted: boolean;
  priorityFilter: 'all' | TaskPriority;
  overdueOnly: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  taskFilter: TaskFilter;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onFilterChange: (filterKey: keyof TaskFilter, value: any) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewMode,
  taskFilter,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onViewModeChange,
  onFilterChange,
}) => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  return (
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
            onClick={() => onViewModeChange('month')}
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
            onClick={() => onViewModeChange('week')}
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
            onClick={() => onViewModeChange('day')}
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
                  onClick={() => onFilterChange('showCompleted', !taskFilter.showCompleted)}
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
                  onClick={() => onFilterChange('overdueOnly', !taskFilter.overdueOnly)}
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
                  onChange={(e) => onFilterChange('priorityFilter', e.target.value)}
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
          onClick={onToday}
          className="bg-white/80 border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm font-medium"
        >
          Today
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPreviousMonth}
            className="bg-white/80 border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNextMonth}
            className="bg-white/80 border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm h-8 w-8"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
