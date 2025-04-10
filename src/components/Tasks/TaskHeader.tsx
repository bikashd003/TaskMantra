import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskHeaderProps {
  onCreateTask: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ onCreateTask }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
        <p className="text-muted-foreground mt-1">
          Manage and organize your tasks efficiently
        </p>
      </div>
      <Button
        onClick={onCreateTask}
        size="lg"
        className="gap-2 transition-all hover:scale-105"
      >
        <Plus className="h-5 w-5" /> New Task
      </Button>
    </div>
  );
};

export default TaskHeader;
