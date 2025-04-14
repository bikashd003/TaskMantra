import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Edit, GripHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Task } from '../types';
import { motion } from 'framer-motion';

interface TaskItemProps {
  task: Task;
  isMultiDayTask: boolean;
  isStartDate: boolean;
  taskDuration: number;
  taskIndex: number;
  onTaskClick: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isMultiDayTask,
  isStartDate,
  taskDuration,
  taskIndex,
  onTaskClick,
  onEditTask,
}) => {
  // Skip if we're not at the start date for multi-day tasks
  // We'll render the entire bar from the start date
  if (isMultiDayTask && !isStartDate) {
    return null;
  }

  // Create separate draggable instances for the main task and resize handles
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      task,
      type: 'move',
    },
  });

  // Create draggable for start date handle
  const {
    attributes: startAttributes,
    listeners: startListeners,
    setNodeRef: setStartNodeRef,
    isDragging: isStartDragging
  } = useDraggable({
    id: `${task.id}-start`,
    data: {
      task,
      type: 'start',
    },
  });

  // Create draggable for end date handle
  const {
    attributes: endAttributes,
    listeners: endListeners,
    setNodeRef: setEndNodeRef,
    isDragging: isEndDragging
  } = useDraggable({
    id: `${task.id}-end`,
    data: {
      task,
      type: 'end',
    },
  });

  // State for hover effect
  const [isHovered, setIsHovered] = useState(false);

  // Get status color
  const getStatusColor = () => {
    switch (task.status) {
      case "To Do":
        return "bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border-slate-300 shadow-sm";
      case "In Progress":
        return "bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 border-blue-300 shadow-sm";
      case "Review":
        return "bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 border-amber-300 shadow-sm";
      case "Completed":
        return "bg-gradient-to-r from-emerald-100 to-emerald-200 hover:from-emerald-200 hover:to-emerald-300 border-emerald-300 shadow-sm";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border-gray-300 shadow-sm";
    }
  };

  // Get initials from assignee
  const getAssigneeInitials = () => {
    if (task.assignedTo && task.assignedTo.length > 0) {
      const user = task.assignedTo[0];
      return user.initials || user.name?.substring(0, 2).toUpperCase() || 'U';
    }
    return 'U';
  };

  // Get avatar color
  const getAvatarColor = () => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500',
      'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const hash = task.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...style,
        top: `${(taskIndex * 26) + 32}px`,
        left: isMultiDayTask ? 0 : '4px',
        width: isMultiDayTask ? `calc(${taskDuration * 100}% - 2px)` : 'calc(100% - 8px)',
        zIndex: isMultiDayTask ? 10 + taskIndex : 5,
        position: 'absolute',
      }}
      className={cn(
        "h-6 rounded-md border text-xs flex items-center overflow-hidden cursor-pointer transition-all duration-200 task-card",
        getStatusColor(),
        isMultiDayTask ? "z-10" : "mx-1",
        isDragging || isStartDragging || isEndDragging ? "task-dragging" : ""
      )}
      onClick={(e) => {
        e.stopPropagation();
        onTaskClick(task.id);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -1, boxShadow: '0 3px 10px rgba(0,0,0,0.1)' }}
      animate={{
        scale: isDragging || isStartDragging || isEndDragging ? 1.02 : 1,
        opacity: isDragging || isStartDragging || isEndDragging ? 0.8 : 1
      }}
      transition={{ duration: 0.2 }}
      {...attributes}
      {...listeners}
    >
      {/* Task content */}
      <div className="flex items-center h-full w-full px-2">
        {/* Assignee avatar */}
        <div className="flex-shrink-0 mr-1.5">
          <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-sm", getAvatarColor())}>
            {getAssigneeInitials()}
          </div>
        </div>

        {/* Task name */}
        <span className="truncate flex-grow font-medium">{task.name}</span>

        {/* Edit button - only show on hover */}
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 ml-auto hover:bg-white/50 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onEditTask(task);
          }}
        >
          <Edit className="h-2.5 w-2.5" />
        </Button>
      </div>

      {/* Resize handles for multi-day tasks */}
      {isMultiDayTask && (
        <>
          {/* Start date resize handle */}
          <div
            ref={setStartNodeRef}
            className={cn(
              "task-resize-handle task-resize-handle-start",
              isHovered || isStartDragging ? "opacity-100" : ""
            )}
            {...startAttributes}
            {...startListeners}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full flex items-center justify-center">
              <GripHorizontal className="h-3 w-3 text-blue-500" />
            </div>
          </div>

          {/* End date resize handle */}
          <div
            ref={setEndNodeRef}
            className={cn(
              "task-resize-handle task-resize-handle-end",
              isHovered || isEndDragging ? "opacity-100" : ""
            )}
            {...endAttributes}
            {...endListeners}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full flex items-center justify-center">
              <GripHorizontal className="h-3 w-3 text-blue-500" />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default TaskItem;
