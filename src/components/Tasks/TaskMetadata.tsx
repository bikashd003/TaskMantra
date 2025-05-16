import React from 'react';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TaskMetadataProps } from './types';

const TaskMetadata: React.FC<TaskMetadataProps> = ({ task, renderPriorityBadge }) => {
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4"></div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
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
