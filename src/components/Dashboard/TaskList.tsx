'use client';
import React, { useState } from 'react';
import {
  MoreHorizontal,
  CheckCircle,
  ChevronDown,
  Calendar,
  Clock,
  Tag,
  Filter,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { TaskService } from '@/services/Task.service';
import { motion } from 'framer-motion';

type TimePeriod = 'today' | 'week' | 'month';

const periodLabels: Record<TimePeriod, string> = {
  today: "Today's Tasks",
  week: "This Week's Tasks",
  month: "This Month's Tasks",
};
interface Task {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'Low' | 'Medium' | 'High';
  dueDate?: string | Date;
  category?: string;
  status?: string;
}

interface TaskListProps {
  isLoading?: boolean;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskDelete?: (taskId: string) => Promise<void>;
  className?: string;
  maxHeight?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  isLoading: externalLoading = false,
  onTaskUpdate,
  onTaskDelete,
  className,
}) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const { data: tasks, isLoading: queryLoading } = useQuery({
    queryKey: ['tasks', timePeriod],
    queryFn: async () => {
      const tasks = await TaskService.getTasksByTimePeriod(timePeriod);
      return tasks;
    },
  });

  const isLoading = externalLoading || queryLoading;

  const filteredTasks = tasks
    ? tasks.filter((task: any) => {
        const isCompleted = task.completed || task.status === 'Completed';
        if (filter === 'all') return true;
        if (filter === 'completed') return isCompleted;
        if (filter === 'pending') return !isCompleted;
        return true;
      })
    : [];

  const getPriorityColor = (priority: Task['priority']) => {
    const colors: Record<string, string> = {
      Low: 'theme-badge-success',
      Medium: 'theme-badge-warning',
      High: 'theme-badge-destructive',
    };
    return colors[priority] || colors.Medium;
  };

  const priorityIcon = (priority: Task['priority']) => {
    const lowerPriority = typeof priority === 'string' ? priority.toLowerCase() : 'medium';
    return (
      <span
        className={cn(
          'inline-block w-2 h-2 rounded-full mr-1.5',
          lowerPriority === 'high'
            ? 'bg-rose-500'
            : lowerPriority === 'medium'
              ? 'bg-amber-500'
              : 'bg-emerald-500'
        )}
      />
    );
  };

  const TaskItem = ({ task }: { task: Task }) => {
    const isCompleted = task.completed;
    const taskId = task.id || task._id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'group flex flex-col sm:flex-row items-start justify-between p-3 sm:p-4 rounded-xl gap-2 sm:gap-4',
          'theme-surface theme-shadow-sm theme-hover-surface theme-transition',
          'hover:-translate-y-0.5'
        )}
      >
        <div className="flex items-start gap-3 w-full">
          <button
            onClick={() => taskId && onTaskUpdate?.(taskId, { completed: !isCompleted })}
            className={cn(
              'w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center theme-transition flex-shrink-0 mt-1',
              isCompleted ? 'bg-success/20 text-success' : 'theme-button-ghost theme-text-secondary'
            )}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            <CheckCircle
              size={isCompleted ? 16 : 14}
              className={isCompleted ? 'fill-success' : ''}
            />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <h3
                className={cn(
                  'font-medium text-sm sm:text-base line-clamp-1',
                  isCompleted ? 'theme-text-secondary line-through' : 'theme-text-primary'
                )}
              >
                {task.title || task.name}
              </h3>
              <Badge
                variant="outline"
                className={cn('w-fit text-xs rounded-md', getPriorityColor(task.priority))}
              >
                {priorityIcon(task.priority)}
                {task.priority}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm theme-text-secondary line-clamp-2 mt-1">
              {task.description || 'No description'}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs theme-text-secondary">
              {task.dueDate && (
                <div className="flex items-center gap-1 theme-surface px-2 py-0.5 rounded-md">
                  <Calendar size={12} />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              {task.category && (
                <div className="flex items-center gap-1 theme-surface px-2 py-0.5 rounded-md">
                  <Tag size={12} />
                  <span>{task.category}</span>
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="sm:opacity-0 group-hover:opacity-100 p-1.5 theme-button-ghost rounded-md theme-text-secondary theme-transition"
                aria-label="Task options"
              >
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => taskId && onTaskUpdate?.(taskId, { completed: !isCompleted })}
                className="text-sm"
              >
                Mark as {isCompleted ? 'incomplete' : 'complete'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => taskId && onTaskDelete?.(taskId)}
                className="text-sm text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-start gap-3 p-3 animate-pulse rounded-xl theme-surface">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-muted flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="h-4 sm:h-5 w-full sm:w-1/3 rounded-md bg-muted" />
              <div className="h-4 w-16 rounded-full bg-muted" />
            </div>
            <div className="h-3 sm:h-4 w-full sm:w-2/3 mt-2 rounded-md bg-muted" />
            <div className="flex items-center gap-2 mt-2">
              <div className="h-3 w-20 rounded-md bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className={cn('theme-surface-elevated h-full', className)}>
      <div className="max-h-[calc(100vh-55vh)] overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <CardTitle className="text-lg font-semibold theme-text-primary flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              {periodLabels[timePeriod]}
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs sm:text-sm theme-button-secondary theme-shadow-sm">
                    <Filter size={14} />
                    {filter === 'all' ? 'All' : filter === 'completed' ? 'Completed' : 'Pending'}
                    <ChevronDown size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={() => setFilter('all')} className="text-sm">
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('pending')} className="text-sm">
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('completed')} className="text-sm">
                    Completed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex-grow sm:flex-grow-0 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs sm:text-sm theme-button-secondary theme-shadow-sm">
                    <Clock size={14} />
                    {timePeriod === 'today'
                      ? 'Today'
                      : timePeriod === 'week'
                        ? 'This Week'
                        : 'This Month'}
                    <ChevronDown size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={() => setTimePeriod('today')} className="text-sm">
                    Today
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimePeriod('week')} className="text-sm">
                    This Week
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTimePeriod('month')} className="text-sm">
                    This Month
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-full overflow-auto">
          <ScrollArea className="h-[calc(100vh-60vh)]">
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              {isLoading ? (
                <LoadingSkeleton />
              ) : filteredTasks && filteredTasks.length > 0 ? (
                filteredTasks.map((task: any) => (
                  <TaskItem
                    key={task._id || task.id}
                    task={{
                      id: task._id || task.id,
                      title: task.title || task.name,
                      description: task.description || '',
                      completed: task.completed || task.status === 'Completed',
                      priority: (task.priority || 'Medium') as Task['priority'],
                      dueDate: task.dueDate,
                      category: task.category,
                    }}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 theme-text-secondary">
                  <div className="p-3 theme-surface rounded-full mb-3">
                    <Clock size={24} className="theme-text-secondary" />
                  </div>
                  <p className="text-center text-sm">
                    No tasks for{' '}
                    {timePeriod === 'today'
                      ? 'today'
                      : timePeriod === 'week'
                        ? 'this week'
                        : 'this month'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </div>
    </Card>
  );
};

export default TaskList;
