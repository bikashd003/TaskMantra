import React, { JSX, useState } from 'react';
import { Task, TaskPriority, TaskStatus } from './types';
import EmptyState from './EmptyState';
import { Skeleton } from '@heroui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpDown, Filter, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  searchQuery: string;
  renderPriorityBadge: (priority: TaskPriority) => JSX.Element;
  onCreateTask: () => void;
  isLoading?: boolean;
}

type SortField = 'name' | 'dueDate' | 'priority' | 'status' | 'createdAt';

type SortConfig = {
  field: SortField;
  direction: 'asc' | 'desc';
};

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  searchQuery,
  renderPriorityBadge,
  onCreateTask,
  isLoading,
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'dueDate', direction: 'asc' });
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc',
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
          // Handle undefined dueDate values
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return multiplier;
          if (!b.dueDate) return -multiplier;
          return multiplier * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        case 'priority': {
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          return multiplier * ((priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0));
        }
        case 'status': {
          const statusOrder = { 'To Do': 1, 'In Progress': 2, Review: 3, Completed: 4 };
          return multiplier * ((statusOrder[a.status] || 0) - (statusOrder[b.status] || 0));
        }
        default:
          return 0;
      }
    });

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
      <Card className="border-none shadow-sm bg-background">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center space-x-2"></div>

            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" /> Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-3 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-completed"
                        checked={showCompleted}
                        onCheckedChange={checked => setShowCompleted(!!checked)}
                      />
                      <Label htmlFor="show-completed" className="text-sm cursor-pointer">
                        Show Completed
                      </Label>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Priority</Label>
                      <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                        <SelectTrigger className="w-full">
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
                      <Badge variant="outline" className="ml-2 font-mono">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSort('dueDate')}
                    className="justify-between"
                  >
                    Due Date
                    {sortConfig.field === 'dueDate' && (
                      <Badge variant="outline" className="ml-2 font-mono">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSort('priority')}
                    className="justify-between"
                  >
                    Priority
                    {sortConfig.field === 'priority' && (
                      <Badge variant="outline" className="ml-2 font-mono">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSort('status')}
                    className="justify-between"
                  >
                    Status
                    {sortConfig.field === 'status' && (
                      <Badge variant="outline" className="ml-2 font-mono">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSort('createdAt')}
                    className="justify-between"
                  >
                    Created Date
                    {sortConfig.field === 'createdAt' && (
                      <Badge variant="outline" className="ml-2 font-mono">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    Task
                    {sortConfig.field === 'name' && (
                      <Badge variant="outline" className="ml-1 font-mono">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </Badge>
                    )}
                  </div>
                </th>
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">
                    Status
                    {sortConfig.field === 'status' && (
                      <Badge variant="outline" className="ml-1 font-mono">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </Badge>
                    )}
                  </div>
                </th>
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('priority')}>
                  <div className="flex items-center gap-1">
                    Priority
                    {sortConfig.field === 'priority' && (
                      <Badge variant="outline" className="ml-1 font-mono">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </Badge>
                    )}
                  </div>
                </th>
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center gap-1">
                    Due Date
                    {sortConfig.field === 'dueDate' && (
                      <Badge variant="outline" className="ml-1 font-mono">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </Badge>
                    )}
                  </div>
                </th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredTasks.map(task => (
                <tr
                  key={task.id}
                  className={cn(
                    'border-b transition-colors',
                    'hover:bg-muted/50',
                    task.status === 'Completed' && 'bg-muted/30'
                  )}
                >
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span
                          className={cn(
                            'font-medium',
                            task.status === 'Completed' && 'line-through text-muted-foreground'
                          )}
                        >
                          {task.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        task.status === 'To Do' && 'border-slate-500 text-slate-700',
                        task.status === 'In Progress' && 'border-blue-500 text-blue-700',
                        task.status === 'Review' && 'border-amber-500 text-amber-700',
                        task.status === 'Completed' && 'border-green-500 text-green-700'
                      )}
                    >
                      {task.status}
                    </Badge>
                  </td>
                  <td className="p-3">{renderPriorityBadge(task.priority)}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-xs">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TaskList;
