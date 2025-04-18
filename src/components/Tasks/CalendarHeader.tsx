import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import PrintCalendarView from './PrintCalendarView';
import TaskStatistics from './TaskStatistics';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Views } from 'react-big-calendar';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Task } from './types';
import React from 'react';

// Extend the props but make it a separate interface to avoid type conflicts
interface CalendarHeaderProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  view: string;
  setView: (view: string) => void;
  taskFilter: any;
  toggleTaskFilter: (filterKey: any, value: any) => void;
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  handleViewChange: (view: string) => void;
  tasks: Task[];
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  view,
  setView,
  taskFilter,
  toggleTaskFilter,
  goToToday,
  goToPrevious,
  goToNext,
  handleViewChange,
  tasks,
  // We're using our custom implementation, so we don't need the ToolbarProps
}) => {
  return (
    <div className="flex flex-col space-y-4 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md">
            <CalendarIcon className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'gap-1.5 bg-white/80 border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm',
                  'flex items-center justify-center'
                )}
              >
                <CalendarIcon className="h-4 w-4 text-blue-500" />
                <span className="hidden md:inline">
                  {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Pick a date'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={selectedDate || undefined}
                onSelect={(date: Date | undefined) => {
                  if (date) {
                    setSelectedDate(date);
                    setCurrentDate(date);
                    setView(Views.DAY);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100/80 rounded-xl overflow-hidden p-1 shadow-inner">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-lg transition-all duration-200',
                view === 'month'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-blue-500'
              )}
              onClick={() => handleViewChange(Views.MONTH)}
            >
              Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-lg transition-all duration-200',
                view === 'week'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-blue-500'
              )}
              onClick={() => handleViewChange(Views.WEEK)}
            >
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-lg transition-all duration-200',
                view === 'day'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-blue-500'
              )}
              onClick={() => handleViewChange(Views.DAY)}
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
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl border-slate-200 shadow-lg bg-white/95 backdrop-blur-sm"
            >
              <div className="p-3 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Show Completed</span>
                  <div
                    className="relative inline-flex h-5 w-10 items-center rounded-full bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer"
                    onClick={() => toggleTaskFilter('showCompleted', !taskFilter.showCompleted)}
                  >
                    <span
                      className={cn(
                        'absolute mx-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                        taskFilter.showCompleted ? 'translate-x-5 shadow-md' : 'translate-x-0'
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Priority</span>
                  <select
                    value={taskFilter.priorityFilter}
                    onChange={e => toggleTaskFilter('priorityFilter', e.target.value)}
                    className="w-full text-sm p-2 border border-slate-200 rounded-lg bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="all">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <DropdownMenuSeparator />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overdue Only</span>
                  <div
                    className="relative inline-flex h-5 w-10 items-center rounded-full bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer"
                    onClick={() => toggleTaskFilter('overdueOnly', !taskFilter.overdueOnly)}
                  >
                    <span
                      className={cn(
                        'absolute mx-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                        taskFilter.overdueOnly ? 'translate-x-5 shadow-md' : 'translate-x-0'
                      )}
                    />
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="bg-white/80 border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm font-medium"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="bg-white/80 border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="bg-white/80 border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm h-8 w-8"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <TaskStatistics tasks={tasks} />
            <PrintCalendarView tasks={tasks} currentDate={currentDate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
