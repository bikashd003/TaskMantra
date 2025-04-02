/* eslint-disable no-unused-vars */
"use client";

import React from 'react';
import { MoreHorizontal, CheckCircle, ChevronDown, Calendar, Clock } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    category?: string;
}

interface TaskListProps {
    isLoading?: boolean;
    tasks?: Task[];
    onTaskUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
    onTaskDelete?: (taskId: string) => Promise<void>;
}

const TaskList: React.FC<TaskListProps> = ({
    isLoading = false,
    tasks: propTasks,
    onTaskUpdate,
    onTaskDelete
}) => {
    // Temporary mock data - replace with API data later
    const defaultTasks: Task[] = [
        {
            id: '1',
            title: 'Navigation bar',
            description: 'Design and implement top nav',
            completed: true,
            priority: 'high',
            dueDate: '2024-02-20',
            category: 'Development'
        },
// ... other tasks
    ];

    const tasks = propTasks || defaultTasks;

    const getPriorityColor = (priority: Task['priority']) => {
        const colors = {
            low: 'bg-success/15 text-success',
            medium: 'bg-warning/15 text-warning',
            high: 'bg-destructive/15 text-destructive'
        };
        return colors[priority];
    };

    const TaskItem = ({ task }: { task: Task }) => (
        <div
            className={cn(
                "group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl gap-3 sm:gap-4",
                "bg-background/50 hover:bg-accent/50 transition-all duration-200",
                "border border-border/50 hover:border-border",
                "hover:shadow-lg hover:-translate-y-0.5"
            )}
        >
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <button
                    onClick={() => onTaskUpdate?.(task.id, { completed: !task.completed })}
                    className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0",
                        task.completed
                            ? "bg-success/15 text-success"
                            : "bg-primary/15 text-primary hover:bg-primary/20"
                    )}
                >
                    <CheckCircle size={18} />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className={cn(
                            "font-medium truncate",
                            task.completed ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                            {task.title}
                        </h3>
                        <Badge variant="outline" className={cn("w-fit", getPriorityColor(task.priority))}>
                            {task.priority}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">{task.description}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                        {task.dueDate && (
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                        )}
                        {task.category && (
                            <Badge variant="secondary" className="text-xs">
                                {task.category}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="sm:opacity-0 group-hover:opacity-100 p-2 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-all duration-200">
                        <MoreHorizontal size={20} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onTaskUpdate?.(task.id, { completed: !task.completed })}>
                        Mark as {task.completed ? 'incomplete' : 'complete'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTaskDelete?.(task.id)} className="text-destructive">
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    const LoadingSkeleton = () => (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4">
                    <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                        <Skeleton className="h-5 w-full sm:w-1/3 mb-2" />
                        <Skeleton className="h-4 w-full sm:w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <Card className="bg-gradient-to-br from-background to-accent/10 border-none shadow-xl h-full">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                        Today&apos;s Tasks
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                                <Clock size={16} />
                                Today
                                <ChevronDown size={16} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Today</DropdownMenuItem>
                            <DropdownMenuItem>This Week</DropdownMenuItem>
                            <DropdownMenuItem>This Month</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="h-full">
                <ScrollArea className="h-full min-h-[320px] px-1 sm:px-2">
                    <div className="space-y-3">
                        {isLoading ? (
                            <LoadingSkeleton />
                        ) : tasks.length > 0 ? (
                            tasks.map(task => <TaskItem key={task.id} task={task} />)
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No tasks for today
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default TaskList;
