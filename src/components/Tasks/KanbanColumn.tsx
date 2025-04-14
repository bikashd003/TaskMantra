import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KanbanColumnProps, Task } from "./types";
import KanbanCard from "./KanbanCard";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, Plus, X, Trash2 } from "lucide-react";

const defaultColumns = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "completed", title: "Done" },
  { id: "review", title: "Review" },
];

interface ExtendedKanbanColumnProps extends KanbanColumnProps {
  id: string;
  onTaskClick?: (taskId: string) => void;
  onAddTask?: (task: Partial<Task>) => void;
  onDeleteColumn?: () => void;
  columnWidth?: number;
  compactView?: boolean;
}

const KanbanColumn: React.FC<ExtendedKanbanColumnProps> = ({
  id,
  title,
  tasks,
  onStatusChange,
  onDelete,
  renderPriorityBadge,
  onTaskClick,
  onAddTask,
  onDeleteColumn,
  columnWidth = 280,
  compactView = false,
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Function to handle adding a new task
  const handleAddTask = () => {
    if (!newTaskName.trim() || !onAddTask) return;

    // Create a new task with the current column's status
    const newTask: Partial<Task> = {
      name: newTaskName.trim(),
      status: title as any, // Convert the column title to a TaskStatus
      priority: "Medium", // Default priority
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default due date (1 week from now)
      subtasks: [],
      assignedTo: [],
      comments: [],
      dependencies: [],
    };

    onAddTask(newTask);
    setNewTaskName("");
    setIsAddingTask(false);
  };

  // Set up sortable for the column itself
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isColumnDragging
  } = useSortable({
    id: `column-${id}`,
    data: { type: 'column', id }
  });

  // Set up droppable area for tasks within the column
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: id,
  });

  // Get status color
  const getStatusColor = () => {
    switch (title) {
      case "To Do":
        return "bg-slate-400";
      case "In Progress":
        return "bg-blue-500";
      case "Review":
        return "bg-amber-500";
      case "Completed":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const columnTransform = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setSortableRef}
      className={`space-y-4 ${isColumnDragging ? 'opacity-50' : ''}`}
      style={{
        ...columnTransform,
        width: `${columnWidth}px`
      }}
      {...attributes}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center cursor-move" {...listeners}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mr-1 hover:bg-gray-100 rounded p-1"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            )}
          </button>
          <span
            className={`h-2 w-2 rounded-full mr-2 ${getStatusColor()}`}
          ></span>
          {title}
          <Badge variant="secondary" className="ml-2">
            {tasks.length}
          </Badge>
        </h3>
        <div className="flex items-center space-x-1">
          {onDeleteColumn && !defaultColumns.some(col => col.id === id) && (
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 text-gray-500 hover:text-red-500 `}
              onClick={onDeleteColumn}
              title="Delete column"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsAddingTask(true)}
            title="Add task"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick add task form */}
      {isAddingTask && (
        <div className="p-2 mb-2 border border-dashed border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Add New Task</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskName("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Input
            placeholder="Task name"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            className="mb-2"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTaskName.trim()) {
                handleAddTask();
              }
            }}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskName("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddTask}
              disabled={!newTaskName.trim()}
            >
              Add Task
            </Button>
          </div>
        </div>
      )}

      {/* Droppable area */}
      {!isCollapsed && (
        <div
          ref={setDroppableRef}
          className={`min-h-[200px] rounded-lg transition-colors ${isOver ? 'bg-primary/5 border-2 border-dashed border-primary/30' : 'border border-dashed border-gray-200'}`}
        >
          {tasks.length === 0 && !isAddingTask ? (
            <div className="h-full p-4 flex flex-col items-center justify-center text-center text-muted-foreground text-sm">
              <p className="mb-2">Drop tasks here</p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setIsAddingTask(true)}
              >
                <Plus className="h-3 w-3 mr-1" /> Add Task
              </Button>
            </div>
          ) : (
            <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3 p-2">
                {tasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                    renderPriorityBadge={renderPriorityBadge}
                    onClick={() => onTaskClick?.(task.id)}
                    compactView={compactView}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      )}
    </div>
  );
};

export default KanbanColumn;
