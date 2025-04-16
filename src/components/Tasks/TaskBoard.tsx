import React, { useState, useEffect } from "react";
import { Task, TaskPriority, TaskStatus, TaskFilterState, TaskSortOption, sortOptions } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, List, LayoutGrid, Calendar, Network } from "lucide-react";
import BatchOperations from "./BatchOperations";
import TaskList from "./TaskList";
import KanbanBoard from "./KanbanBoard";
import BigCalendarView from "./BigCalendarView";
import TaskFilters from "./TaskFilters";
import TaskDependencyGraph from "./TaskDependencyGraph";

import { useMutation, useQuery } from "@tanstack/react-query";
import { KanbanSettingsService } from "@/services/KanbanSettings.service";

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onAddTask?: (task: Partial<Task>) => void;
  renderPriorityBadge: (priority: TaskPriority) => React.ReactNode;
  isLoading?: boolean;
  onCreateTask?: () => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onStatusChange,
  onDelete,
  onAddTask,
  renderPriorityBadge,
  isLoading,
  onCreateTask,
  onUpdateTask,
}) => {
  // View state
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar' | 'dependencies'>('list');

  // Filter and sort state
  const [filters, setFilters] = useState<TaskFilterState>({
    searchQuery: "",
    status: "all",
    priority: "all"
  });
  const [currentSort, setCurrentSort] = useState<TaskSortOption>(sortOptions[0]);

  // Debounce search query to prevent excessive API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

  // Fetch user preferences
  const { data: kanbanSettings } = useQuery<any>({
    queryKey: ['kanban-settings'],
    queryFn: () => KanbanSettingsService.getSettings(),
  });

  // Set view mode from settings when they load
  useEffect(() => {
    if (kanbanSettings?.defaultView) {
      setViewMode(kanbanSettings.defaultView as 'list' | 'kanban' | 'calendar');
    }
  }, [kanbanSettings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation<any, Error, any>({
    mutationFn: (settings: any) => KanbanSettingsService.updateSettings(settings),
  });

  // Update debounced search query after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(filters.searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  // Filter tasks based on current filters
  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      // Filter by search query
      if (debouncedSearchQuery &&
          !task.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) &&
          !(task.description || "").toLowerCase().includes(debouncedSearchQuery.toLowerCase())) {
        return false;
      }

      // Filter by status
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }

      // Filter by priority
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      return true;
    });
  }, [tasks, debouncedSearchQuery, filters.status, filters.priority]);

  // Group tasks by status for Kanban view
  const groupedTasks = React.useMemo(() => {
    const grouped: {
      todo: Task[];
      inProgress: Task[];
      review: Task[];
      completed: Task[];
      [key: string]: Task[];
    } = {
      todo: [],
      inProgress: [],
      review: [],
      completed: [],
    };

    filteredTasks.forEach(task => {
      switch (task.status) {
        case "To Do":
          grouped.todo.push(task);
          break;
        case "In Progress":
          grouped.inProgress.push(task);
          break;
        case "Review":
          grouped.review.push(task);
          break;
        case "Completed":
          grouped.completed.push(task);
          break;
        default:
          // Handle custom statuses
          const key = String(task.status).toLowerCase().replace(/\s+/g, "");
          if (!grouped[key]) {
            grouped[key] = [];
          }
          grouped[key].push(task);
      }
    });

    return grouped;
  }, [filteredTasks]);

  // Handle filter change
  const handleFilterChange = (newFilters: Partial<TaskFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle sort change
  const handleSortChange = (sortOption: TaskSortOption) => {
    setCurrentSort(sortOption);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'list' | 'kanban' | 'calendar' | 'dependencies') => {
    setViewMode(mode);
    updateSettingsMutation.mutate({ defaultView: mode });
  };

  // Handle task update
  const handleTaskUpdate = (updatedTask: Task) => {
    if (onUpdateTask) {
      // onUpdateTask(updatedTask);
    }
  };

  // Handle batch task update
  const handleBatchTaskUpdate = (updatedTasks: Task[]) => {
    if (onUpdateTask) {
      // Update each task individually
      updatedTasks.forEach(task => {
        // onUpdateTask(task);
      });
    }
  };

  // Handle batch task delete
  const handleBatchTaskDelete = (taskIds: string[]) => {
    if (onDelete) {
      // Delete each task individually
      taskIds.forEach(taskId => {
        onDelete(taskId);
      });
    }
  };

  // Handle add task from calendar
  const handleAddTaskFromCalendar = (date: Date) => {
    if (onAddTask) {
      const newTask: Partial<Task> = {
        name: "",
        status: "To Do",
        priority: "Medium",
        dueDate: date,
        subtasks: [],
        assignedTo: [],
        comments: [],
        dependencies: [],
        tags: [],
        completed: false,
      };
      onAddTask(newTask);
    }
  };
  return (
    <div className="flex flex-col space-y-4 h-full">
      {/* Header with New Task Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Task Board</h2>
        <Button
          onClick={onCreateTask}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col space-y-4">
        <TaskFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          currentSort={currentSort}
        />

        {/* Batch Operations */}
        {viewMode === 'list' && (
          <BatchOperations
            tasks={filteredTasks}
            onUpdateTasks={handleBatchTaskUpdate}
            onDeleteTasks={handleBatchTaskDelete}
          />
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex border rounded-md overflow-hidden self-start">
        <Button
          variant={viewMode === 'list' ? "default" : "ghost"}
          size="sm"
          className={`rounded-none ${viewMode === 'list' ? '' : 'text-gray-500'}`}
          onClick={() => handleViewModeChange('list')}
        >
          <List className="h-4 w-4 mr-1" /> List
        </Button>
        <Button
          variant={viewMode === 'kanban' ? "default" : "ghost"}
          size="sm"
          className={`rounded-none ${viewMode === 'kanban' ? '' : 'text-gray-500'}`}
          onClick={() => handleViewModeChange('kanban')}
        >
          <LayoutGrid className="h-4 w-4 mr-1" /> Kanban
        </Button>
        <Button
          variant={viewMode === 'calendar' ? "default" : "ghost"}
          size="sm"
          className={`rounded-none ${viewMode === 'calendar' ? '' : 'text-gray-500'}`}
          onClick={() => handleViewModeChange('calendar')}
        >
          <Calendar className="h-4 w-4 mr-1" /> Calendar
        </Button>
        <Button
          variant={viewMode === 'dependencies' ? "default" : "ghost"}
          size="sm"
          className={`rounded-none ${viewMode === 'dependencies' ? '' : 'text-gray-500'}`}
          onClick={() => handleViewModeChange('dependencies')}
        >
          <Network className="h-4 w-4 mr-1" /> Dependencies
        </Button>
      </div>

      {/* Main Content Area */}
      <ScrollArea className="h-[calc(100vh-12rem)]">
        {viewMode === 'list' && (
          <TaskList
            tasks={filteredTasks}
            searchQuery={filters.searchQuery}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            renderPriorityBadge={renderPriorityBadge as any}
            onCreateTask={onCreateTask || (() => {})}
            isLoading={isLoading}
          />
        )}

        {viewMode === 'kanban' && (
          <KanbanBoard
            tasks={groupedTasks}
            allTasks={filteredTasks}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            onAddTask={onAddTask}
            renderPriorityBadge={renderPriorityBadge}
            isLoading={isLoading}
            onCreateTask={onCreateTask}
            viewMode="kanban"

          />
        )}

        {viewMode === 'calendar' && (
          <BigCalendarView
            tasks={filteredTasks}
            onTaskClick={(taskId: string) => {
              const task = filteredTasks.find(t => t.id === taskId);
              if (task && onCreateTask) {
              }
            }}
            renderPriorityBadge={renderPriorityBadge}
            onAddTask={handleAddTaskFromCalendar}
            onTaskUpdate={onUpdateTask}
          />
        )}

        {viewMode === 'dependencies' && (
          <TaskDependencyGraph
            tasks={filteredTasks}
            onTaskClick={(taskId: string) => {
              const task = filteredTasks.find(t => t.id === taskId);
              if (task && onCreateTask) {
                // Open task details
              }
            }}
          />
        )}
      </ScrollArea>
    </div>
  );
};

export default TaskBoard;
