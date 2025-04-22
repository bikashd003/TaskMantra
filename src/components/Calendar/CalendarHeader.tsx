import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Filter, Plus, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useCalendarStore } from '@/stores/calendarStore';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CreateTaskModal from '../Tasks/CreateTaskModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '@/services/Task.service';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CalendarHeader = () => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { dateRange, setDateRange, setSelectedDate, filters, setFilter, resetFilters, tasks } =
    useCalendarStore();

  // Count tasks by priority
  const priorityCounts = tasks.reduce(
    (counts, task) => {
      if (task.priority === 'High') counts.high++;
      else if (task.priority === 'Medium') counts.medium++;
      else if (task.priority === 'Low') counts.low++;
      return counts;
    },
    { high: 0, medium: 0, low: 0 }
  );

  const handleCreateTask = useMutation({
    mutationFn: (taskData: any) => {
      setIsLoading(true);
      return TaskService.createTask(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-tasks'] });
      setIsLoading(false);
      toast.success('Task created successfully');
    },
  });

  return (
    <header className="flex flex-wrap justify-between items-center p-6 bg-white/50 backdrop-blur-sm shadow-sm rounded-b-xl mb-6 border border-gray-100">
      <div className="flex flex-col mb-4 md:mb-0">
        <h2 className="text-2xl font-semibold tracking-tight text-black">Project Timeline</h2>
        <div className="flex gap-3 text-sm mt-2">
          <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-red-700 font-medium">{priorityCounts.high} High</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-amber-700 font-medium">{priorityCounts.medium} Medium</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-green-700 font-medium">{priorityCounts.low} Low</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'min-w-[240px] justify-start text-left font-medium',
                !dateRange && 'text-muted-foreground',
                dateRange && 'border-purple-200 bg-purple-50/50 text-purple-700'
              )}
            >
              <CalendarIcon className="w-4 h-4 mr-2 text-purple-500" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Select dates</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={range => range && setDateRange(range)}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Button
          onClick={() => {
            setSelectedDate(new Date());
            setIsTaskModalOpen(true);
          }}
          className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Task
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'transition-all duration-200',
                Object.values(filters).some(f => f !== 'all' && f !== '')
                  ? 'border-purple-200 bg-purple-50/50 text-purple-700'
                  : 'text-muted-foreground'
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {Object.values(filters).some(f => f !== 'all' && f !== '') && (
                <Badge variant="secondary" className="ml-2">
                  {Object.values(filters).filter(f => f !== 'all' && f !== '').length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[320px] p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" /> Reset
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    className="pl-9"
                    value={filters.searchQuery}
                    onChange={e => setFilter('searchQuery', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={value => setFilter('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={filters.priority}
                  onValueChange={value => setFilter('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {Object.values(filters).some(f => f !== 'all' && f !== '') && (
                <div className="pt-3 border-t">
                  <div className="flex flex-wrap gap-2">
                    {filters.status !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setFilter('status', 'all')}
                      >
                        Status: {filters.status} <X className="h-3 w-3 ml-1 inline" />
                      </Badge>
                    )}
                    {filters.priority !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setFilter('priority', 'all')}
                      >
                        Priority: {filters.priority} <X className="h-3 w-3 ml-1 inline" />
                      </Badge>
                    )}
                    {filters.searchQuery && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setFilter('searchQuery', '')}
                      >
                        Search:{' '}
                        {filters.searchQuery.length > 10
                          ? `${filters.searchQuery.substring(0, 10)}...`
                          : filters.searchQuery}
                        <X className="h-3 w-3 ml-1 inline" />
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreateTask={handleCreateTask.mutate}
        isLoading={isLoading}
      />
    </header>
  );
};

export default CalendarHeader;
