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
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default due date (1 week from now)
      subtasks: [],
      assignedTo: [],
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
      className={`flex flex-col select-none bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300
        ${
          currentlyDragging
            ? 'opacity-70 scale-105 z-50 rotate-1 shadow-xl'
            : isHighlighted
              ? 'ring-2 ring-primary/50 shadow-lg'
              : ''
        }
        ease-out border border-gray-200`}
      style={{
        ...style,
        width: '280px',
        minWidth: '220px',
        flex: '0 0 auto',
        height: 'calc(100vh - 14rem)',
        borderTop: `4px solid ${
          column.id === 'todo'
            ? '#94a3b8'
            : column.id === 'inprogress'
              ? '#3b82f6'
              : column.id === 'review'
                ? '#f59e0b'
                : column.id === 'completed'
                  ? '#22c55e'
                  : '#94a3b8'
        }`,
        transformOrigin: 'center',
      }}
    >
      <div
        {...(column.isLocked ? {} : { ...attributes, ...listeners })}
        className={`flex items-center justify-between sticky top-0 backdrop-blur-sm bg-white/95 z-10 py-3 px-4 mb-3 rounded-t-lg border-b ${column.isLocked ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <div className="font-medium flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              column.id === 'todo'
                ? 'bg-blue-400'
                : column.id === 'inprogress'
                  ? 'bg-amber-400'
                  : column.id === 'review'
                    ? 'bg-purple-400'
                    : column.id === 'completed'
                      ? 'bg-green-400'
                      : 'bg-gray-400'
            }`}
          />
          <span className="font-semibold text-gray-800">{column.title}</span>
          <span className="ml-2 bg-gray-100 text-gray-700 font-medium text-xs px-2 py-1 rounded-full">
            {cards.length}
          </span>
          {column.isLocked && <Lock className="h-4 w-4 ml-2 text-gray-500" />}
        </div>
        <div className="flex items-center space-x-1">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
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
                    className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 cursor-pointer"
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
        />
      )}

      <div className="flex-grow p-2 overflow-y-auto custom-scrollbar">
        <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          {cards.length > 0 ? (
            <div className="flex flex-col gap-2">
              {cards.map(card => (
                <Card key={card.id} card={card} />
              ))}
            </div>
          ) : (
            <div
              className={`flex items-center justify-center h-20 border-2 border-dashed
                ${currentlyDragging ? 'border-primary/30 bg-gray-50' : 'border-gray-200'}
                rounded-md transition-all duration-300 hover:border-primary/30 hover:bg-gray-50 mx-3 mb-4`}
            >
              <p className="text-gray-500 text-sm">Drop cards here</p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
