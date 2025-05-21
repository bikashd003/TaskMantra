import React from 'react';
import { Task, TaskPriority, TaskStatus } from './types';
import { Skeleton } from '@heroui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle2, Circle, AlertCircle, Clock, Calendar, User, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TaskListProps {
  tasks: Task[];
  renderPriorityBadge: (priority: TaskPriority) => React.ReactNode;
  isLoading?: boolean;
  onTaskClick?: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  renderPriorityBadge,
  isLoading,
  onTaskClick,
}) => {
  // Group tasks by status
  const groupedTasks = tasks.reduce<Record<string, Task[]>>(
    (acc, task) => {
      if (!acc[task.status]) acc[task.status] = [];
      acc[task.status].push(task);
      return acc;
    },
    {
      'To Do': [],
      'In Progress': [],
      Review: [],
      Completed: [],
    }
  );

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

  // Format time (hours)
  const formatTime = (time?: number) => {
    if (time === undefined || time === null) return 'Not set';

    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);

    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  // Render assignees
  const renderAssignees = (assignedTo?: any[]) => {
    if (!assignedTo || assignedTo.length === 0) {
      return <span className="text-muted-foreground text-xs">Unassigned</span>;
    }

    return (
      <div className="flex -space-x-2 overflow-hidden">
        {assignedTo.slice(0, 3).map((user, index) => (
          <Avatar key={index} className="h-6 w-6 border-2 border-background">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name || 'User'} />
            ) : (
              <AvatarFallback className="text-xs">
                {(user.name || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        ))}
        {assignedTo.length > 3 && (
          <Avatar className="h-6 w-6 border-2 border-background">
            <AvatarFallback className="text-xs bg-muted">+{assignedTo.length - 3}</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  // Render subtasks progress
  const renderSubtasksProgress = (subtasks?: any[]) => {
    if (!subtasks || subtasks.length === 0) {
      return null;
    }

    const completed = subtasks.filter(subtask => subtask.completed).length;
    const total = subtasks.length;
    const percentage = Math.round((completed / total) * 100);

    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-xs text-muted-foreground">
          {completed}/{total}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="border shadow-sm overflow-hidden">
            <CardHeader className="py-3 px-4 bg-muted/30">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <div className="p-4">
              <Skeleton className="h-[300px] w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="border shadow-sm">
        <div className="flex items-center justify-center p-8 text-center">
          <div>
            <h3 className="text-lg font-medium mb-2">No tasks available</h3>
            <p className="text-muted-foreground">There are no tasks to display.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Tables Grouped by Status */}
      {Object.entries(groupedTasks).map(([status, statusTasks]) =>
        statusTasks.length > 0 ? (
          <Card key={status} className="border shadow-sm">
            <CardHeader className="py-3 px-4 bg-muted/30 sticky top-0 z-10">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                {getStatusIcon(status as TaskStatus)}
                {status}
                <Badge variant="secondary" className="ml-1">
                  {statusTasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <ScrollArea className="max-h-[500px]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableHead className="w-[250px] min-w-[180px]">Task</TableHead>
                      <TableHead className="w-[100px]">Priority</TableHead>
                      <TableHead className="w-[120px] hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Due Date</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-[120px] hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Start Date</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="hidden sm:inline">Assignees</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-[100px] hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Est. Time</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-[100px] hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Logged</span>
                        </div>
                      </TableHead>
                      <TableHead className="w-[120px] hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <ListChecks className="h-4 w-4 text-muted-foreground" />
                          <span>Subtasks</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statusTasks.map(task => (
                      <TableRow
                        key={task._id}
                        className={cn(
                          'cursor-pointer',
                          task.status === 'Completed' && 'bg-muted/20'
                        )}
                        onClick={() => onTaskClick?.(task._id)}
                      >
                        <TableCell>
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
                        </TableCell>
                        <TableCell>{renderPriorityBadge(task.priority)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {task.startDate
                              ? new Date(task.startDate).toLocaleDateString()
                              : 'Not set'}
                          </Badge>
                        </TableCell>
                        <TableCell>{renderAssignees(task.assignedTo)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(task.estimatedTime)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(task.loggedTime)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {renderSubtasksProgress(task.subtasks)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </Card>
        ) : null
      )}
    </div>
  );
};

export default TaskList;
