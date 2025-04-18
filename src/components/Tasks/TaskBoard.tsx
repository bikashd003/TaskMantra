import React, { useState, useEffect, useCallback } from 'react';
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
import {
  Plus,
  List,
  LayoutGrid,
  Calendar,
  Network,
  BarChart2,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import TaskList from './TaskList';
import KanbanBoard from './KanbanBoard';
import BigCalendarView from './BigCalendarView';
import TaskFilters from './TaskFilters';
import TaskDependencyGraph from './TaskDependencyGraph';
import WorkflowView from './WorkflowView';
import WorkflowEditor from './WorkflowEditor';
import FlowCreator from './FlowCreator';
import { Skeleton } from '@heroui/skeleton';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KanbanSettingsService } from '@/services/KanbanSettings.service';
import {
  WorkflowSettingsService,
  WorkflowState,
  WorkflowTransition,
  WorkflowTemplate,
} from '@/services/WorkflowSettings.service';
// import { TaskService } from "@/services/Task.service";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // View state
  const [viewMode, setViewMode] = useState<
    'list' | 'kanban' | 'calendar' | 'dependencies' | 'workflow'
  >('list');

  // Filter and sort state
  const [filters, setFilters] = useState<TaskFilterState>({
    searchQuery: '',
    status: 'all',
    priority: 'all',
  });
  const [currentSort, setCurrentSort] = useState<TaskSortOption>(sortOptions[0]);

  // Debounce search query to prevent excessive API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');

  // Workflow editor states
  const [isWorkflowEditorOpen, setIsWorkflowEditorOpen] = useState(false);
  const [isFlowCreatorOpen, setIsFlowCreatorOpen] = useState(false);
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([]);

  // Fetch user preferences
  const { data: kanbanSettings } = useQuery<any>({
    queryKey: ['kanban-settings'],
    queryFn: () => KanbanSettingsService.getSettings(),
  });

  // Fetch workflow settings
  const { data: workflowSettings } = useQuery({
    queryKey: ['workflow-settings'],
    queryFn: () => WorkflowSettingsService.getSettings(),
  });

  // Fetch workflow templates
  const { data: templateData } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: () => WorkflowSettingsService.getTemplates(),
  });

  // Update workflow templates state when data changes
  useEffect(() => {
    if (templateData) {
      setWorkflowTemplates(templateData);
    }
  }, [templateData]);

  // Set view mode from settings when they load
  useEffect(() => {
    if (kanbanSettings?.defaultView) {
      setViewMode(
        kanbanSettings.defaultView as 'list' | 'kanban' | 'calendar' | 'dependencies' | 'workflow'
      );
    }
  }, [kanbanSettings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation<any, Error, any>({
    mutationFn: (settings: any) => KanbanSettingsService.updateSettings(settings),
  });

  // Update workflow settings mutation
  const updateWorkflowMutation = useMutation({
    mutationFn: async (data: { states: WorkflowState[]; transitions: WorkflowTransition[] }) => {
      await WorkflowSettingsService.updateStates(data.states);
      return WorkflowSettingsService.updateTransitions(data.transitions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-settings'] });
      toast.success('Workflow settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update workflow settings');
    },
  });

  // Update debounced search query after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(filters.searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  // Fetch filtered tasks from backend
  const { data: filteredTasks = [] } = useQuery({
    queryKey: [
      'filtered-tasks',
      debouncedSearchQuery,
      filters.status,
      filters.priority,
      currentSort,
    ],
    queryFn: async () => {
      // If no tasks are provided or we're already loading, return empty array
      if (tasks.length === 0 || isLoading) return [];

      // Otherwise, use the client-side filtered tasks for now
      // In a real implementation, this would call the backend API
      return tasks.filter(task => {
        // Filter by search query
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

      // TODO: Replace with actual backend call when API is ready
      // return TaskService.getAllTasks({
      //   searchQuery: debouncedSearchQuery,
      //   status: filters.status,
      //   priority: filters.priority,
      //   sortField: currentSort.field as string,
      //   sortDirection: currentSort.direction
      // });
    },
    enabled: !isLoading, // Only run this query if we're not loading the initial tasks
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

    filteredTasks.forEach(task => {
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
  const handleViewModeChange = (
    mode: 'list' | 'kanban' | 'calendar' | 'dependencies' | 'workflow'
  ) => {
    setViewMode(mode);
    updateSettingsMutation.mutate({ defaultView: mode });
  };

  // Handle workflow settings save
  const handleSaveWorkflow = useCallback(
    async (states: WorkflowState[], transitions: WorkflowTransition[]) => {
      await updateWorkflowMutation.mutateAsync({ states, transitions });
      setIsWorkflowEditorOpen(false);
    },
    [updateWorkflowMutation]
  );

  // Handle new workflow creation
  const handleCreateWorkflow = useCallback(
    async (
      states: WorkflowState[],
      transitions: WorkflowTransition[],
      name: string,
      description: string
    ) => {
      try {
        await WorkflowSettingsService.createWorkflow({ name, description, states, transitions });
        queryClient.invalidateQueries({ queryKey: ['workflow-settings'] });
        setIsFlowCreatorOpen(false);
        toast.success('New workflow created successfully');
      } catch (error) {
        toast.error('Failed to create workflow');
        console.error('Error creating workflow:', error);
      }
    },
    [queryClient]
  );

  // Handle template application
  const handleApplyTemplate = useCallback(
    async (templateId: string) => {
      try {
        await WorkflowSettingsService.applyTemplate(templateId);
        queryClient.invalidateQueries({ queryKey: ['workflow-settings'] });
        toast.success('Template applied successfully');
      } catch (error) {
        toast.error('Failed to apply template');
        console.error('Error applying template:', error);
      }
    },
    [queryClient]
  );

  // Get loading state
  const isSettingsLoading = !kanbanSettings && !updateSettingsMutation.isPending;
  const isWorkflowLoading = !workflowSettings;

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
        tags: [],
        completed: false,
      };
      onAddTask(newTask);
    }
  };
  // Calculate task statistics
  const taskStats = React.useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'Completed').length;
    const inProgress = filteredTasks.filter(t => t.status === 'In Progress').length;
    const todo = filteredTasks.filter(t => t.status === 'To Do').length;
    const review = filteredTasks.filter(t => t.status === 'Review').length;

    return { total, completed, inProgress, todo, review };
  }, [filteredTasks]);

  return (
    <div className="flex flex-col space-y-4 h-full">
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

      {/* Task Statistics */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold">{taskStats.total}</p>
              </div>
              <BarChart2 className="h-8 w-8 text-blue-500 opacity-70" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold">{taskStats.inProgress}</p>
              </div>
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                {Math.round((taskStats.inProgress / taskStats.total) * 100) || 0}%
              </Badge>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{taskStats.completed}</p>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                {Math.round((taskStats.completed / taskStats.total) * 100) || 0}%
              </Badge>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">To Review</p>
                <p className="text-2xl font-bold">{taskStats.review}</p>
              </div>
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                {Math.round((taskStats.review / taskStats.total) * 100) || 0}%
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Mode Toggle and Filters Container */}
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between w-full">
        {/* View Mode Toggle */}
        {isSettingsLoading ? (
          <Skeleton className="h-10 w-96 rounded-md" />
        ) : (
          <div className="flex items-center border rounded-md overflow-hidden shadow-sm hover:shadow transition-all duration-300">
            <TooltipProvider>
              {[
                { mode: 'list', icon: List, label: 'List View' },
                { mode: 'kanban', icon: LayoutGrid, label: 'Kanban Board' },
                { mode: 'calendar', icon: Calendar, label: 'Calendar View' },
                { mode: 'workflow', icon: ArrowRight, label: 'Task Workflow' },
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
        )}

        {/* Search and Filters */}
        <div className="flex-grow w-full md:w-auto">
          {isLoading ? (
            <Skeleton className="h-10 w-full rounded-lg" />
          ) : (
            <TaskFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              currentSort={currentSort}
            />
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <ScrollArea className="h-[calc(100vh-20rem)]">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <>
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
                    // Open task details
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

            {viewMode === 'workflow' &&
              (isWorkflowLoading ? (
                <div className="p-4 space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <>
                  <div className="p-4 mb-4 flex justify-between items-center">
                    <Card className="w-full">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">
                            {workflowSettings?.name || 'Task Workflow'}
                          </CardTitle>
                          <div className="flex gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Templates
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {workflowTemplates.length > 0 ? (
                                  workflowTemplates.map(template => (
                                    <DropdownMenuItem
                                      key={template.id}
                                      onClick={() =>
                                        template.id && handleApplyTemplate(template.id)
                                      }
                                    >
                                      {template.name}
                                    </DropdownMenuItem>
                                  ))
                                ) : (
                                  <DropdownMenuItem disabled>
                                    No templates available
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsWorkflowEditorOpen(true)}
                            >
                              Edit Workflow
                            </Button>

                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setIsFlowCreatorOpen(true)}
                            >
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Create New
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>

                  <WorkflowView
                    tasks={filteredTasks}
                    workflowStates={workflowSettings?.states || []}
                    workflowTransitions={workflowSettings?.transitions || []}
                    onEditWorkflow={() => setIsWorkflowEditorOpen(true)}
                    isCustomizable={true}
                  />

                  {isWorkflowEditorOpen && (
                    <WorkflowEditor
                      isOpen={isWorkflowEditorOpen}
                      onClose={() => setIsWorkflowEditorOpen(false)}
                      workflowStates={workflowSettings?.states || []}
                      workflowTransitions={workflowSettings?.transitions || []}
                      onSave={handleSaveWorkflow}
                    />
                  )}

                  {isFlowCreatorOpen && (
                    <FlowCreator
                      isOpen={isFlowCreatorOpen}
                      onCancel={() => setIsFlowCreatorOpen(false)}
                      onSave={handleCreateWorkflow}
                    />
                  )}
                </>
              ))}
          </>
        )}
      </ScrollArea>
    </div>
  );
};

export default TaskBoard;
