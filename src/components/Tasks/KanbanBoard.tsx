import React from "react";
import { Task, TaskPriority, TaskStatus } from "./types";
import KanbanColumn from "./KanbanColumn";
import { Skeleton } from "@/components/ui/skeleton";


interface KanbanBoardProps {
  tasks: {
    todo: Task[];
    inProgress: Task[];
    review?: Task[];
    completed: Task[];
  };
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  renderPriorityBadge: (priority: TaskPriority) => React.ReactNode;
  isLoading?: boolean;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onStatusChange,
  onDelete,
  renderPriorityBadge,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <KanbanColumn
        title="To Do"
        tasks={tasks.todo}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        renderPriorityBadge={renderPriorityBadge}
      />
      <KanbanColumn
        title="In Progress"
        tasks={tasks.inProgress}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        renderPriorityBadge={renderPriorityBadge}
      />
      <KanbanColumn
        title="Review"
        tasks={tasks.review || []}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        renderPriorityBadge={renderPriorityBadge}
      />
      <KanbanColumn
        title="Completed"
        tasks={tasks.completed}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        renderPriorityBadge={renderPriorityBadge}
      />
    </div>
  );
};

export default KanbanBoard;
