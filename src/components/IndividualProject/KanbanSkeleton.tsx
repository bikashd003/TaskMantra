'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function KanbanSkeleton() {
  const columns = Array.from({ length: 4 }, (_, i) => i);

  // Column configurations to match real kanban columns
  const columnConfigs = [
    { id: 'todo', borderColor: 'hsl(var(--theme-text-secondary))' },
    { id: 'inprogress', borderColor: 'hsl(var(--primary))' },
    { id: 'review', borderColor: 'hsl(var(--warning))' },
    { id: 'completed', borderColor: 'hsl(var(--success))' },
  ];

  const TaskCardSkeleton = ({ compactView = false }: { compactView?: boolean }) => (
    <div className="theme-surface-elevated rounded-lg border border-border shadow-sm hover:shadow-md transition-all">
      {/* Card Header */}
      <div className={`${compactView ? 'p-2 pb-0' : 'p-3 pb-0'}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="h-4 w-4 rounded-full loading-skeleton" />
            <Skeleton className={`${compactView ? 'h-4 w-20' : 'h-5 w-32'} loading-skeleton`} />
          </div>
          <Skeleton className="h-4 w-4 rounded loading-skeleton" />
        </div>
      </div>

      {/* Card Content */}
      <div className={`${compactView ? 'p-2 pt-1' : 'p-3 pt-2'}`}>
        {/* Description - only in non-compact view */}
        {!compactView && <Skeleton className="h-3 w-full mb-2 loading-skeleton" />}

        {/* Due date and priority */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3 loading-skeleton" />
            <Skeleton className="h-3 w-16 loading-skeleton" />
          </div>
        </div>

        {/* Progress bar - only in non-compact view */}
        {!compactView && (
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <Skeleton className="h-3 w-12 loading-skeleton" />
              <Skeleton className="h-3 w-8 loading-skeleton" />
            </div>
            <Skeleton className="h-1 w-full rounded-full loading-skeleton" />
          </div>
        )}

        {/* Assigned users */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {Array.from({ length: compactView ? 2 : 3 }, (_, i) => (
              <Skeleton
                key={i}
                className={`${compactView ? 'h-5 w-5' : 'h-6 w-6'} rounded-full loading-skeleton border-2 border-background`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const QuickTaskFormSkeleton = () => (
    <div className="px-2 py-1 mx-3 mb-2 border border-border rounded-xl bg-card/95 backdrop-blur-md shadow-lg relative">
      <Skeleton className="h-7 w-7 rounded-full loading-skeleton absolute top-[-0.5rem] right-[-0.5rem]" />
      <Skeleton className="h-9 w-full my-2 rounded loading-skeleton" />
      <Skeleton className="h-9 w-full mb-2 rounded loading-skeleton" />
      <div className="flex justify-end space-x-3 pt-1">
        <Skeleton className="h-8 w-16 rounded loading-skeleton" />
        <Skeleton className="h-8 w-20 rounded loading-skeleton" />
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-12rem)] overflow-hidden flex flex-col theme-surface">
      <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-custom scrollbar-dark">
        <div className="flex gap-6 h-full p-4 pb-6 min-w-max">
          {columns.map(index => {
            const config = columnConfigs[index] || columnConfigs[0];
            const cardCount = 2 + Math.floor(Math.random() * 4); // 2-5 cards
            const showQuickForm = Math.random() > 0.7; // 30% chance to show form
            const isEmpty = Math.random() > 0.8; // 20% chance to be empty

            return (
              <div
                key={index}
                className="flex flex-col theme-surface-elevated rounded-lg w-80 min-h-[300px] h-[calc(100vh-14rem)] flex-shrink-0 theme-shadow-sm border border-border"
                style={{
                  borderTop: `4px solid ${config.borderColor}`,
                  width: '300px',
                  minWidth: '220px',
                  flex: '0 0 auto',
                }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between sticky top-0 backdrop-blur-sm theme-surface/95 z-10 py-3 px-4 mb-3 rounded-t-lg border-b border-border">
                  <div className="font-medium flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: config.borderColor }}
                    />
                    <Skeleton className="h-6 w-20 loading-skeleton" />
                    <Skeleton className="h-5 w-6 rounded-full ml-2 loading-skeleton" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <Skeleton className="h-8 w-8 rounded loading-skeleton" />
                    <Skeleton className="h-8 w-8 rounded loading-skeleton" />
                  </div>
                </div>

                {/* Quick Task Form Skeleton */}
                {showQuickForm && <QuickTaskFormSkeleton />}

                {/* Column Content */}
                <div className="flex-grow p-2 overflow-y-auto scrollbar-custom scrollbar-dark">
                  {isEmpty ? (
                    /* Empty State */
                    <div className="flex items-center justify-center h-20 border-2 border-dashed border-border rounded-md theme-transition mx-3 mb-4">
                      <Skeleton className="h-4 w-24 loading-skeleton" />
                    </div>
                  ) : (
                    /* Task Cards */
                    <div className="flex flex-col gap-2">
                      {Array.from({ length: cardCount }, (_, cardIndex) => (
                        <TaskCardSkeleton key={cardIndex} compactView={false} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Column Button Skeleton */}
          <div className="flex flex-col items-center justify-center w-16 min-h-[300px] h-[calc(100vh-14rem)] rounded-md border-2 border-dashed border-border flex-shrink-0 theme-surface hover-reveal theme-transition">
            <Skeleton className="h-10 w-10 rounded-full loading-skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
}
