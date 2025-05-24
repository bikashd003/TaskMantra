'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from './KanbanCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { CardType, ColumnType } from './ProjectKanban';
import { Lock, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KanbanColumn as KanbanColumnType } from '@/services/KanbanSettings.service';
import { useState } from 'react';
import QuickTaskCreateForm from './QuickTaskCreateForm';
import { Task } from '../Tasks/types';
interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  isDragging?: boolean;
  isHighlighted?: boolean;
  onDeleteColumn?: (columnId: string) => void;
  onAddTask?: (task: Partial<Task>) => void;
  loadingAddTask?: boolean;
  compactView?: boolean;
  columnWidth?: number;
  onTaskClick?: (taskId: string) => void;
}
type ColumnDefinition = KanbanColumnType;

const defaultColumns: ColumnDefinition[] = [
  { id: 'todo', title: 'To Do', order: 0 },
  { id: 'inProgress', title: 'In Progress', order: 1 },
  { id: 'review', title: 'Review', order: 2 },
  { id: 'completed', title: 'Completed', order: 3 },
];

export function Column({
  column,
  cards,
  isDragging = false,
  isHighlighted = false,
  onDeleteColumn,
  onAddTask,
  loadingAddTask = false,
  compactView = false,
  columnWidth = 300,
  onTaskClick,
}: ColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      column,
    },
    disabled: column.isLocked,
  });
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [assignedTo, setAssignedTo] = useState([]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddTask = async () => {
    if (!newTaskName.trim() || !onAddTask) return;

    const newTask: Partial<Task> = {
      name: newTaskName.trim(),
      status: column.title as any,
      priority: 'Medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      subtasks: [],
      assignedTo: assignedTo.map((user: any) => user.value),
      comments: [],
      dependencies: [],
    };
    onAddTask(newTask);
    setNewTaskName('');
    setIsAddingTask(false);
  };

  const currentlyDragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col select-none theme-surface-elevated rounded-lg theme-shadow-md hover-reveal theme-transition
        ${
          currentlyDragging
            ? 'opacity-70 scale-105 z-50 rotate-1 theme-shadow-lg'
            : isHighlighted
              ? 'ring-2 ring-primary/50 theme-shadow-lg'
              : ''
        }
        ease-out border border-border`}
      style={{
        ...style,
        width: `${columnWidth}px`,
        minWidth: compactView ? '180px' : '220px',
        flex: '0 0 auto',
        height: compactView ? 'calc(100vh - 16rem)' : 'calc(100vh - 14rem)',
        borderTop: `4px solid ${
          column.id === 'todo'
            ? 'hsl(var(--theme-text-secondary))'
            : column.id === 'inprogress' || column.id === 'inProgress'
              ? 'hsl(var(--primary))'
              : column.id === 'review'
                ? 'hsl(var(--warning))'
                : column.id === 'completed'
                  ? 'hsl(var(--success))'
                  : 'hsl(var(--theme-text-secondary))'
        }`,
        transformOrigin: 'center',
      }}
    >
      <div
        {...(column.isLocked ? {} : { ...attributes, ...listeners })}
        className={`flex items-center justify-between sticky top-0 backdrop-blur-sm theme-surface/95 z-10 py-3 px-4 mb-3 rounded-t-lg border-b border-border ${column.isLocked ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <div className="font-medium flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              column.id === 'todo'
                ? 'status-indicator-todo'
                : column.id === 'inprogress'
                  ? 'status-indicator-in-progress'
                  : column.id === 'review'
                    ? 'bg-warning'
                    : column.id === 'completed'
                      ? 'status-indicator-completed'
                      : 'bg-muted'
            }`}
          />
          <span className="font-semibold theme-text-primary">{column.title}</span>
          <span className="ml-2 bg-muted theme-text-secondary font-medium text-xs px-2 py-1 rounded-full">
            {cards.length}
          </span>
          {column.isLocked && <Lock className="h-4 w-4 ml-2 theme-text-secondary" />}
        </div>
        <div className="flex items-center space-x-1">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 theme-button-ghost theme-transition"
              title="Add task"
              onClick={() => setIsAddingTask(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </motion.div>
          {!column.isLocked &&
            onDeleteColumn &&
            !defaultColumns.some(col => col.id === column.id) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 p-0 theme-button-ghost rounded-full theme-transition"
                  >
                    <MoreVertical className="h-4 w-4 theme-text-secondary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="theme-surface-elevated border-border">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer theme-transition"
                    onClick={() => onDeleteColumn(column.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Column
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
        </div>
      </div>
      {isAddingTask && (
        <QuickTaskCreateForm
          setIsAddingTask={setIsAddingTask}
          newTaskName={newTaskName}
          setNewTaskName={setNewTaskName}
          handleAddTask={handleAddTask}
          loadingAddTask={loadingAddTask}
          assignedTo={assignedTo}
          setAssignedTo={setAssignedTo}
        />
      )}

      <div className="flex-grow p-2 overflow-y-auto scrollbar-custom scrollbar-dark">
        <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          {cards.length > 0 ? (
            <div className="flex flex-col gap-2">
              {cards.map(card => (
                <Card key={card.id} card={card} onClick={onTaskClick} />
              ))}
            </div>
          ) : (
            <div
              className={`flex items-center justify-center h-20 border-2 border-dashed
                ${currentlyDragging ? 'border-primary/30 theme-surface' : 'border-border'}
                rounded-md theme-transition hover:border-primary/30 hover:theme-surface mx-3 mb-4`}
            >
              <p className="theme-text-secondary text-sm">Drop cards here</p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
