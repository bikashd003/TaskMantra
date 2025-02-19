import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import KanbanTask from "./KanbanTask";
import { GripVertical } from "lucide-react";
import {cn} from "@/lib/utils";

interface KanbanColumnProps {
  column: any;
  tasks: any[];
  draggingTask: string | null;
  onOpenSidebar?: (_taskId: string) => void;
}

const KanbanColumn = ({
  column,
  tasks,
  draggingTask,
  onOpenSidebar,
}: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({ id: column.id });

  const { attributes, listeners, setNodeRef: setSortableRef, transform, transition, isDragging } =
    useSortable({ id: `col-${column.id}` });

  return (
    <div
      ref={setSortableRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      className={cn(
        "w-80 bg-white rounded-lg shadow-md p-5",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-xl text-gray-800">{column.title}</h2>
        <button
          className="p-1.5 hover:bg-gray-100 rounded-md cursor-grab active:cursor-grabbing"
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="min-h-[150px] bg-gray-50 p-3 rounded-lg space-y-3"
      >
        <SortableContext items={tasks.map((task) => task._id)}>
          {tasks.map((task) => (
            <KanbanTask
              key={task._id}
              task={task}
              isDragging={draggingTask === task._id}
              onOpenSidebar={onOpenSidebar}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;
