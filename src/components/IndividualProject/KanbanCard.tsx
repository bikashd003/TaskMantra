'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { CardType } from './ProjectKanban';

interface CardProps {
  card: CardType;
  isDragging?: boolean;
  isOverlay?: boolean;
  compactView?: boolean;
}

export function Card({
  card,
  isDragging = false,
  isOverlay = false,
  compactView = false,
}: CardProps) {
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

  // Check if due date is overdue
  const isOverdue = () => {
    if (!card.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(card.dueDate);
    return dueDate < today;
  };

  // Prevent drag handling for certain elements
  const preventDragHandling = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${currentlyDragging ? 'z-50' : ''}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={currentlyDragging ? 'opacity-50' : ''}
      >
        <UICard
          className={`shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
            isOverlay
              ? 'border-primary border-2 ring-2 ring-primary shadow-xl'
              : currentlyDragging
                ? 'border-primary border-2 opacity-70'
                : ''
          } ${card.status === 'Completed' ? 'bg-gray-50' : ''}`}
        >
          <CardHeader className={`${compactView ? 'p-2 pb-0' : 'p-3 pb-0'}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CardTitle
                        className={`${compactView ? 'text-xs' : 'text-sm'} font-medium ${card.status === 'Completed' ? 'text-gray-500' : ''} truncate max-w-[160px] cursor-default`}
                      >
                        {card.status === 'Completed' && (
                          <CheckCircle2
                            className={`${compactView ? 'h-3 w-3' : 'h-4 w-4'} text-green-500 inline mr-1`}
                          />
                        )}
                        {card.title}
                      </CardTitle>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{card.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div onClick={preventDragHandling} className="cursor-default">
                <span
                  className={`${compactView ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'} rounded-full hover:scale-105 transition-transform ${
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
            </div>
          </CardHeader>

          <CardContent className={`${compactView ? 'p-2 pt-1' : 'p-3 pt-2'}`}>
            {/* Description if available - only show in non-compact view */}
            {!compactView && card.description && (
              <p className="text-sm text-gray-600 mb-2">{card.description}</p>
            )}

            {/* Due date and priority */}
            {(!compactView || dueDate) && (
              <div className="flex justify-between items-center mb-2">
                {dueDate && (
                  <div className="flex items-center cursor-default" onClick={preventDragHandling}>
                    <Calendar
                      className={`h-3 w-3 mr-1 ${isOverdue() ? 'text-red-500' : 'text-muted-foreground'}`}
                    />
                    <span
                      className={`text-xs ${isOverdue() ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}
                    >
                      {isOverdue() ? 'Overdue: ' : ''}
                      {dueDate}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Progress bar if available - only in non-compact view */}
            {!compactView && progress !== null && (
              <div className="mb-2 cursor-default" onClick={preventDragHandling}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {card.loggedTime}h/{card.estimatedTime}h
                  </span>
                </div>
                <Progress value={progress} className="h-1" />
              </div>
            )}

            {/* Assigned users - show in both views but with different styling */}
            {card.assignedTo && card.assignedTo.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2 cursor-default" onClick={preventDragHandling}>
                  {card.assignedTo.slice(0, compactView ? 2 : 3).map((user, index) => (
                    <Avatar
                      key={index}
                      className={`${compactView ? 'h-5 w-5' : 'h-6 w-6'} border-2 border-background`}
                    >
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="text-xs">{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ))}
                  {card.assignedTo.length > (compactView ? 2 : 3) && (
                    <Avatar
                      className={`${compactView ? 'h-5 w-5' : 'h-6 w-6'} border-2 border-background`}
                    >
                      <AvatarFallback className="text-xs">
                        +{card.assignedTo.length - (compactView ? 2 : 3)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </UICard>
      </motion.div>
    </div>
  );
}
