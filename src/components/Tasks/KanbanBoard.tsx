/* eslint-disable no-undef */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Task, TaskPriority, TaskStatus } from './types';
import KanbanColumn from './KanbanColumn';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import TaskDetailSidebar from './TaskDetailSidebar';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Settings } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import {
  KanbanSettingsService,
  KanbanColumn as KanbanColumnType,
} from '@/services/KanbanSettings.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

interface KanbanBoardProps {
  tasks: {
    todo: Task[];
    inProgress: Task[];
    review?: Task[];
    completed: Task[];
    [key: string]: Task[] | undefined;
  };
  allTasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onAddTask?: (task: Partial<Task>) => void;
  renderPriorityBadge: (priority: TaskPriority) => React.ReactNode;
  isLoading?: boolean;
  onCreateTask?: () => void;
  viewMode: 'kanban' | 'calendar' | 'list';
}

type ColumnDefinition = KanbanColumnType;

const statusMap: Record<string, TaskStatus> = {
  todo: 'To Do',
  inProgress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  allTasks,
  onStatusChange,
  onDelete,
  onAddTask,
  renderPriorityBadge,
  isLoading,
  viewMode,
}) => {
  const { toast } = useToast();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // Define default columns
  const defaultColumns: ColumnDefinition[] = [
    { id: 'todo', title: 'To Do', order: 0 },
    { id: 'inProgress', title: 'In Progress', order: 1 },
    { id: 'review', title: 'Review', order: 2 },
    { id: 'completed', title: 'Completed', order: 3 },
  ];

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [columnWidth, setColumnWidth] = useState(280);
  const [compactView, setCompactView] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Fetch kanban settings from API
  const { data: kanbanSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['kanban-settings'],
    queryFn: () => KanbanSettingsService.getSettings(),
  });

  // Update local state when settings are loaded
  React.useEffect(() => {
    if (kanbanSettings) {
      if (kanbanSettings.columns) {
        // Sort columns by order
        const sortedColumns = [...kanbanSettings.columns].sort((a, b) => a.order - b.order);
        setColumns(sortedColumns);
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

  // State for custom columns
  const [columns, setColumns] = useState<ColumnDefinition[]>(defaultColumns);

  // Mutation for updating columns
  const updateColumnsMutation = useMutation({
    mutationFn: (columns: ColumnDefinition[]) => KanbanSettingsService.updateColumns(columns),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-settings'] });
      toast({
        title: 'Columns updated',
        description: 'Your column layout has been saved',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to update columns',
        description: 'Please try again later',
        variant: 'destructive',
      });
    },
  });

  // Mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: any) => KanbanSettingsService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-settings'] });
      toast({
        title: 'Settings updated',
        description: 'Your preferences have been saved',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to update settings',
        description: 'Please try again later',
        variant: 'destructive',
      });
    },
  });

  // Track if columns were changed by the user or by the API response
  const isUserAction = useRef<boolean>(false);

  // Debounce timer reference
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounced column update function
  const debouncedUpdateColumns = useCallback(
    (columnsToUpdate: ColumnDefinition[]) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        updateColumnsMutation.mutate(columnsToUpdate);
      }, 1000); // 1 second delay
    },
    [updateColumnsMutation]
  );

  // Save columns when they change due to user actions
  useEffect(() => {
    // Skip the initial render and API-triggered updates
    if (!isLoadingSettings && isUserAction.current) {
      // Ensure each column has an order property
      const columnsWithOrder = columns.map((col, index) => ({
        ...col,
        order: col.order !== undefined ? col.order : index,
      }));

      // Use debounced update
      debouncedUpdateColumns(columnsWithOrder);
    }

    // Reset the flag after processing
    isUserAction.current = false;
  }, [columns, isLoadingSettings, debouncedUpdateColumns]);

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

  // Configure sensors for drag detection with a small delay to avoid accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  // Handle opening task details
  const handleOpenTaskDetails = (taskId: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsSidebarOpen(true);
    }
  };

  // Handle task update
  const handleTaskUpdate = (_taskId: string, _updates: Partial<Task>) => {
    // Here you would typically call your API to update the task
    // For now, we'll just show a toast
    toast({
      title: 'Task updated',
      description: 'Task details have been updated',
    });
  };

  // Add a new column
  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;

    const newColumnId = newColumnTitle.toLowerCase().replace(/\s+/g, '');

    // Check if column with this ID already exists
    if (columns.some(col => col.id === newColumnId)) {
      toast({
        title: 'Column already exists',
        description: 'Please use a different name',
        variant: 'destructive',
      });
      return;
    }

    const newColumn: ColumnDefinition = {
      id: newColumnId,
      title: newColumnTitle.trim(),
      order: columns.length, // Add at the end
    };

    // Set the user action flag
    isUserAction.current = true;

    const updatedColumns = [...columns, newColumn];
    setColumns(updatedColumns);
    setNewColumnTitle('');
    setIsAddColumnDialogOpen(false);

    // Add the new status to the statusMap
    statusMap[newColumnId] = newColumnTitle.trim() as TaskStatus;

    toast({
      title: 'Column added',
      description: `${newColumnTitle.trim()} column has been added`,
    });
  };

  // Delete a column
  const handleDeleteColumn = (columnId: string) => {
    // Don't allow deleting if it's the last column
    if (columns.length <= 1) {
      toast({
        title: 'Cannot delete column',
        description: 'You must have at least one column',
        variant: 'destructive',
      });
      return;
    }

    // Find tasks in this column
    const tasksInColumn = tasks[columnId] || [];
    if (tasksInColumn.length > 0) {
      toast({
        title: 'Cannot delete column',
        description: 'This column contains tasks. Move or delete them first.',
        variant: 'destructive',
      });
      return;
    }

    // Filter out the column
    const updatedColumns = columns.filter(col => col.id !== columnId);

    // Update order for remaining columns
    const reorderedColumns = updatedColumns.map((col, index) => ({
      ...col,
      order: index,
    }));

    // Set the user action flag
    isUserAction.current = true;

    setColumns(reorderedColumns);

    toast({
      title: 'Column deleted',
      description: 'The column has been removed',
    });
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = String(active.id);

    // Check if it's a task being dragged
    const task = allTasks.find(t => t.id === activeId);
    if (task) {
      setActiveTask(task);
      return;
    }

    // Check if it's a column being dragged
    if (activeId.startsWith('column-')) {
      setActiveColumn(activeId.replace('column-', ''));
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);
    setActiveColumn(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Handle column reordering
    if (activeId.startsWith('column-') && overId.startsWith('column-')) {
      const activeColumnId = activeId.replace('column-', '');
      const overColumnId = overId.replace('column-', '');

      if (activeColumnId !== overColumnId) {
        const oldIndex = columns.findIndex(col => col.id === activeColumnId);
        const newIndex = columns.findIndex(col => col.id === overColumnId);

        if (oldIndex !== -1 && newIndex !== -1) {
          // Set the user action flag
          isUserAction.current = true;

          // Move the column in the array
          const newColumns = arrayMove(columns, oldIndex, newIndex);

          // Update the order property for each column
          const updatedColumns = newColumns.map((col, index) => ({
            ...col,
            order: index,
          }));

          setColumns(updatedColumns);
        }
      }
      return;
    }

    // Handle task moving between columns
    if (active.id !== over.id && over.id) {
      const columnId = String(over.id);
      if (columnId in statusMap) {
        const newStatus = statusMap[columnId];
        onStatusChange(String(active.id), newStatus);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-8 w-[80%]" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ))}
      </div>
    );
  }

  // Configure drop animation
  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <div className="h-full w-full flex flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex justify-end items-center mb-4">
          <div className="flex space-x-2">
            {viewMode === 'kanban' && (
              <Button variant="outline" size="sm" onClick={() => setIsAddColumnDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Column
              </Button>
            )}

            <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" /> Settings
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Board Settings</h4>

                  {viewMode === 'kanban' && (
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
                  )}

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
        </div>

        {/* Main scrollable kanban board container */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <SortableContext
              items={columns.map(col => `column-${col.id}`)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex space-x-4 min-w-max pb-4">
                {columns.map(column => (
                  <KanbanColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    tasks={
                      !showCompletedTasks && column.id === 'completed' ? [] : tasks[column.id] || []
                    }
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                    renderPriorityBadge={renderPriorityBadge}
                    onTaskClick={handleOpenTaskDetails}
                    onAddTask={onAddTask}
                    onDeleteColumn={() => handleDeleteColumn(column.id)}
                    columnWidth={columnWidth}
                    compactView={compactView}
                  />
                ))}
              </div>
            </SortableContext>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {typeof window !== 'undefined' &&
          createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeTask ? (
                <div className="rotate-3 scale-105 w-full max-w-[300px]">
                  {/* Render the dragged task */}
                  <div className="bg-white p-4 rounded-lg shadow-lg border border-primary/20">
                    <h3 className="font-medium text-sm">{activeTask.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-gray-500">
                        Due: {new Date(activeTask.dueDate).toLocaleDateString()}
                      </div>
                      {renderPriorityBadge(activeTask.priority)}
                    </div>
                  </div>
                </div>
              ) : activeColumn ? (
                <div className="opacity-80">
                  {/* Render the dragged column */}
                  <div className="bg-white p-4 rounded-lg shadow-lg border border-primary/20 w-80">
                    <h3 className="font-medium">
                      {columns.find(col => col.id === activeColumn)?.title || 'Column'}
                    </h3>
                  </div>
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
      </DndContext>

      {/* Task Detail Sidebar */}
      <TaskDetailSidebar
        task={selectedTask}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onTaskUpdate={handleTaskUpdate}
      />

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

export default KanbanBoard;
