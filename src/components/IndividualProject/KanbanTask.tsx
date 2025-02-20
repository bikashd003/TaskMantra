import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KanbanTaskProps {
  task: any;
  isDragging: boolean;
  onOpenSidebar?: (_taskId: string) => void;
}

const KanbanTask = ({ task, isDragging, onOpenSidebar }: KanbanTaskProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task._id });

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "p-4 rounded-lg shadow-md border border-gray-300 bg-white cursor-grab transition-all",
        isDragging ? "opacity-30 shadow-none border-dashed" : "hover:shadow-lg"
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex flex-col gap-2">
        <h3 
          className="font-medium w-fit text-gray-900 no-drag cursor-pointer hover:text-blue-600"
          onClick={() => onOpenSidebar?.(task._id)}
        >
          {task.name}
        </h3>
        <p className="text-sm text-gray-500">{task.description}</p>
        <div className="flex justify-between mt-2">
          <span
            className={cn(
            "px-2 py-1 text-xs font-medium rounded-md",
              task.priority === "High" && "bg-red-100 text-red-600",
              task.priority === "Medium" && "bg-yellow-100 text-yellow-600",
              task.priority === "Low" && "bg-green-100 text-green-600"
            )}
          >
            {task.priority}
          </span>
        <span className="text-xs text-gray-400">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default KanbanTask;
