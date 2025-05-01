'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from './KanbanCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { CardType, ColumnType } from './ProjectKanban';
import { Lock, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  isDragging?: boolean;
  isHighlighted?: boolean;
  onDeleteColumn?: (columnId: string) => void;
}

export function Column({
  column,
  cards,
  isDragging = false,
  isHighlighted = false,
  onDeleteColumn,
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const currentlyDragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col bg-white rounded-lg w-80 h-full flex-shrink-0 shadow-md hover:shadow-lg transition-all duration-300
        ${
          currentlyDragging
            ? 'opacity-70 border-2 border-dashed border-primary shadow-2xl z-50'
            : isHighlighted
              ? 'ring-2 ring-primary/50 shadow-lg'
              : ''
        }
        ${
          column.isLocked
            ? 'border-l-4 border-l-gray-400'
            : 'hover:border-l-4 hover:border-l-primary/30 transition-all duration-300'
        }
        ease-out border border-gray-200`}
    >
      <div
        {...(column.isLocked ? {} : { ...attributes, ...listeners })}
        className={`p-3 font-bold text-gray-700 bg-gray-50 rounded-t-lg flex items-center justify-between
          ${column.isLocked ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
          transition-all duration-200 border-b border-gray-200 sticky top-0 z-10`}
      >
        <div className="flex items-center">
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
          <h3>{column.title}</h3>
          {column.isLocked && <Lock className="h-4 w-4 ml-2 text-gray-500" />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium bg-gray-200 px-2 py-1 rounded-full">
            {cards.length}
          </span>

          {!column.isLocked && onDeleteColumn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 p-0 hover:bg-gray-200 rounded-full"
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
                rounded-md transition-all duration-300 hover:border-primary/30 hover:bg-gray-50`}
            >
              <p className="text-gray-500 text-sm">Drop cards here</p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
