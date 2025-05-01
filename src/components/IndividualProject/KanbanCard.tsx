'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import type { CardType } from './ProjectKanban';

interface CardProps {
  card: CardType;
  isDragging?: boolean;
}

export function Card({ card, isDragging = false }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const currentlyDragging = isDragging || isSortableDragging;

  // Format date if available
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculate progress if estimatedTime and loggedTime are available
  const calculateProgress = () => {
    if (!card.estimatedTime || card.estimatedTime <= 0) return null;
    const progress = Math.min(Math.round(((card.loggedTime || 0) / card.estimatedTime) * 100), 100);
    return progress;
  };

  const progress = calculateProgress();
  const dueDate = formatDate(card.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-grab
        ${
          currentlyDragging
            ? 'opacity-80 shadow-xl scale-105 rotate-1 border-2 border-primary/50 z-10'
            : 'hover:shadow-md hover:-translate-y-1'
        }
        transition-all duration-300 ease-out`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-800">{card.title}</h4>
        <span
          className={`text-xs px-2 py-1 rounded-full hover:scale-105 transition-transform ${
            card.priority === 'high'
              ? 'bg-red-100 text-red-800'
              : card.priority === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
          }`}
        >
          {card.priority}
        </span>
      </div>

      {card.description && <p className="text-sm text-gray-600 mb-2">{card.description}</p>}

      {/* Show assignees if available */}
      {card.assignedTo && card.assignedTo.length > 0 && (
        <div className="flex items-center mt-2 mb-2">
          <div className="flex -space-x-2 overflow-hidden">
            {card.assignedTo.slice(0, 3).map((user, index) => (
              <div
                key={index}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white relative overflow-hidden"
              >
                <Image
                  src={user.image || 'https://via.placeholder.com/24'}
                  alt={user.name || 'User'}
                  title={user.name || 'User'}
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </div>
            ))}
            {card.assignedTo.length > 3 && (
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-xs font-medium text-gray-800 ring-2 ring-white">
                +{card.assignedTo.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Show progress bar if available */}
      {progress !== null && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{card.loggedTime}h</span>
            <span>{card.estimatedTime}h</span>
          </div>
        </div>
      )}

      {/* Show due date if available */}
      {dueDate && (
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <span className="mr-1">Due:</span>
          <span className="font-medium">{dueDate}</span>
        </div>
      )}
    </div>
  );
}
