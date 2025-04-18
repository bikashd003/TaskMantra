import React, { JSX, useState, useEffect } from "react";
import { Task, TaskPriority, TaskStatus } from "./types";
import TaskCard from "./TaskCard";
import EmptyState from "./EmptyState";
import { Skeleton } from "@heroui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, Calendar, Clock, List, Filter, Tag, MoreHorizontal, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TaskListProps {
  tasks: Task[];
  searchQuery: string;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  renderPriorityBadge: (priority: TaskPriority) => JSX.Element;
  onCreateTask: () => void;
  isLoading?: boolean;
}

type ViewMode = 'compact' | 'detailed' | 'table' | 'grouped';

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
  const [groupBy, setGroupBy] = useState<'none' | 'status' | 'priority'>('none');
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

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

  // Group tasks if needed
  const groupedTasks = React.useMemo(() => {
    if (groupBy === 'none') return { 'All Tasks': sortedAndFilteredTasks };

    const groups: Record<string, Task[]> = {};

    if (groupBy === 'status') {
      // Initialize with standard statuses to ensure order
      groups['To Do'] = [];
      groups['In Progress'] = [];
      groups['Review'] = [];
      groups['Completed'] = [];

      // Group tasks by status
      sortedAndFilteredTasks.forEach(task => {
        if (!groups[task.status]) groups[task.status] = [];
        groups[task.status].push(task);
      });
    } else if (groupBy === 'priority') {
      // Initialize with standard priorities to ensure order
      groups['High'] = [];
      groups['Medium'] = [];
      groups['Low'] = [];

      // Group tasks by priority
      sortedAndFilteredTasks.forEach(task => {
        groups[task.priority].push(task);
      });
    }

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) delete groups[key];
    });

    return groups;
  }, [sortedAndFilteredTasks, groupBy]);

  // Get status icon
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'To Do':
        return <Circle className="h-4 w-4 text-slate-500" />;
      case 'In Progress':
        return <Circle className="h-4 w-4 text-blue-500" />;
      case 'Review':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

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
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
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
                  <TabsTrigger value="grouped">
                    <Tag className="h-4 w-4 mr-1" /> Grouped
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {viewMode === 'grouped' && (
                <Select value={groupBy} onValueChange={(value) => setGroupBy(value as 'none' | 'status' | 'priority')}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Group By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Grouping</SelectItem>
                    <SelectItem value="status">By Status</SelectItem>
                    <SelectItem value="priority">By Priority</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" /> Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id="show-completed"
                        checked={showCompleted}
                        onCheckedChange={(checked) => setShowCompleted(!!checked)}
                      />
                      <Label htmlFor="show-completed" className="text-sm cursor-pointer">Show Completed</Label>
                    </div>

                    <div className="mb-1">
                      <Label className="text-xs text-muted-foreground">Priority</Label>
                      <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="h-4 w-4 mr-1" /> Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => handleSort('name')} className="justify-between">
                    Name
                    {sortConfig.field === 'name' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('dueDate')} className="justify-between">
                    Due Date
                    {sortConfig.field === 'dueDate' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('priority')} className="justify-between">
                    Priority
                    {sortConfig.field === 'priority' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('status')} className="justify-between">
                    Status
                    {sortConfig.field === 'status' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      {viewMode === 'compact' && (
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-2">
              {sortedAndFilteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 border rounded-md hover:bg-muted/50 transition-colors flex justify-between items-center"
                  onMouseEnter={() => setHoveredTaskId(task.id)}
                  onMouseLeave={() => setHoveredTaskId(null)}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={task.status === "Completed"}
                      onCheckedChange={(checked) => {
                        onStatusChange(task.id, checked ? "Completed" : "To Do");
                      }}
                    />
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className={cn(
                        "font-medium",
                        task.status === "Completed" && "line-through text-muted-foreground"
                      )}>
                        {task.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderPriorityBadge(task.priority)}
                    <Badge variant="outline" className="text-xs">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </Badge>
                    {hoveredTaskId === task.id && (
                      <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)} className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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

      {viewMode === 'grouped' && (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([group, tasks]) => (
            <Card key={group} className="border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/50 py-3">
                <CardTitle className="text-md flex items-center gap-2">
                  {group === 'High' && <Badge className="bg-red-500">High Priority</Badge>}
                  {group === 'Medium' && <Badge className="bg-yellow-500">Medium Priority</Badge>}
                  {group === 'Low' && <Badge className="bg-green-500">Low Priority</Badge>}
                  {group === 'To Do' && <Badge className="bg-slate-500">To Do</Badge>}
                  {group === 'In Progress' && <Badge className="bg-blue-500">In Progress</Badge>}
                  {group === 'Review' && <Badge className="bg-amber-500">Review</Badge>}
                  {group === 'Completed' && <Badge className="bg-green-500">Completed</Badge>}
                  {group === 'All Tasks' && <span>All Tasks</span>}
                  <span className="text-muted-foreground text-sm ml-2">{tasks.length} tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 border rounded-md hover:bg-muted/50 transition-colors flex justify-between items-center"
                        onMouseEnter={() => setHoveredTaskId(task.id)}
                        onMouseLeave={() => setHoveredTaskId(null)}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={task.status === "Completed"}
                            onCheckedChange={(checked) => {
                              onStatusChange(task.id, checked ? "Completed" : "To Do");
                            }}
                          />
                          <div className="flex items-center gap-2">
                            {getStatusIcon(task.status)}
                            <span className={cn(
                              "font-medium",
                              task.status === "Completed" && "line-through text-muted-foreground"
                            )}>
                              {task.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {groupBy !== 'priority' && renderPriorityBadge(task.priority)}
                          {groupBy !== 'status' && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                task.status === 'To Do' && "border-slate-500 text-slate-700",
                                task.status === 'In Progress' && "border-blue-500 text-blue-700",
                                task.status === 'Review' && "border-amber-500 text-amber-700",
                                task.status === 'Completed' && "border-green-500 text-green-700"
                              )}
                            >
                              {task.status}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </Badge>
                          {hoveredTaskId === task.id && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)} className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete Task</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
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
