import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskBoardSkeletonProps {
  viewMode?: 'list' | 'kanban' | 'calendar' | 'dependencies';
}

const TaskBoardSkeleton: React.FC<TaskBoardSkeletonProps> = ({ viewMode = 'list' }) => {
  return (
    <div className="space-y-6 w-full">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Statistics skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>

      {/* Controls skeleton */}
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between w-full">
        <Skeleton className="h-10 w-96 rounded-md" />
        <Skeleton className="h-10 w-full md:w-72 rounded-md" />
      </div>

      {/* Content skeleton based on view mode */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-8 w-32 mb-2" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      )}

      {viewMode === 'dependencies' && <Skeleton className="h-[600px] w-full rounded-lg" />}
    </div>
  );
};

export default TaskBoardSkeleton;
