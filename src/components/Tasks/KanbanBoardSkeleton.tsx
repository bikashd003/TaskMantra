import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface KanbanBoardSkeletonProps {
  columnCount?: number;
  tasksPerColumn?: number;
}

const KanbanBoardSkeleton: React.FC<KanbanBoardSkeletonProps> = ({
  columnCount = 5,
  tasksPerColumn = 3,
}) => {
  return (
    <div className="flex space-x-4 min-w-max pb-4">
      {Array.from({ length: columnCount }).map((_, colIndex) => (
        <div
          key={colIndex}
          className="flex flex-col space-y-3"
          style={{
            width: '300px',
            minWidth: '220px',
            flex: '0 0 auto',
          }}
        >
          {/* Column content - only tasks are skeletons */}
          <div className="flex-1 rounded-lg border border-gray-200 p-2">
            {Array.from({ length: tasksPerColumn }).map((_, taskIndex) => (
              <Skeleton key={taskIndex} className="h-24 w-full rounded-lg mb-3" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoardSkeleton;
