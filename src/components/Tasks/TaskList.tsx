import React, { JSX, useState } from "react";
import { Task, TaskPriority, TaskStatus } from "./types";
import TaskCard from "./TaskCard";
import EmptyState from "./EmptyState";
import { Skeleton } from "@heroui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, Calendar, Clock, List } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  searchQuery: string;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  renderPriorityBadge: (priority: TaskPriority) => JSX.Element;
  onCreateTask: () => void;
  isLoading?: boolean;
}

type ViewMode = 'compact' | 'detailed' | 'table';

type SortField = 'name' | 'dueDate' | 'priority' | 'status';

type SortConfig = {
  field: SortField;
  direction: 'asc' | 'desc';
};

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  searchQuery,
  onStatusChange,
  onDelete,
  renderPriorityBadge,
  onCreateTask,
  isLoading,
}) => {
  // State for view mode and sorting
  const [viewMode, setViewMode] = useState<ViewMode>('detailed');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'dueDate', direction: 'asc' });
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Handle sorting
  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort and filter tasks
  const sortedAndFilteredTasks = tasks
    .filter(task => {
      // Filter by completion status
      if (!showCompleted && task.status === 'Completed') {
        return false;
      }

      // Filter by priority
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const { field, direction } = sortConfig;
      const multiplier = direction === 'asc' ? 1 : -1;

      switch (field) {
        case 'name':
          return multiplier * a.name.localeCompare(b.name);
        case 'dueDate':
          return multiplier * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        case 'priority': {
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return multiplier * ((priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0));
        }
        case 'status': {
          const statusOrder = { 'To Do': 1, 'In Progress': 2, 'Review': 3, 'Completed': 4 };
          return multiplier * ((statusOrder[a.status] || 0) - (statusOrder[b.status] || 0));
        }
        default:
          return 0;
      }
    });

  if (tasks.length === 0) {
    return <EmptyState searchQuery={searchQuery} onCreateTask={onCreateTask} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-auto">
            <TabsList>
              <TabsTrigger value="compact">
                <List className="h-4 w-4 mr-1" /> Compact
              </TabsTrigger>
              <TabsTrigger value="detailed">
                <Calendar className="h-4 w-4 mr-1" /> Detailed
              </TabsTrigger>
              <TabsTrigger value="table">
                <ArrowUpDown className="h-4 w-4 mr-1" /> Table
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-completed"
              checked={showCompleted}
              onCheckedChange={(checked) => setShowCompleted(!!checked)}
            />
            <Label htmlFor="show-completed" className="text-sm cursor-pointer">Show Completed</Label>
          </div>

          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => handleSort('dueDate')}>
            <Clock className="h-4 w-4 mr-1" />
            Due Date {sortConfig.field === 'dueDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>

      {/* Task List */}
      {viewMode === 'compact' && (
        <div className="space-y-2">
          {sortedAndFilteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={task.status === "Completed"}
                    onCheckedChange={(checked) => {
                      onStatusChange(task.id, checked ? "Completed" : "To Do");
                    }}
                  />
                  <span className={task.status === "Completed" ? "line-through text-muted-foreground" : ""}>
                    {task.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {renderPriorityBadge(task.priority)}
                  <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === 'detailed' && (
        <div className="grid gap-4">
          {sortedAndFilteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              renderPriorityBadge={renderPriorityBadge}
            />
          ))}
        </div>
      )}

      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">
                    Task {sortConfig.field === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center">
                    Status {sortConfig.field === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('priority')}>
                  <div className="flex items-center">
                    Priority {sortConfig.field === 'priority' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center">
                    Due Date {sortConfig.field === 'dueDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredTasks.map((task) => (
                <tr key={task.id} className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={task.status === "Completed"}
                        onCheckedChange={(checked) => {
                          onStatusChange(task.id, checked ? "Completed" : "To Do");
                        }}
                      />
                      <span className={task.status === "Completed" ? "line-through text-muted-foreground" : ""}>
                        {task.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-2">{task.status}</td>
                  <td className="p-2">{renderPriorityBadge(task.priority)}</td>
                  <td className="p-2">{new Date(task.dueDate).toLocaleDateString()}</td>
                  <td className="p-2">
                    <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskList;
