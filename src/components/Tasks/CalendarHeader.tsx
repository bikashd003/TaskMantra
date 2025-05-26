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
    <div className="flex flex-col space-y-4 mb-4 theme-surface">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="theme-button-primary p-2 rounded-lg theme-shadow-md glow-on-hover theme-transition">
            <CalendarIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold theme-text-primary">
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
                  'gap-1.5 theme-button-secondary theme-border hover-reveal theme-transition theme-shadow-sm',
                  'flex items-center justify-center'
                )}
              >
                <CalendarIcon className="h-4 w-4 text-primary" />
                <span className="hidden md:inline theme-text-primary">
                  {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Pick a date'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 theme-surface-elevated theme-border theme-shadow-lg"
              align="center"
            >
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
          <div className="flex theme-surface-elevated rounded-xl overflow-hidden p-1 theme-shadow-inner">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-lg theme-transition',
                view === 'month'
                  ? 'theme-button-primary theme-shadow-sm'
                  : 'theme-text-secondary hover:theme-text-primary theme-button-ghost'
              )}
              onClick={() => handleViewChange(Views.MONTH)}
            >
              Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-lg theme-transition',
                view === 'week'
                  ? 'theme-button-primary theme-shadow-sm'
                  : 'theme-text-secondary hover:theme-text-primary theme-button-ghost'
              )}
              onClick={() => handleViewChange(Views.WEEK)}
            >
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-lg theme-transition',
                view === 'day'
                  ? 'theme-button-primary theme-shadow-sm'
                  : 'theme-text-secondary hover:theme-text-primary theme-button-ghost'
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
                className="gap-1 theme-button-secondary theme-border hover-reveal theme-transition theme-shadow-sm"
              >
                <Filter className="h-4 w-4 text-primary" /> Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-xl theme-surface-elevated theme-border theme-shadow-lg glass"
            >
              <div className="p-3 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium theme-text-primary">Show Completed</span>
                  <div
                    className="relative inline-flex h-5 w-10 items-center rounded-full theme-surface theme-transition theme-focus cursor-pointer"
                    onClick={() => toggleTaskFilter('showCompleted', !taskFilter.showCompleted)}
                  >
                    <span
                      className={cn(
                        'absolute mx-0.5 h-4 w-4 rounded-full theme-surface-elevated theme-transition theme-shadow-sm',
                        taskFilter.showCompleted ? 'translate-x-5 theme-shadow-md' : 'translate-x-0'
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium theme-text-primary">Priority</span>
                  <select
                    value={taskFilter.priorityFilter}
                    onChange={e => toggleTaskFilter('priorityFilter', e.target.value)}
                    className="w-full text-sm p-2 theme-input theme-border rounded-lg theme-focus theme-transition"
                  >
                    <option value="all">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <DropdownMenuSeparator className="theme-border" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium theme-text-primary">Overdue Only</span>
                  <div
                    className="relative inline-flex h-5 w-10 items-center rounded-full theme-surface theme-transition theme-focus cursor-pointer"
                    onClick={() => toggleTaskFilter('overdueOnly', !taskFilter.overdueOnly)}
                  >
                    <span
                      className={cn(
                        'absolute mx-0.5 h-4 w-4 rounded-full theme-surface-elevated theme-transition theme-shadow-sm',
                        taskFilter.overdueOnly ? 'translate-x-5 theme-shadow-md' : 'translate-x-0'
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
              className="theme-button-secondary theme-border hover-reveal theme-transition theme-shadow-sm font-medium"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="theme-button-secondary theme-border hover-reveal theme-transition theme-shadow-sm h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4 theme-text-secondary" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="theme-button-secondary theme-border hover-reveal theme-transition theme-shadow-sm h-8 w-8"
            >
              <ChevronRight className="h-4 w-4 theme-text-secondary" />
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
