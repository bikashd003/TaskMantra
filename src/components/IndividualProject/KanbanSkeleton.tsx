'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function KanbanSkeleton() {
  // Create an array of 4 columns for the skeleton
  const columns = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className="h-[calc(100vh-12rem)] overflow-hidden flex flex-col">
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
        <div className="flex gap-6 h-full p-4 pb-6 min-w-max">
          {columns.map(index => (
            <div
              key={index}
              className="flex flex-col bg-white rounded-lg w-80 min-h-[300px] h-[500px] flex-shrink-0 shadow-sm border border-gray-100"
            >
              {/* Column header */}
              <div className="p-3 bg-gray-50 rounded-t-lg flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-8 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>

              {/* Column content */}
              <div className="flex-grow p-2 overflow-y-auto custom-scrollbar h-full">
                <div className="flex flex-col gap-2">
                  {/* Generate 3-5 card skeletons per column with varying heights */}
                  {Array.from({ length: 3 + Math.floor(Math.random() * 3) }, (_, cardIndex) => (
                    <Skeleton key={cardIndex} className="w-full h-[80px] rounded-md" />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Add column button skeleton */}
          <div className="flex flex-col items-center justify-center w-16 min-h-[300px] h-[500px] rounded-md border-2 border-dashed border-gray-200 flex-shrink-0">
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
