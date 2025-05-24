import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskFilterState, TaskSortOption, sortOptions } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, List, LayoutGrid, Calendar, Network, Settings } from 'lucide-react';
import TaskList from './TaskList';
import KanbanBoard from './KanbanBoard';
import BigCalendarView from './BigCalendarView';
import TaskFilters from './TaskFilters';
import TaskDependencyGraph from './TaskDependencyGraph';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMutation, useQuery } from '@tanstack/react-query';
import { KanbanSettingsService } from '@/services/KanbanSettings.service';
import { TaskService } from '@/services/Task.service';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { KanbanSkeleton } from '../IndividualProject/KanbanSkeleton';

interface TaskBoardProps {
  tasks: Task[];
  onAddTask?: (task: Partial<Task>) => void;
  renderPriorityBadge: (priority: TaskPriority) => React.ReactNode;
  isLoading?: boolean;
  onCreateTask?: () => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onTaskClick?: (taskId: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onAddTask,
  renderPriorityBadge,
  isLoading,
  onCreateTask,
  onUpdateTask,
  onTaskClick,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar' | 'dependencies'>('list');

  // Kanban settings
  const [columnWidth, setColumnWidth] = useState(280);
  const [compactView, setCompactView] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [filters, setFilters] = useState<TaskFilterState>({
    searchQuery: '',
    status: 'all',
    priority: 'all',
  });
  const [currentSort, setCurrentSort] = useState<TaskSortOption>(sortOptions[0]);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');

  const { data: kanbanSettings } = useQuery<any>({
    queryKey: ['kanban-settings'],
    queryFn: () => KanbanSettingsService.getSettings(),
  });

  useEffect(() => {
    if (kanbanSettings) {
      if (kanbanSettings.defaultView) {
        setViewMode(kanbanSettings.defaultView as 'list' | 'kanban' | 'calendar' | 'dependencies');
      }
      if (kanbanSettings.columnWidth) {
        setColumnWidth(kanbanSettings.columnWidth);
      }
      if (kanbanSettings.compactView !== undefined) {
        setCompactView(kanbanSettings.compactView);
      }
    }
  }, [kanbanSettings]);

  const updateSettingsMutation = useMutation<any, Error, any>({
    mutationFn: (settings: any) => KanbanSettingsService.updateSettings(settings),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(filters.searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  const { data: filteredTasks = [] } = useQuery({
    queryKey: [
      'filtered-tasks',
      debouncedSearchQuery,
      filters.status,
      filters.priority,
      currentSort,
      tasks.length,
    ],
    queryFn: async () => {
      if (isLoading) return [];

      if (tasks.length > 0) {
        return tasks.filter(task => {
          if (
            debouncedSearchQuery &&
            !task.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) &&
            !(task.description || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase())
          ) {
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
      }
      // Otherwise, fetch filtered tasks from API
      else {
        const apiTasks = await TaskService.getAllTasks({
          searchQuery: debouncedSearchQuery,
          status: filters.status !== 'all' ? filters.status : undefined,
          priority: filters.priority !== 'all' ? filters.priority : undefined,
          sortField: currentSort.field as string,
          sortDirection: currentSort.direction,
        });
        return apiTasks;
      }
    },
    enabled: !isLoading,
  });

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

  // Handle column width change
  const handleColumnWidthChange = (value: number[]) => {
    const newWidth = value[0];
    setColumnWidth(newWidth);
    updateSettingsMutation.mutate({ columnWidth: newWidth });
  };

  // Handle compact view toggle
  const handleCompactViewToggle = (checked: boolean) => {
    setCompactView(checked);
    updateSettingsMutation.mutate({ compactView: checked });
  };

  // Handle add task from calendar
  const handleAddTaskFromCalendar = (date: Date) => {
    if (onAddTask) {
      const newTask: Partial<Task> = {
        name: '',
        status: 'To Do',
        priority: 'Medium',
        dueDate: date,
        subtasks: [],
        assignedTo: [],
        comments: [],
        dependencies: [],
        completed: false,
      };
      onAddTask(newTask);
    }
  };

  // Determine if we should show loading state
  const showLoading = isLoading;

  return (
    <div className="flex flex-col h-full w-full theme-surface">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold theme-text-primary">Task Board</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onCreateTask}
                size="sm"
                className="gap-2 theme-button-primary hover-reveal theme-transition btn-primary theme-shadow-sm"
              >
                <Plus className="h-4 w-4" /> New Task
              </Button>
            </TooltipTrigger>
            <TooltipContent className="theme-surface-elevated">
              <p className="theme-text-primary">Create a new task</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* View Mode Toggle and Filters Container */}
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between w-full">
        {/* View Mode Toggle */}
        <div className="flex items-center theme-border rounded-md overflow-hidden theme-transition">
          <TooltipProvider>
            {[
              { mode: 'list', icon: List, label: 'List View' },
              { mode: 'kanban', icon: LayoutGrid, label: 'Kanban Board' },
              { mode: 'calendar', icon: Calendar, label: 'Calendar View' },
              { mode: 'dependencies', icon: Network, label: 'Dependencies Graph' },
            ].map(item => (
              <Tooltip key={item.mode}>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === item.mode ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-none theme-transition ${viewMode === item.mode ? 'theme-button-primary border-b-2 border-primary' : 'theme-button-ghost theme-text-secondary hover:theme-text-primary'}`}
                    onClick={() => handleViewModeChange(item.mode as any)}
                  >
                    <item.icon
                      className={`h-4 w-4 mr-1 ${viewMode === item.mode ? 'text-primary-foreground' : ''}`}
                    />
                    {item.mode.charAt(0).toUpperCase() + item.mode.slice(1)}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="theme-surface-elevated">
                  <p className="theme-text-primary">{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        {/* Search and Filters */}
        <div className="flex-grow w-full md:w-auto mb-2">
          <TaskFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            currentSort={currentSort}
          />
        </div>
        {viewMode === 'kanban' && (
          <div className="flex space-x-2">
            <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="theme-button-secondary theme-border theme-transition"
                >
                  <Settings className="h-4 w-4 mr-1" /> Settings
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 theme-surface-elevated theme-border theme-shadow-lg">
                <div className="space-y-4">
                  <h4 className="font-medium theme-text-primary">Board Settings</h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="column-width" className="text-sm theme-text-primary">
                        Column Width
                      </Label>
                      <span className="text-xs theme-text-secondary">{columnWidth}px</span>
                    </div>
                    <Slider
                      id="column-width"
                      min={220}
                      max={400}
                      step={10}
                      value={[columnWidth]}
                      onValueChange={handleColumnWidthChange}
                      className="theme-transition"
                    />
                  </div>

                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-view" className="text-sm theme-text-primary">
                        Compact View
                      </Label>
                      <p className="text-xs theme-text-secondary">Show less details on cards</p>
                    </div>
                    <Switch
                      id="compact-view"
                      checked={compactView}
                      onCheckedChange={handleCompactViewToggle}
                      className="theme-transition"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-[calc(100vh-20rem)] theme-surface">
        {viewMode === 'list' && (
          <ScrollArea className="h-full scrollbar-custom scrollbar-dark">
            <TaskList
              tasks={filteredTasks}
              renderPriorityBadge={renderPriorityBadge as any}
              isLoading={false}
              onTaskClick={onTaskClick}
            />
          </ScrollArea>
        )}
        {viewMode === 'kanban' && (
          <>
            {showLoading ? (
              <KanbanSkeleton />
            ) : (
              <KanbanBoard
                tasks={filteredTasks}
                kanbanSettings={kanbanSettings}
                columnWidth={columnWidth}
                compactView={compactView}
                renderPriorityBadge={renderPriorityBadge}
                onTaskClick={onTaskClick}
              />
            )}
          </>
        )}

        {viewMode === 'calendar' && (
          <ScrollArea className="h-full scrollbar-custom scrollbar-dark">
            <BigCalendarView
              tasks={filteredTasks}
              onAddTask={handleAddTaskFromCalendar}
              onTaskUpdate={onUpdateTask}
            />
          </ScrollArea>
        )}

        {viewMode === 'dependencies' && (
          <ScrollArea className="h-full scrollbar-custom scrollbar-dark">
            <TaskDependencyGraph
              tasks={filteredTasks}
              onTaskClick={(taskId: string) => {
                const task = filteredTasks.find(t => (t as any)._id === taskId || t.id === taskId);
                if (task && onCreateTask) {
                  // Open task details
                }
              }}
            />
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default TaskBoard;
