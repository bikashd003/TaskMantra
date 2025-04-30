import React, { useState, useEffect } from 'react';
import {
  Task,
  TaskPriority,
  TaskStatus,
  TaskFilterState,
  TaskSortOption,
  sortOptions,
} from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, List, LayoutGrid, Calendar, Network, Settings } from 'lucide-react';
import TaskList from './TaskList';
import KanbanBoard from './KanbanBoard';
import BigCalendarView from './BigCalendarView';
import TaskFilters from './TaskFilters';
import TaskDependencyGraph from './TaskDependencyGraph';
import KanbanBoardSkeleton from './KanbanBoardSkeleton';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMutation, useQuery } from '@tanstack/react-query';
import { KanbanSettingsService } from '@/services/KanbanSettings.service';
import { TaskService } from '@/services/Task.service';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar' | 'dependencies'>('list');

  // Kanban settings
  const [columnWidth, setColumnWidth] = useState(280);
  const [compactView, setCompactView] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

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
      if (kanbanSettings.showCompletedTasks !== undefined) {
        setShowCompletedTasks(kanbanSettings.showCompletedTasks);
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
      tasks.length, // Add tasks.length to re-run when parent tasks change
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

        // Map API tasks to our Task type if needed
        return apiTasks.map((apiTask: any) => ({
          id: apiTask.id || apiTask._id,
          name: apiTask.name,
          description: apiTask.description || '',
          status: apiTask.status || 'To Do',
          priority: apiTask.priority || 'Medium',
          dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : new Date(),
          startDate: apiTask.startDate ? new Date(apiTask.startDate) : new Date(),
          estimatedTime: apiTask.estimatedTime || 0,
          loggedTime: apiTask.loggedTime || 0,
          createdBy: apiTask.createdBy || '',
          projectId: apiTask.projectId || null,
          dependencies: apiTask.dependencies || [],
          subtasks: apiTask.subtasks || [],
          comments: apiTask.comments || [],
          assignedTo: apiTask.assignedTo || [],
          completed: apiTask.completed || false,
          tags: apiTask.tags || [],
          createdAt: apiTask.createdAt ? new Date(apiTask.createdAt) : undefined,
          updatedAt: apiTask.updatedAt ? new Date(apiTask.updatedAt) : undefined,
        }));
      }
    },
    enabled: !isLoading,
  });

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

    filteredTasks.forEach((task: Task) => {
      switch (task.status) {
        case 'To Do':
          grouped.todo.push(task);
          break;
        case 'In Progress':
          grouped.inProgress.push(task);
          break;
        case 'Review':
          grouped.review.push(task);
          break;
        case 'Completed':
          grouped.completed.push(task);
          break;
        default:
          // Handle custom statuses
          // eslint-disable-next-line no-case-declarations
          const key = String(task.status).toLowerCase().replace(/\s+/g, '');
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

  // Handle show completed tasks toggle
  const handleShowCompletedTasksToggle = (checked: boolean) => {
    setShowCompletedTasks(checked);
    updateSettingsMutation.mutate({ showCompletedTasks: checked });
  };

  // Add a new column
  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;

    // Check if column with this ID already exists
    const newColumnId = newColumnTitle.toLowerCase().replace(/\s+/g, '');

    // Add the new column to settings
    updateSettingsMutation.mutate({
      newColumn: {
        id: newColumnId,
        title: newColumnTitle.trim(),
      },
    });

    setNewColumnTitle('');
    setIsAddColumnDialogOpen(false);
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
    <div className="flex flex-col h-full w-full">
      {/* Header with New Task Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Task Board</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onCreateTask}
                size="sm"
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Plus className="h-4 w-4" /> New Task
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new task</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* View Mode Toggle and Filters Container */}
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between w-full">
        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-md overflow-hidden shadow-sm hover:shadow transition-all duration-300">
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
                    className={`rounded-none transition-all duration-200 ${viewMode === item.mode ? 'border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-800'}`}
                    onClick={() => handleViewModeChange(item.mode as any)}
                  >
                    <item.icon
                      className={`h-4 w-4 mr-1 ${viewMode === item.mode ? 'text-blue-600' : ''}`}
                    />
                    {item.mode.charAt(0).toUpperCase() + item.mode.slice(1)}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        {/* Search and Filters */}
        <div className="flex-grow w-full md:w-auto">
          <TaskFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            currentSort={currentSort}
          />
        </div>
        {viewMode === 'kanban' && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddColumnDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Column
            </Button>

            <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" /> Settings
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Board Settings</h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="column-width" className="text-sm">
                        Column Width
                      </Label>
                      <span className="text-xs text-muted-foreground">{columnWidth}px</span>
                    </div>
                    <Slider
                      id="column-width"
                      min={220}
                      max={400}
                      step={10}
                      value={[columnWidth]}
                      onValueChange={handleColumnWidthChange}
                    />
                  </div>

                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-view" className="text-sm">
                        Compact View
                      </Label>
                      <p className="text-xs text-muted-foreground">Show less details on cards</p>
                    </div>
                    <Switch
                      id="compact-view"
                      checked={compactView}
                      onCheckedChange={handleCompactViewToggle}
                    />
                  </div>

                  <div className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-completed" className="text-sm">
                        Show Completed Tasks
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Display tasks marked as completed
                      </p>
                    </div>
                    <Switch
                      id="show-completed"
                      checked={showCompletedTasks}
                      onCheckedChange={handleShowCompletedTasksToggle}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-[calc(100vh-20rem)]">
        {viewMode === 'list' && (
          <ScrollArea className="h-full">
            <TaskList
              tasks={filteredTasks}
              searchQuery={filters.searchQuery}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              renderPriorityBadge={renderPriorityBadge as any}
              onCreateTask={onCreateTask || (() => {})}
              isLoading={false}
            />
          </ScrollArea>
        )}
        {viewMode === 'kanban' && (
          <>
            {showLoading ? (
              <KanbanBoardSkeleton />
            ) : (
              <KanbanBoard
                tasks={groupedTasks}
                allTasks={filteredTasks}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
                onAddTask={onAddTask}
                renderPriorityBadge={renderPriorityBadge}
                isLoading={false}
                onCreateTask={onCreateTask}
                viewMode="kanban"
                columnWidth={columnWidth}
                compactView={compactView}
                showCompletedTasks={showCompletedTasks}
                onAddColumn={handleAddColumn}
              />
            )}
          </>
        )}

        {viewMode === 'calendar' && (
          <ScrollArea className="h-full">
            <BigCalendarView
              tasks={filteredTasks}
              onTaskClick={(taskId: string) => {
                const task = filteredTasks.find(t => (t as any)._id === taskId || t.id === taskId);
                if (task && onCreateTask) {
                  // Open task details
                }
              }}
              renderPriorityBadge={renderPriorityBadge}
              onAddTask={handleAddTaskFromCalendar}
              onTaskUpdate={onUpdateTask}
            />
          </ScrollArea>
        )}

        {viewMode === 'dependencies' && (
          <ScrollArea className="h-full">
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

      {/* Add Column Dialog */}
      <Dialog open={isAddColumnDialogOpen} onOpenChange={setIsAddColumnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Column name"
              value={newColumnTitle}
              onChange={e => setNewColumnTitle(e.target.value)}
              className="mb-2"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter' && newColumnTitle.trim()) {
                  handleAddColumn();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddColumnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn} disabled={!newColumnTitle.trim()}>
              Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskBoard;
