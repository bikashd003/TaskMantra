import React from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskCardProps } from "./types";
import TaskActions from "./TaskActions";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExtendedTaskCardProps extends TaskCardProps {
  onClick?: () => void;
  compactView?: boolean;
}

const KanbanCard: React.FC<ExtendedTaskCardProps> = ({
  task,
  onStatusChange,
  onDelete,
  renderPriorityBadge,
  onClick,
  compactView = false,
}) => {
  // Set up sortable (draggable) functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  // Calculate progress based on subtasks
  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Check if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  // Format date in a more readable way
  const formatDate = (date: Date | string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={isDragging ? "opacity-50" : ""}
      >
        <Card
          className={`shadow-sm hover:shadow-md transition-all ${isDragging ? "border-primary border-2" : ""} ${task.status === "Completed" ? "bg-gray-50" : ""} cursor-pointer`}
          onClick={onClick}
        >
          <CardHeader className="p-3 pb-0">
            <div className="flex justify-between items-start">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardTitle
                      className={`text-sm font-medium ${task.status === "Completed" ? "text-gray-500" : ""} truncate max-w-[180px]`}
                    >
                      {task.status === "Completed" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500 inline mr-1" />
                      )}
                      {task.name}
                    </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{task.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <TaskActions
                  task={task}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              </div>
            </div>
          </CardHeader>

          {!compactView ? (
            <CardContent className="p-3 pt-2">
              {/* Due date and priority */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Calendar className={`h-3 w-3 mr-1 ${isOverdue ? "text-red-500" : "text-muted-foreground"}`} />
                  <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                    {isOverdue ? "Overdue: " : ""}{formatDate(task.dueDate)}
                  </span>
                </div>
                {renderPriorityBadge(task.priority)}
              </div>

              {/* Progress bar for subtasks */}
              {totalSubtasks > 0 && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{completedSubtasks}/{totalSubtasks}</span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>
              )}

              {/* Assigned users and tags */}
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
          ) : (
            <CardContent className="p-3 pt-2">
              <div className="flex justify-between items-center">
                {task.dueDate && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className={`h-3 w-3 mr-1 ${isOverdue ? "text-red-500" : ""}`} />
                    <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                )}
                {renderPriorityBadge(task.priority)}
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default KanbanCard;
