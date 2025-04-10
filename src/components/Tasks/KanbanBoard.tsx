import React,{JSX} from "react";
import { Task, TaskPriority, TaskStatus } from "./types";
import KanbanColumn from "./KanbanColumn";
import { Skeleton } from "@heroui/skeleton";


interface KanbanBoardProps {
  tasks: {
    todo: Task[];
    inProgress: Task[];
    completed: Task[];
  };
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  renderPriorityBadge: (priority: TaskPriority) => JSX.Element;
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
