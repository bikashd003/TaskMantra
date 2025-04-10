import React,{JSX} from "react";
import { Task, TaskPriority, TaskStatus } from "./types";
import TaskCard from "./TaskCard";
import EmptyState from "./EmptyState";
import { Skeleton } from "@heroui/skeleton";

interface TaskListProps {
  tasks: Task[];
  searchQuery: string;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  renderPriorityBadge: (priority: TaskPriority) => JSX.Element;
  onCreateTask: () => void;
  isLoading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  searchQuery,
  onStatusChange,
  onDelete,
  renderPriorityBadge,
  onCreateTask,
  isLoading,
}) => {
  if (tasks.length === 0) {
    return <EmptyState searchQuery={searchQuery} onCreateTask={onCreateTask} />;
  }
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
          </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          renderPriorityBadge={renderPriorityBadge}
        />
      ))}
    </div>
  );
};

export default TaskList;
