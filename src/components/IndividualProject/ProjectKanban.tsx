import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  closestCorners
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import KanbanTask from "./KanbanTask";
import { createPortal } from "react-dom";
import { useToast } from "@/hooks/use-toast"
import {TaskSidebar} from "./TaskSidebar";


const defaultColumns = [
  { id: "todo", title: "To Do" },
  { id: "inProgress", title: "In Progress" },
  { id: "completed", title: "Done" },
  { id: "review", title: "Review" },
];

const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

const ProjectKanban = ({ project }: { project: any }) => {
  const { toast } = useToast()
  const formattedTasks = project.tasks.map((task: any) => ({
    ...task,
    columnId: task.status.replace(/\s+/g, "").toLowerCase(),
  }));

  // Initialize columns from localStorage or default
  const [columns, setColumns] = useState(() => {
    const savedColumns = localStorage.getItem(`kanban-columns-${project._id}`);
    return savedColumns ? JSON.parse(savedColumns) : defaultColumns;
  });

  const [tasks, setTasks] = useState(formattedTasks);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Save columns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`kanban-columns-${project._id}`, JSON.stringify(columns));
  }, [columns, project._id]);

  const handleOpenSidebar = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsSidebarOpen(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const updateTaskStatus = async (taskId: string, newStatus: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/update-task-status/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }
      if(response.ok){
        toast({
          variant: "success",
          title: "Success",
          description: "Task status updated",
        })
      }

      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      return false;
    }
  };

  const onDragStart = (event: any) => {
    const { active } = event;
    if (!active.id.startsWith("col-")) {
      const task = tasks.find((t) => t._id === active.id);
      setActiveTask(task);
    }
  };

  const onDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    if (active.id.startsWith("col-") && over.id.startsWith("col-")) {
      const oldIndex = columns.findIndex(
        (c) => `col-${c.id}` === active.id
      );
      const newIndex = columns.findIndex(
        (c) => `col-${c.id}` === over.id
      );
      
      if (oldIndex !== newIndex) {
        setColumns(arrayMove(columns, oldIndex, newIndex));
      }
      return;
    }

    const activeTask = tasks.find((t) => t._id === active.id);
    if (activeTask) {
      const newColumnId = over.id;
      const newStatus = columns.find((col) => col.id === newColumnId)?.title || "";

      // Update local state optimistically
      setTasks((prev) =>
        prev.map((task) =>
          task._id === active.id ? { ...task, columnId: newColumnId } : task
        )
      );

      // Call API to update status
      const success = await updateTaskStatus(active.id, newStatus);
      
      // Revert changes if API call failed
      if (!success) {
        setTasks((prev) =>
          prev.map((task) =>
            task._id === active.id ? { ...task, columnId: activeTask.columnId } : task
          )
        );
      }
    }
  };

  return (
    <div className="p-2 w-full overflow-x-auto">
      {selectedTaskId && (
      <TaskSidebar taskId={selectedTaskId!} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={columns.map((col) => `col-${col.id}`)}>
          <div className="flex space-x-6">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasks.filter((task) => task.columnId === column.id)}
                draggingTask={activeTask?._id}
                onOpenSidebar={handleOpenSidebar}
              />
            ))}
          </div>
        </SortableContext>
        {typeof window !== "undefined" &&
          createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeTask ? (
                <div className="rotate-3 scale-105">
                  <KanbanTask task={activeTask} isDragging={true} />
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </div>
  );
};

export default ProjectKanban;
