import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Filter, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCalendarStore } from "@/stores/calendarStore";
import TaskDetailModal from "./TaskDetailModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const CalendarHeader = () => {
  const dateRange = useCalendarStore((state) => state.dateRange);
  const setDateRange = useCalendarStore((state) => state.setDateRange);
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);
  const filters = useCalendarStore((state) => state.filters);
  const setFilter = useCalendarStore((state) => state.setFilter);
  const resetFilters = useCalendarStore((state) => state.resetFilters);
  const tasks = useCalendarStore((state) => state.tasks);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  return (
    <header className="flex flex-wrap justify-between items-center p-4 border-b bg-white shadow-sm rounded-lg">
      {/* Title and priorities */}
      <div className="flex flex-col mb-4 md:mb-0">
        <h2 className="text-xl font-semibold text-gray-800">Project Timeline</h2>
        <div className="flex gap-4 text-sm text-gray-600 mt-1">
          <p className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> {priorityCounts.high} High
          </p>
          <p className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span> {priorityCounts.medium} Medium
          </p>
          <p className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> {priorityCounts.low} Low
          </p>
        </div>
      </div>

      {/* Date picker and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Filter by date */}
        <div className="flex items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "w-full md:w-[300px] justify-start text-left font-normal border-gray-300",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="w-5 h-5 mr-2 text-gray-500" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span className="text-gray-500">Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => range && setDateRange(range)}
                numberOfMonths={2}
                className="p-2 mr-4"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Create Task Button */}
        <div className="flex items-center">
          <Button
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              setSelectedDate(new Date());
              setIsTaskModalOpen(true);
            }}
          >
            <Plus className="w-5 h-5 mr-2" /> Create Task
          </Button>
        </div>

        {/* Filter popover */}
        <div className="flex items-center ml-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex items-center",
                  (filters.status !== 'all' || filters.priority !== 'all' || filters.assignedTo !== '' || filters.searchQuery !== '') &&
                  "border-blue-500 bg-blue-50 text-blue-600"
                )}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filter
                {(filters.status !== 'all' || filters.priority !== 'all' || filters.assignedTo !== '' || filters.searchQuery !== '') && (
                  <Badge variant="secondary" className="ml-2 bg-blue-100">
                    {(filters.status !== 'all' ? 1 : 0) +
                      (filters.priority !== 'all' ? 1 : 0) +
                      (filters.assignedTo !== '' ? 1 : 0) +
                      (filters.searchQuery !== '' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Filter Tasks</h4>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      className="pl-8"
                      value={filters.searchQuery}
                      onChange={(e) => setFilter('searchQuery', e.target.value)}
                    />
                    {filters.searchQuery && (
                      <X
                        className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => setFilter('searchQuery', '')}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilter('status', value)}
                  >
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
                    onValueChange={(value) => setFilter('priority', value)}
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

                <Separator />

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      resetFilters();
                      setIsFilterOpen(false);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        isCreating={true}
      />
    </header>
  );
};

export default CalendarHeader;
