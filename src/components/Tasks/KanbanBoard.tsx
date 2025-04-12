import React, { useState } from "react";
import { Task, TaskPriority, TaskStatus } from "./types";
import KanbanColumn from "./KanbanColumn";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import TaskDetailSidebar from "./TaskDetailSidebar";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";

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

const statusMap: Record<string, TaskStatus> = {
  "todo": "To Do",
  "inprogress": "In Progress",
  "review": "Review",
  "completed": "Completed"
};

const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onStatusChange,
  onDelete,
  renderPriorityBadge,
  isLoading,
}) => {
  const { toast } = useToast();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Configure sensors for drag detection with a small delay to avoid accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  // Flatten tasks for easier access
  const allTasks = [
    ...tasks.todo,
    ...tasks.inProgress,
    ...(tasks.review || []),
    ...tasks.completed
  ];

  // Handle opening the sidebar when a task is clicked
  const handleOpenTaskDetails = (taskId: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsSidebarOpen(true);
    }
  };

  // Handle task updates from the sidebar
  const handleTaskUpdate = (_taskId: string, _updates: Partial<Task>) => {
    // Here you would typically call your API to update the task
    // For now, we'll just show a toast
    toast({
      title: "Task updated",
      description: "Task details have been updated",
    });
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = allTasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) return;

    // If the task was dropped in a different column
    if (active.id !== over.id && over.id) {
      const columnId = String(over.id);
      if (columnId in statusMap) {
        const newStatus = statusMap[columnId];
        onStatusChange(String(active.id), newStatus);
      }
    }
  };

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
    <div className="relative overflow-x-auto pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KanbanColumn
            id="todo"
            title="To Do"
            tasks={tasks.todo}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            renderPriorityBadge={renderPriorityBadge}
            onTaskClick={handleOpenTaskDetails}
          />
          <KanbanColumn
            id="inprogress"
            title="In Progress"
            tasks={tasks.inProgress}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            renderPriorityBadge={renderPriorityBadge}
            onTaskClick={handleOpenTaskDetails}
          />
          <KanbanColumn
            id="review"
            title="Review"
            tasks={tasks.review || []}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            renderPriorityBadge={renderPriorityBadge}
            onTaskClick={handleOpenTaskDetails}
          />
          <KanbanColumn
            id="completed"
            title="Completed"
            tasks={tasks.completed}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            renderPriorityBadge={renderPriorityBadge}
            onTaskClick={handleOpenTaskDetails}
          />
        </div>

        {typeof window !== "undefined" &&
          createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeTask ? (
                <div className="rotate-3 scale-105 w-full max-w-[300px]">
                  {/* Render the dragged task */}
                  <div className="bg-white p-4 rounded-lg shadow-lg border border-primary/20">
                    <h3 className="font-medium text-sm">{activeTask.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-gray-500">
                        Due: {new Date(activeTask.dueDate).toLocaleDateString()}
                      </div>
                      {renderPriorityBadge(activeTask.priority)}
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
      </DndContext>

      {/* Task Detail Sidebar */}
      <TaskDetailSidebar
        task={selectedTask}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
};

export default KanbanBoard;
