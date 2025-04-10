import React from "react";
import { Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskMetadataProps } from "./types";

const TaskMetadata: React.FC<TaskMetadataProps> = ({ task, renderPriorityBadge }) => {
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {task.tags && task.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            <Tag className="h-3 w-3 mr-1" /> {tag}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
        <div>{renderPriorityBadge(task.priority)}</div>
        {task.projectId && (
          <div className="flex items-center">
            <Badge variant="outline" className="font-normal">
              {task.projectId}
            </Badge>
          </div>
        )}
      </div>
    </>
  );
};

export default TaskMetadata;
