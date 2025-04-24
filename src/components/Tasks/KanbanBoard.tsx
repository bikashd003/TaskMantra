/* eslint-disable no-undef */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Task, TaskPriority, TaskStatus } from './types';
import KanbanColumn from './KanbanColumn';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import TaskDetailSidebar from './TaskDetailSidebar';
import { createPortal } from 'react-dom';
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
// ScrollArea and ScrollBar removed as they're now used in KanbanColumn

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
  // Settings props
  columnWidth: number;
  compactView: boolean;
  showCompletedTasks: boolean;
  onAddColumn: () => void;
}

type ColumnDefinition = KanbanColumnType;

const statusMap: Record<string, TaskStatus> = {
  todo: 'To Do',
  inProgress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks: initialTasks,
  allTasks: initialAllTasks,
  onStatusChange,
  onDelete,
  onAddTask,
  renderPriorityBadge,
  isLoading,
  columnWidth,
  compactView,
  showCompletedTasks,
}) => {
  // Create local state for tasks to enable optimistic updates
  const [tasks, setTasks] = React.useState(initialTasks);
  const [allTasks, setAllTasks] = React.useState(initialAllTasks);

  // Update local state when props change
  React.useEffect(() => {
    setTasks(initialTasks);
    setAllTasks(initialAllTasks);
  }, [initialTasks, initialAllTasks]);
  const { toast } = useToast();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const defaultColumns: ColumnDefinition[] = [
    { id: 'todo', title: 'To Do', order: 0 },
    { id: 'inProgress', title: 'In Progress', order: 1 },
    { id: 'review', title: 'Review', order: 2 },
    { id: 'completed', title: 'Completed', order: 3 },
  ];

  const queryClient = useQueryClient();

  const { data: kanbanSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['kanban-settings'],
    queryFn: () => KanbanSettingsService.getSettings(),
  });

  React.useEffect(() => {
    if (kanbanSettings && kanbanSettings.columns) {
      const sortedColumns = [...kanbanSettings.columns].sort((a, b) => a.order - b.order);
      setColumns(sortedColumns);
    }
  }, [kanbanSettings]);

  const [columns, setColumns] = useState<ColumnDefinition[]>(defaultColumns);

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

  // Settings mutations moved to parent component

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

  // These settings are now managed by the parent component

  // Configure sensors for drag detection with minimal delay for instant response
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 50, // Small delay to avoid accidental drags
        tolerance: 5, // Reduced tolerance for more precise dragging
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

  // Add column functionality moved to parent component

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

          // Show success toast
          toast({
            title: 'Column moved',
            description: 'Column order has been updated',
          });
        }
      }
      return;
    }

    // Handle task moving between columns
    if (!activeId.startsWith('column-')) {
      // Get the column ID from the over element
      let targetColumnId: string | undefined;

      // Check if we're dropping on a droppable area within a column
      if (over.data.current?.type === 'column') {
        targetColumnId = over.data.current.id;
      } else {
        // If not dropping directly on a column, find the parent column
        // Try to find the column by checking if the over ID is a task ID
        for (const [columnId, columnTasks] of Object.entries(tasks)) {
          if (columnTasks?.some(t => t.id === overId)) {
            targetColumnId = columnId;
            break;
          }
        }

        // If still no target column, use the over ID directly if it's a valid column
        if (!targetColumnId && overId in statusMap) {
          targetColumnId = overId;
        }
      }

      // If we have a valid target column
      if (targetColumnId && targetColumnId in statusMap) {
        const taskId = activeId;
        const newStatus = statusMap[targetColumnId];

        // Find the task in allTasks
        const taskIndex = allTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          // Create a copy of allTasks for optimistic update
          const updatedTasks = [...allTasks];

          // Update the task status locally first for instant UI update
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            status: newStatus,
          };

          // Update the tasks state directly for immediate UI update
          const updatedTaskGroups = { ...tasks };

          // Remove the task from its original column
          Object.keys(updatedTaskGroups).forEach(key => {
            updatedTaskGroups[key] = updatedTaskGroups[key]?.filter(t => t.id !== taskId) || [];
          });

          // Add the task to the new column
          const columnKey = Object.keys(statusMap).find(key => statusMap[key] === newStatus);
          if (columnKey) {
            if (!updatedTaskGroups[columnKey]) {
              updatedTaskGroups[columnKey] = [];
            }
            updatedTaskGroups[columnKey] = [
              ...updatedTaskGroups[columnKey],
              updatedTasks[taskIndex],
            ];
          }

          // Update the local state for immediate UI update
          setTasks(updatedTaskGroups);
          setAllTasks(updatedTasks);

          // Call the onStatusChange to update backend
          onStatusChange(taskId, newStatus);
        }
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

  // Configure drop animation for instant feedback
  const dropAnimation = {
    duration: 150, // Shorter duration for quicker animation
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // Fast acceleration curve
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
        {/* Main kanban board container with horizontal scroll only */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
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

      {/* Add Column Dialog moved to parent component */}
    </div>
  );
};

export default KanbanBoard;
