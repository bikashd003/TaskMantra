import React from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskCardProps } from "./types";
import TaskActions from "./TaskActions";
import TaskMetadata from "./TaskMetadata";

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onDelete,
  renderPriorityBadge,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={task.status === "Completed"}
                onCheckedChange={(checked) => {
                  onStatusChange(task.id, checked ? "Completed" : "To Do");
                }}
              />
              <CardTitle
                className={`text-lg ${
                  task.status === "Completed"
                    ? "line-through text-muted-foreground"
                    : ""
                }`}
              >
                {task.name}
              </CardTitle>
            </div>
            <TaskActions
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {task.description}
          </p>
          <TaskMetadata task={task} renderPriorityBadge={renderPriorityBadge} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TaskCard;
