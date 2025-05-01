'use client';

import { useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KanbanSettingsService, KanbanColumn } from '@/services/KanbanSettings.service';
import { toast } from 'sonner';
import { TaskService } from '@/services/Task.service';
import { KanbanSkeleton } from './KanbanSkeleton';

// Types
export type CardType = {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
  dueDate?: string;
  estimatedTime?: number;
  loggedTime?: number;
  assignedTo?: any[];
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
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [lastDroppedId, setLastDroppedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

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
    onError: () => {
      toast.error('Failed to update task status');
    },
  });

  useEffect(() => {
    if (kanbanSetting && project) {
      const initialColumns: ColumnType[] = kanbanSetting.columns
        .sort((a, b) => a.order - b.order)
        .map(column => ({
          id: column.id,
          title: column.title,
          cards: [],
          isLocked: column.id === 'completed',
        }));

      if (project.tasks && project.tasks.length > 0) {
        project.tasks.forEach(task => {
          const columnId = task.status.toLowerCase().replace(/\s+/g, '');
          const columnIndex = initialColumns.findIndex(col => col.id === columnId);

          if (columnIndex !== -1) {
            const card: CardType = {
              id: task._id,
              title: task.name,
              description: task.description || '',
              priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high',
              status: task.status,
              dueDate: task.dueDate,
              estimatedTime: task.estimatedTime,
              loggedTime: task.loggedTime,
              assignedTo: task.assignedTo,
            };

            initialColumns[columnIndex].cards.push(card);
          }
        });
      }

      setColumns(initialColumns);
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

    if (activeId.includes('column')) {
      const columnId = activeId.replace('column-', '');
      const activeColumn = columns.find(col => col.id === columnId);

      if (activeColumn?.isLocked) {
        return;
      }

      if (activeColumn) setActiveColumn(activeColumn);
      return;
    }

    const card = findCardById(activeId);
    if (card) setActiveCard(card);
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
      setLastDroppedId(active.id as string);

      setTimeout(() => {
        setLastDroppedId(null);
      }, 1000);
    }

    setActiveColumn(null);
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;
    if (activeId.includes('column') && overId.includes('column')) {
      const activeColumnId = activeId.replace('column-', '');
      const overColumnId = overId.replace('column-', '');
      // Find the columns
      const activeColumn = columns.find(col => col.id === activeColumnId);
      const overColumn = columns.find(col => col.id === overColumnId);
      if (activeColumn?.isLocked || overColumn?.isLocked) return;

      const activeIndex = columns.findIndex(col => col.id === activeColumnId);
      const overIndex = columns.findIndex(col => col.id === overColumnId);

      if (activeIndex !== -1 && overIndex !== -1) {
        const reorderedColumns = arrayMove(columns, activeIndex, overIndex);
        setColumns(reorderedColumns);

        if (kanbanSetting) {
          const updatedKanbanColumns = kanbanSetting.columns.map(col => {
            const newIndex = reorderedColumns.findIndex(c => c.id === col.id);
            return {
              ...col,
              order: newIndex !== -1 ? newIndex : col.order,
            };
          });

          updateColumnsMutation.mutate(updatedKanbanColumns);
        }
      }
    } else if (!activeId.includes('column') && overId.includes('column')) {
      const sourceColumn = findColumnByCardId(activeId);
      const targetColumnId = overId.replace('column-', '');
      const targetColumn = columns.find(col => col.id === targetColumnId);

      if (sourceColumn && targetColumn && sourceColumn.id !== targetColumn.id) {
        const card = findCardById(activeId);
        if (card) {
          updateTaskStatus.mutate({
            taskId: activeId,
            newStatus: targetColumn.title,
          });
        }
      }
    } else if (!activeId.includes('column') && !overId.includes('column')) {
      const sourceColumn = findColumnByCardId(activeId);
      const targetColumn = findColumnByCardId(overId);

      if (sourceColumn && targetColumn && sourceColumn.id !== targetColumn.id) {
        const card = findCardById(activeId);
        if (card) {
          updateTaskStatus.mutate({
            taskId: activeId,
            newStatus: targetColumn.title,
          });
        }
      }
    }
  }
  const updateColumnsMutation = useMutation({
    mutationFn: async (columns: KanbanColumn[]) => {
      return await KanbanSettingsService.updateColumns(columns);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-settings'] });
      toast.success('Kanban columns updated');
    },
    onError: () => {
      toast.error('Failed to update kanban columns');
    },
  });

  function handleDeleteColumn(columnId: string) {
    const columnToDelete = columns.find(col => col.id === columnId);
    if (columnToDelete && columnToDelete.cards.length > 0) {
      toast.error('Cannot delete column with tasks. Move tasks to another column first.');
      return;
    }

    const updatedColumns = columns.filter(col => col.id !== columnId);
    setColumns(updatedColumns);
    if (kanbanSetting) {
      const updatedKanbanColumns = kanbanSetting.columns.filter(col => col.id !== columnId);

      const reorderedColumns = updatedKanbanColumns.map((col, index) => ({
        ...col,
        order: index,
      }));

      updateColumnsMutation.mutate(reorderedColumns);
      toast.success('Column deleted');
    }
  }

  function addNewColumn() {
    if (!newColumnTitle.trim()) return;
    const columnId = newColumnTitle.toLowerCase().replace(/\s+/g, '-');
    if (columns.some(col => col.id === columnId)) {
      toast.error('A column with this name already exists');
      return;
    }
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

    setNewColumnTitle('');
  }

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
              <div className="flex gap-6 min-w-max pb-6">
                {columns.map(column => (
                  <div key={column.id} className="flex-shrink-0 w-[300px]">
                    <Column
                      column={column}
                      cards={column.cards}
                      isHighlighted={lastDroppedId === `column-${column.id}`}
                      onDeleteColumn={handleDeleteColumn}
                    />
                  </div>
                ))}

                <div className="flex flex-col items-center justify-center w-16 min-h-[300px] h-[500px] rounded-md border-2 border-dashed border-gray-200 flex-shrink-0 hover:border-primary/50 hover:bg-gray-50 transition-all duration-300">
                  <div className="relative group">
                    {newColumnTitle ? (
                      <div className="absolute bottom-full mb-2 w-64 bg-white shadow-lg rounded-md p-3 border border-gray-200 z-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Add New Column</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setNewColumnTitle('')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          type="text"
                          placeholder="Column name"
                          value={newColumnTitle}
                          onChange={e => setNewColumnTitle(e.target.value)}
                          className="mb-2"
                        />
                        <Button onClick={addNewColumn} size="sm" className="w-full">
                          Add Column
                        </Button>
                      </div>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-10 w-10 bg-gray-100 hover:bg-primary/10"
                      onClick={() => setNewColumnTitle(newColumnTitle ? '' : 'New Column')}
                    >
                      <Plus className="h-5 w-5 text-gray-600" />
                    </Button>
                  </div>
                </div>
              </div>
            </SortableContext>
          </div>
        </div>

        {typeof document !== 'undefined' &&
          createPortal(
            <DragOverlay adjustScale={true} zIndex={100}>
              {activeCard && <Card card={activeCard} isDragging={true} />}
              {activeColumn && (
                <Column
                  column={activeColumn}
                  cards={activeColumn.cards}
                  isDragging={true}
                  onDeleteColumn={handleDeleteColumn}
                />
              )}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </div>
  );
}
