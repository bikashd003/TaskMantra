import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Task } from '../types';

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

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      task,
      type: 'move',
    },
  });

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
    <div
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
        isDragging ? "task-dragging" : ""
      )}
      onClick={(e) => {
        e.stopPropagation();
        onTaskClick(task.id);
      }}
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

      {/* Resize handles for multi-day tasks will be handled separately */}
    </div>
  );
};

export default TaskItem;
