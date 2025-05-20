'use client';

import { useEffect, useState, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column } from './KanbanColumn';
import { Card } from './KanbanCard';
import { createPortal } from 'react-dom';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  KanbanSettingsService,
  KanbanColumn as KanbanColumnType,
} from '@/services/KanbanSettings.service';
import { toast } from 'sonner';
import { TaskService } from '@/services/Task.service';
import { KanbanSkeleton } from './KanbanSkeleton';
import CreateColumnModal from './CreateColumnModal';
import { Task } from '../Tasks/types';
import { TaskSidebar } from './TaskSidebar';

// Types
export type CardType = {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: string;
  dueDate?: string;
  estimatedTime?: number;
  loggedTime?: number;
  assignedTo?: any[];
  subtasks?: any[];
};

export type ColumnType = {
  id: string;
  title: string;
  cards: CardType[];
  isLocked?: boolean;
};

interface ProjectProps {
  project: any;
}

export default function ProjectKanban({ project }: ProjectProps) {
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [openColumnCreateModal, setOpenColumnCreateModal] = useState(false);
  const [lastDroppedId, setLastDroppedId] = useState<string | null>(null);
  const [compactView, setCompactView] = useState<boolean>(false);
  const [columnWidth, setColumnWidth] = useState<number>(300);
  const queryClient = useQueryClient();
  const previousColumnsRef = useRef<ColumnType[]>([]);
  const dragSourceColumnRef = useRef<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: kanbanSetting, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['kanban-settings'],
    queryFn: async () => {
      const response = await KanbanSettingsService.getSettings();
      return response;
    },
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: string }) => {
      await TaskService.updateTaskStatus(taskId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project._id] });
      toast.success('Task status updated');
    },
    onError: _error => {
      setColumns(previousColumnsRef.current);
      toast.error('Failed to update task status. Changes reverted.');
    },
  });

  useEffect(() => {
    if (project) {
      const defaultKanbanColumns: KanbanColumnType[] = [
        { id: 'todo', title: 'To Do', order: 0 },
        { id: 'inProgress', title: 'In Progress', order: 1 },
        { id: 'review', title: 'Review', order: 2 },
        { id: 'completed', title: 'Completed', order: 5 },
      ];

      const columnsToUse =
        kanbanSetting?.columns && kanbanSetting.columns.length > 0
          ? kanbanSetting.columns
          : defaultKanbanColumns;

      // Update compactView and columnWidth from kanban settings
      if (kanbanSetting) {
        setCompactView(kanbanSetting.compactView || false);
        setColumnWidth(kanbanSetting.columnWidth || 300);
      }

      const initialColumns: ColumnType[] = columnsToUse
        .sort((a: KanbanColumnType, b: KanbanColumnType) => a.order - b.order)
        .map((column: KanbanColumnType) => ({
          id: column.id,
          title: column.title,
          cards: [],
          isLocked: column.id === 'completed',
        }));

      if (project.tasks && project.tasks.length > 0) {
        project.tasks.forEach((task: any) => {
          let columnIndex = initialColumns.findIndex(
            col => col.title.toLowerCase() === task.status.toLowerCase()
          );
          if (columnIndex === -1) {
            const normalizedTaskStatus = task.status
              .toLowerCase()
              .replace(/\s+/g, '')
              .replace(/[^a-z0-9]/gi, '');
            columnIndex = initialColumns.findIndex(
              col => col.id.toLowerCase() === normalizedTaskStatus
            );
            if (columnIndex === -1) {
              const similarityScores = initialColumns.map(col => {
                const normalizedColId = col.id.toLowerCase();
                if (
                  normalizedColId.includes(normalizedTaskStatus) ||
                  normalizedTaskStatus.includes(normalizedColId)
                ) {
                  return true;
                }
                return false;
              });

              columnIndex = similarityScores.findIndex(score => score === true);
            }
          }

          if (columnIndex === -1 && initialColumns.length > 0) {
            columnIndex = 0;
          }

          if (columnIndex !== -1) {
            const card: CardType = {
              id: task._id,
              title: task.name,
              description: task.description || '',
              priority: task.priority.charAt(0) + task.priority.slice(1),
              status: task.status,
              dueDate: task.dueDate,
              estimatedTime: task.estimatedTime,
              loggedTime: task.loggedTime,
              assignedTo: task.assignedTo,
              subtasks: task.subtasks,
            };

            initialColumns[columnIndex].cards.push(card);
          }
        });
      }

      setColumns(initialColumns);
      previousColumnsRef.current = initialColumns;
    }
  }, [kanbanSetting, project]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function findColumnByCardId(cardId: string) {
    return columns.find(column => column.cards.some(card => card.id === cardId));
  }

  function findCardById(cardId: string) {
    for (const column of columns) {
      const card = column.cards.find(card => card.id === cardId);
      if (card) return card;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeId = active.id as string;

    // Save the current state before any drag operation
    previousColumnsRef.current = JSON.parse(JSON.stringify(columns));

    if (activeId.includes('column')) {
      const columnId = activeId.replace('column-', '');
      const activeColumn = columns.find(col => col.id === columnId);

      if (activeColumn?.isLocked) {
        return;
      }

      if (activeColumn) setActiveColumn(activeColumn);
      return;
    }

    // Track source column for card drag
    const card = findCardById(activeId);
    if (card) {
      setActiveCard(card);
      const sourceColumn = findColumnByCardId(activeId);
      if (sourceColumn) {
        // Store the source column ID for later comparison
        dragSourceColumnRef.current = sourceColumn.id;
      }
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    if (!activeId.includes('column') && !overId.includes('column')) {
      const activeColumn = findColumnByCardId(activeId);
      const overColumn = findColumnByCardId(overId);

      if (!activeColumn || !overColumn) return;

      setColumns(columns => {
        // Create new columns array
        const newColumns = [...columns];

        // Find indices
        const activeColumnIndex = newColumns.findIndex(col => col.id === activeColumn.id);
        const overColumnIndex = newColumns.findIndex(col => col.id === overColumn.id);

        // Find card indices
        const activeCardIndex = newColumns[activeColumnIndex].cards.findIndex(
          card => card.id === activeId
        );
        const overCardIndex = newColumns[overColumnIndex].cards.findIndex(
          card => card.id === overId
        );

        if (activeColumn.id === overColumn.id) {
          newColumns[activeColumnIndex].cards = arrayMove(
            newColumns[activeColumnIndex].cards,
            activeCardIndex,
            overCardIndex
          );
        } else {
          const [movedCard] = newColumns[activeColumnIndex].cards.splice(activeCardIndex, 1);

          newColumns[overColumnIndex].cards.splice(overCardIndex, 0, movedCard);
        }

        return newColumns;
      });
    }

    if (!activeId.includes('column') && overId.includes('column')) {
      const activeColumn = findColumnByCardId(activeId);
      const overColumnId = overId.replace('column-', '');

      if (!activeColumn || activeColumn.id === overColumnId) return;

      setColumns(columns => {
        const newColumns = [...columns];

        const activeColumnIndex = newColumns.findIndex(col => col.id === activeColumn.id);
        const overColumnIndex = newColumns.findIndex(col => col.id === overColumnId);

        const activeCardIndex = newColumns[activeColumnIndex].cards.findIndex(
          card => card.id === activeId
        );

        const [movedCard] = newColumns[activeColumnIndex].cards.splice(activeCardIndex, 1);

        newColumns[overColumnIndex].cards.push(movedCard);

        return newColumns;
      });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active && active.id) {
      const activeId = active.id as string;
      setLastDroppedId(activeId);
      setTimeout(() => {
        setLastDroppedId(null);
      }, 1000);
    }

    setActiveColumn(null);
    setActiveCard(null);

    if (!over) {
      dragSourceColumnRef.current = null;
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId && !activeId.includes('column')) {
      const currentColumn = findColumnByCardId(activeId);

      if (
        currentColumn &&
        dragSourceColumnRef.current &&
        currentColumn.id !== dragSourceColumnRef.current
      ) {
        // The card was moved to a different column during dragOver
        const card = findCardById(activeId);
        if (card) {
          updateTaskStatus.mutate({
            taskId: activeId,
            newStatus: currentColumn.title,
          });
        }
      }

      // Reset source column ref
      dragSourceColumnRef.current = null;
      return;
    }

    // If the item is dropped on a different item
    if (activeId.includes('column') && overId.includes('column')) {
      const activeColumnId = activeId.replace('column-', '');
      const overColumnId = overId.replace('column-', '');

      // Find the columns
      const activeColumn = columns.find(col => col.id === activeColumnId);
      const overColumn = columns.find(col => col.id === overColumnId);
      if (activeColumn?.isLocked || overColumn?.isLocked) {
        dragSourceColumnRef.current = null;
        return;
      }

      const activeIndex = columns.findIndex(col => col.id === activeColumnId);
      const overIndex = columns.findIndex(col => col.id === overColumnId);

      if (activeIndex !== -1 && overIndex !== -1) {
        const reorderedColumns = arrayMove(columns, activeIndex, overIndex);
        setColumns(reorderedColumns);

        if (kanbanSetting) {
          const updatedKanbanColumns = kanbanSetting.columns.map((col: KanbanColumnType) => {
            const newIndex = reorderedColumns.findIndex(c => c.id === col.id);
            return {
              ...col,
              order: newIndex !== -1 ? newIndex : col.order,
            };
          });

          updateColumnsMutation.mutate(updatedKanbanColumns);
        }
      }
    } else if (!activeId.includes('column')) {
      let targetColumnId: string | null = null;

      if (overId.includes('column')) {
        targetColumnId = overId.replace('column-', '');
      } else {
        const targetColumn = findColumnByCardId(overId);
        if (targetColumn) {
          targetColumnId = targetColumn.id;
        } else {
          dragSourceColumnRef.current = null;
          return;
        }
      }

      // Only update status if the card was moved to a different column
      if (targetColumnId && dragSourceColumnRef.current !== targetColumnId) {
        const card = findCardById(activeId);
        const targetColumn = columns.find(col => col.id === targetColumnId);

        if (card && targetColumn) {
          updateTaskStatus.mutate({
            taskId: activeId,
            newStatus: targetColumn.title,
          });
        }
      }
    }
    dragSourceColumnRef.current = null;
  }

  const updateColumnsMutation = useMutation({
    mutationFn: async (columns: KanbanColumnType[]) => {
      return await KanbanSettingsService.updateColumns(columns);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-settings'] });
      toast.success('Kanban columns updated');
    },
    onError: () => {
      setColumns(previousColumnsRef.current);
      toast.error('Failed to update kanban columns');
    },
  });

  function handleDeleteColumn(columnId: string) {
    const columnToDelete = columns.find(col => col.id === columnId);
    if (columnToDelete && columnToDelete.cards.length > 0) {
      toast.error('Cannot delete column with tasks. Move tasks to another column first.');
      return;
    }

    // Save current state before mutation
    previousColumnsRef.current = JSON.parse(JSON.stringify(columns));

    const updatedColumns = columns.filter(col => col.id !== columnId);
    setColumns(updatedColumns);
    if (kanbanSetting) {
      const updatedKanbanColumns = kanbanSetting.columns.filter(
        (col: KanbanColumnType) => col.id !== columnId
      );

      const reorderedColumns = updatedKanbanColumns.map((col: KanbanColumnType, index: number) => ({
        ...col,
        order: index,
      }));

      updateColumnsMutation.mutate(reorderedColumns);
      toast.success('Column deleted');
    }
  }

  function addNewColumn(newColumnTitle: string) {
    const columnId = newColumnTitle
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/gi, '');
    if (columns.some(col => col.id === columnId)) {
      toast.error('A column with this name already exists');
      return;
    }

    // Save current state before mutation
    previousColumnsRef.current = JSON.parse(JSON.stringify(columns));

    const newColumn: ColumnType = {
      id: columnId,
      title: newColumnTitle,
      cards: [],
    };
    const updatedColumns = [...columns, newColumn];
    setColumns(updatedColumns);
    if (kanbanSetting) {
      const updatedKanbanColumns = [
        ...kanbanSetting.columns,
        {
          id: columnId,
          title: newColumnTitle,
          order: kanbanSetting.columns.length,
        },
      ];

      updateColumnsMutation.mutate(updatedKanbanColumns);
    }

    setOpenColumnCreateModal(false);
  }

  const addTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      const response = await TaskService.createTask(taskData as any);
      return response;
    },
    onSuccess: task => {
      setColumns(prevColumns => {
        const newColumns = [...prevColumns];

        // First try to find a column by exact title match (case-insensitive)
        let columnIndex = newColumns.findIndex(
          col => col.title.toLowerCase() === task.status.toLowerCase()
        );

        // If no match by title, try to match by normalized ID
        if (columnIndex === -1) {
          const normalizedTaskStatus = task.status
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/gi, '');

          // Try to find a column with a matching normalized ID (case-insensitive)
          columnIndex = newColumns.findIndex(col => col.id.toLowerCase() === normalizedTaskStatus);

          // If still no match, try to find a column with a similar ID
          if (columnIndex === -1) {
            // Find the most similar column by comparing normalized IDs
            const similarityScores = newColumns.map(col => {
              const normalizedColId = col.id.toLowerCase();
              // Simple similarity check - if one contains the other
              if (
                normalizedColId.includes(normalizedTaskStatus) ||
                normalizedTaskStatus.includes(normalizedColId)
              ) {
                return true;
              }
              return false;
            });

            columnIndex = similarityScores.findIndex(score => score === true);
          }
        }

        // If still no match, default to the first column
        if (columnIndex === -1 && newColumns.length > 0) {
          columnIndex = 0;
        }

        if (columnIndex !== -1) {
          const card: CardType = {
            id: task._id,
            title: task.name,
            description: task.description || '',
            priority: task.priority as 'Low' | 'Medium' | 'High',
            status: task.status,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
            estimatedTime: task.estimatedTime,
            loggedTime: task.loggedTime,
            assignedTo: task.assignedTo,
            subtasks: task.subtasks,
          };
          newColumns[columnIndex].cards.push(card);
        }

        return newColumns;
      });

      queryClient.invalidateQueries({ queryKey: ['project', project._id] });
    },
  });

  const handleAddTask = async (newTask: Partial<Task>) => {
    try {
      const taskWithProject = {
        ...newTask,
        projectId: project._id,
        name: newTask.name || '',
        title: newTask.name || '',
      };
      const task = await addTaskMutation.mutateAsync(taskWithProject as any);

      toast.success('Task created successfully');
      return task;
    } catch (error) {
      toast.error('Failed to create task');
      throw error;
    }
  };

  if (isLoadingSettings) {
    return <KanbanSkeleton />;
  }
  if (!project || !project.tasks) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h3 className="text-lg font-medium">No project data available</h3>
          <p className="text-gray-500">This project doesn&apos;t have any tasks yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <div className="flex-1 min-h-0 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0 min-w-0 overflow-x-auto overflow-y-auto custom-scrollbar">
            <SortableContext items={columns.map(col => `column-${col.id}`)}>
              <div className="flex gap-2 min-w-max pb-6">
                {columns.map(column => (
                  <div
                    key={column.id}
                    className={`flex-shrink-0`}
                    style={{ width: `${columnWidth}px` }}
                  >
                    <Column
                      column={column}
                      cards={column.cards}
                      isHighlighted={lastDroppedId === `column-${column.id}`}
                      onDeleteColumn={handleDeleteColumn}
                      onAddTask={handleAddTask}
                      loadingAddTask={addTaskMutation.isPending}
                      compactView={compactView}
                      columnWidth={columnWidth}
                      onTaskClick={taskId => {
                        setSelectedTaskId(taskId);
                        setIsSidebarOpen(true);
                      }}
                    />
                  </div>
                ))}

                <div className="flex flex-col items-center justify-center w-16  rounded-md border-2 border-dashed border-gray-200 flex-shrink-0 hover:border-primary/50 hover:bg-gray-50 transition-all duration-300">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 bg-gray-100 hover:bg-primary/10"
                    onClick={() => setOpenColumnCreateModal(true)}
                  >
                    <Plus className="h-5 w-5 text-gray-600" />
                  </Button>
                </div>
              </div>
            </SortableContext>
          </div>
        </div>

        <CreateColumnModal
          isOpen={openColumnCreateModal}
          onClose={() => setOpenColumnCreateModal(false)}
          onCreateColumn={addNewColumn}
          isLoading={updateColumnsMutation.isPending}
        />

        {typeof document !== 'undefined' &&
          createPortal(
            <DragOverlay adjustScale={true} zIndex={100}>
              {activeCard && (
                <Card
                  card={activeCard}
                  isDragging={true}
                  isOverlay={true}
                  compactView={compactView}
                />
              )}
              {activeColumn && (
                <Column
                  column={activeColumn}
                  cards={activeColumn.cards}
                  isDragging={true}
                  onDeleteColumn={handleDeleteColumn}
                  compactView={compactView}
                  columnWidth={columnWidth}
                />
              )}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
      <TaskSidebar
        taskId={selectedTaskId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
