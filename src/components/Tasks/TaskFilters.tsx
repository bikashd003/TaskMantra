import React from "react";
import { Filter, Search, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskFilterState, TaskSortOption, sortOptions, statusOptions, priorityOptions } from "./types";

interface TaskFiltersProps {
  filters: TaskFilterState;
  onFilterChange: (filters: Partial<TaskFilterState>) => void;
  onSortChange: (sortOption: TaskSortOption) => void;
  currentSort: TaskSortOption;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFilterChange,
  onSortChange,
  currentSort,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-10"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onFilterChange({ status: "all" })}>
            All
          </DropdownMenuItem>
          {statusOptions.map((status) => (
            <DropdownMenuItem 
              key={status.value} 
              onClick={() => onFilterChange({ status: status.value })}
              className="flex items-center gap-2"
            >
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              {status.label}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onFilterChange({ priority: "all" })}>
            All
          </DropdownMenuItem>
          {priorityOptions.map((priority) => (
            <DropdownMenuItem 
              key={priority.value} 
              onClick={() => onFilterChange({ priority: priority.value })}
            >
              {priority.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto gap-2">
            <SortAsc className="h-4 w-4" /> Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {sortOptions.map((option) => (
            <DropdownMenuItem 
              key={option.label}
              onClick={() => onSortChange(option)}
              className={currentSort.label === option.label ? "bg-muted" : ""}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TaskFilters;
