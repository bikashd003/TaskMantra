import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Task, TaskPriority, TaskStatus } from './types';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import TaskDetailSidebar from './TaskDetailSidebar';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
  MeasuringStrategy,
  Announcements,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import {
  KanbanSettingsService,
  KanbanColumn as KanbanColumnType,
} from '@/services/KanbanSettings.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasDraggableData, getColumnIdFromStatus, getStatusFromColumnId } from './utils';

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
  loadingAddTask?: boolean;
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
  loadingAddTask,
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
  // Reference to track the column of a task being dragged
  const pickedUpTaskColumn = useRef<string | null>(null);
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
      // Sort columns by their order property
      let sortedColumns = [...kanbanSettings.columns].sort((a, b) => a.order - b.order);

      // Ensure Completed column is always last
      const completedColumnIndex = sortedColumns.findIndex(col => col.id === 'completed');
      if (completedColumnIndex !== -1 && completedColumnIndex !== sortedColumns.length - 1) {
        // Remove the completed column
        const completedColumn = sortedColumns.splice(completedColumnIndex, 1)[0];
        // Add it back at the end
        sortedColumns.push(completedColumn);

        // Update order properties
        sortedColumns = sortedColumns.map((col, index) => ({
          ...col,
          order: index,
        }));

        // Flag that we need to save this change
        isUserAction.current = true;
      }

      setColumns(sortedColumns);
    }
  }, [kanbanSettings]);

  const [columns, setColumns] = useState<ColumnDefinition[]>(defaultColumns);
  // Create stable column IDs for the SortableContext
  const columnsId = useMemo(() => columns.map(col => `column-${col.id}`), [columns]);
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
  // eslint-disable-next-line no-undef
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

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  // Define announcements for accessibility
  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return;

      if (active.data.current?.type === 'column') {
        return `Picked up column ${active.data.current.column.title}`;
      } else if (active.data.current?.type === 'task') {
        return `Picked up task ${active.data.current.task.name}`;
      }
    },
    onDragOver({ active, over }) {
      if (!hasDraggableData(active) || !over || !hasDraggableData(over)) return;

      if (active.data.current?.type === 'column' && over.data.current?.type === 'column') {
        return `Column ${active.data.current.column.title} is over ${over.data.current.column.title}`;
      } else if (active.data.current?.type === 'task') {
        if (over.data.current?.type === 'column') {
          return `Task ${active.data.current.task.name} is over column ${over.data.current.column.title}`;
        } else if (over.data.current?.type === 'task') {
          return `Task ${active.data.current.task.name} is over task ${over.data.current.task.name}`;
        }
      }
    },
    onDragEnd({ active, over }) {
      if (!over || !hasDraggableData(active)) return;

      if (
        active.data.current?.type === 'column' &&
        hasDraggableData(over) &&
        over.data.current?.type === 'column'
      ) {
        return `Column ${active.data.current.column.title} was dropped into position`;
      } else if (active.data.current?.type === 'task') {
        if (hasDraggableData(over)) {
          if (over.data.current?.type === 'column') {
            return `Task ${active.data.current.task.name} was dropped into column ${over.data.current.column.title}`;
          } else if (over.data.current?.type === 'task') {
            return `Task ${active.data.current.task.name} was dropped on task ${over.data.current.task.name}`;
          }
        }
      }
    },
    onDragCancel({ active }) {
      if (!hasDraggableData(active)) return;
      return `Dragging ${active.data.current?.type} cancelled.`;
    },
  };
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

    // Add class to body to prevent text selection during drag
    document.body.classList.add('dnd-dragging');

    if (!hasDraggableData(active)) return;

    const data = active.data.current;

    // Check if it's a task being dragged
    if (data?.type === 'task') {
      setActiveTask(data.task);
      // Store the column ID for the task being dragged
      pickedUpTaskColumn.current = getColumnIdFromStatus(data.task.status);
      return;
    }

    // Check if it's a column being dragged
    if (data?.type === 'column') {
      setActiveColumn(data.id);
    }
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Skip if we're dragging over the same element
    if (active.id === over.id) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveATask = activeData?.type === 'task';
    const isOverATask = overData?.type === 'task';

    if (!isActiveATask) return;

    // Extract the original task ID from the drag ID
    const originalTaskId = activeData.originalId || activeData.task.id;

    // Task over another task
    if (isActiveATask && isOverATask) {
      // Find the task objects
      const activeTask = allTasks.find(t => t.id === originalTaskId);
      const overTask = allTasks.find(t => t.id === overData.originalId || overData.task.id);

      if (!activeTask || !overTask) return;

      // Get column IDs
      const activeColumnId = getColumnIdFromStatus(activeTask.status);
      const overColumnId = getColumnIdFromStatus(overTask.status);

      // If tasks are in different columns, update the active task's column
      if (activeColumnId !== overColumnId) {
        // Create a temporary visual representation of the task in the new column
        // but don't actually update the state until drag end
        // This is just for visual feedback during dragging

        // We'll use the activeTask state to show the task in the overlay
        // but we won't update the actual tasks state until drag end
        setActiveTask({
          ...activeTask,
          status: getStatusFromColumnId(overColumnId),
        });
      }
    }

    // Task over a column
    const isOverAColumn = overData?.type === 'column';
    if (isActiveATask && isOverAColumn) {
      // Find the active task
      const activeTask = allTasks.find(t => t.id === originalTaskId);
      if (!activeTask) return;

      // Get column IDs
      const activeColumnId = getColumnIdFromStatus(activeTask.status);
      const overColumnId = overData.id;

      // If task is already in this column, do nothing
      if (activeColumnId === overColumnId) return;

      // Update the active task for visual feedback
      setActiveTask({
        ...activeTask,
        status: getStatusFromColumnId(overColumnId),
      });
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    // Remove the class that prevents text selection
    document.body.classList.remove('dnd-dragging');

    // Reset the picked up task column reference
    pickedUpTaskColumn.current = null;

    // Reset active states
    setActiveTask(null);
    setActiveColumn(null);

    if (!over) return;

    // Skip if we're dropping on the same element
    if (active.id === over.id) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle column reordering
    if (activeData.type === 'column' && overData.type === 'column') {
      const activeColumnId = activeData.id;
      const overColumnId = overData.id;

      // Don't allow moving the Completed column
      if (activeColumnId === 'completed') {
        toast({
          title: 'Cannot move Completed column',
          description: 'The Completed column must remain at the end',
          variant: 'destructive',
        });
        return;
      }

      // Don't allow moving other columns after the Completed column
      if (overColumnId === 'completed') {
        toast({
          title: 'Cannot move column',
          description: 'The Completed column must remain at the end',
          variant: 'destructive',
        });
        return;
      }

      if (activeColumnId !== overColumnId) {
        const oldIndex = columns.findIndex(col => col.id === activeColumnId);
        const newIndex = columns.findIndex(col => col.id === overColumnId);

        if (oldIndex !== -1 && newIndex !== -1) {
          // Set the user action flag
          isUserAction.current = true;

          // Move the column in the array
          const newColumns = arrayMove(columns, oldIndex, newIndex);

          // Ensure Completed column is always last
          const completedColumnIndex = newColumns.findIndex(col => col.id === 'completed');
          if (completedColumnIndex !== -1 && completedColumnIndex !== newColumns.length - 1) {
            // Remove the completed column
            const completedColumn = newColumns.splice(completedColumnIndex, 1)[0];
            // Add it back at the end
            newColumns.push(completedColumn);
          }

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
    if (activeData.type === 'task') {
      // Extract the original task ID
      const originalTaskId = activeData.originalId || activeData.task.id;

      // Get the target column ID
      let targetColumnId: string | undefined;

      // Check if we're dropping on a column
      if (overData.type === 'column') {
        targetColumnId = overData.id;
      }
      // Check if we're dropping on another task
      else if (overData.type === 'task') {
        targetColumnId = getColumnIdFromStatus(overData.task.status);
      }

      // If we have a valid target column
      if (targetColumnId && targetColumnId in statusMap) {
        const taskId = originalTaskId;
        const newStatus = statusMap[targetColumnId];

        // Find the task in allTasks
        const taskIndex = allTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          const currentTask = allTasks[taskIndex];

          // Check if the task is actually changing status
          if (currentTask.status !== newStatus) {
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
            toast({
              title: 'Task moved',
              description: `Task moved to ${newStatus}`,
            });
          }
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

  // Configure drop animation for smooth feedback
  const dropAnimation = {
    duration: 300, // Longer for smoother animation
    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)', // Bounce effect at the end
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.8',
          transform: 'scale(1.02) rotate(1deg)',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.15)',
          zIndex: '50',
        },
      },
    }),
  };

  return (
    <div className="h-full w-full flex flex-col">
      <DndContext
        accessibility={{ announcements }}
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        modifiers={[]}
        autoScroll={true}
      >
        {/* Main kanban board container with horizontal scroll only */}
        <div className="flex-1 overflow-x-auto scrollbar-custom">
          <SortableContext items={columnsId} strategy={horizontalListSortingStrategy}>
            <div className="flex space-x-6 min-w-max py-2 px-1">
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
                  loadingAddTask={loadingAddTask}
                />
              ))}
            </div>
          </SortableContext>
        </div>

        {typeof window !== 'undefined' &&
          createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeTask ? (
                <KanbanCard
                  task={activeTask}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  renderPriorityBadge={renderPriorityBadge}
                  isOverlay
                />
              ) : activeColumn ? (
                <KanbanColumn
                  id={activeColumn}
                  title={columns.find(col => col.id === activeColumn)?.title || 'Column'}
                  tasks={tasks[activeColumn] || []}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  renderPriorityBadge={renderPriorityBadge}
                  columnWidth={columnWidth}
                  isOverlay
                />
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
