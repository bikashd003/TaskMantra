import React from "react";
import { Badge } from "@/components/ui/badge";
import { KanbanColumnProps } from "./types";
import KanbanCard from "./KanbanCard";

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  tasks,
  onStatusChange,
  onDelete,
  renderPriorityBadge,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center">
          <span
            className={`h-2 w-2 rounded-full mr-2 ${
              title === "To Do"
                ? "bg-slate-400"
                : title === "In Progress"
                ? "bg-blue-500"
                : "bg-green-500"
            }`}
          ></span>
          {title}
          <Badge variant="secondary" className="ml-2">
            {tasks.length}
          </Badge>
        </h3>
      </div>

      {tasks.length === 0 ? (
        <div className="border border-dashed rounded-lg p-4 text-center text-muted-foreground text-sm">
          No tasks
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              renderPriorityBadge={renderPriorityBadge}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default KanbanColumn;
