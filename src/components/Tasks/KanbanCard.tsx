import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskCardProps } from "./types";
import TaskActions from "./TaskActions";

const KanbanCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onDelete,
  renderPriorityBadge,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4 }}
      className="cursor-grab"
    >
      <Card className="shadow-sm hover:shadow-md transition-all">
        <CardHeader className="p-3 pb-0">
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-medium">{task.name}</CardTitle>
            <TaskActions
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
            {renderPriorityBadge(task.priority)}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {task.assignedTo && task.assignedTo.length > 0 ? (
                task.assignedTo.slice(0, 3).map((user, index) => (
                  <Avatar key={index} className="h-6 w-6 border-2 border-background">
                    <AvatarImage
                      src={user.avatar}
                      alt={user.name}
                    />
                    <AvatarFallback className="text-xs">
                      {user.initials || user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))
              ) : (
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">UA</AvatarFallback>
                </Avatar>
              )}
              {task.assignedTo && task.assignedTo.length > 3 && (
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">+{task.assignedTo.length - 3}</AvatarFallback>
                </Avatar>
              )}
            </div>
            {(task?.tags ?? []).length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {(task?.tags ?? [])[0]}
                {(task?.tags ?? []).length > 1 && `+${(task?.tags ?? []).length - 1}`}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default KanbanCard;
