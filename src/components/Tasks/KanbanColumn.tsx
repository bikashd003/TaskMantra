import React from "react";
import { Badge } from "@/components/ui/badge";
import { KanbanColumnProps } from "./types";
import KanbanCard from "./KanbanCard";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface ExtendedKanbanColumnProps extends KanbanColumnProps {
  id: string;
  onTaskClick?: (taskId: string) => void;
}

const KanbanColumn: React.FC<ExtendedKanbanColumnProps> = ({
  id,
  title,
  tasks,
  onStatusChange,
  onDelete,
  renderPriorityBadge,
  onTaskClick,
}) => {
  // Set up droppable area for the column
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  // Get status color
  const getStatusColor = () => {
    switch (title) {
      case "To Do":
        return "bg-slate-400";
      case "In Progress":
        return "bg-blue-500";
      case "Review":
        return "bg-amber-500";
      case "Completed":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center">
          <span
            className={`h-2 w-2 rounded-full mr-2 ${getStatusColor()}`}
          ></span>
          {title}
          <Badge variant="secondary" className="ml-2">
            {tasks.length}
          </Badge>
        </h3>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`min-h-[200px] rounded-lg transition-colors ${isOver ? 'bg-primary/5 border-2 border-dashed border-primary/30' : 'border border-dashed border-gray-200'}`}
      >
        {tasks.length === 0 ? (
          <div className="h-full p-4 flex items-center justify-center text-center text-muted-foreground text-sm">
            Drop tasks here
          </div>
        ) : (
            <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3 p-2">
                {tasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                    renderPriorityBadge={renderPriorityBadge}
                  onClick={() => onTaskClick?.(task.id)}
                />
              ))}
              </div>
            </SortableContext>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
