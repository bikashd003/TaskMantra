import React from 'react';
import { MoreHorizontal, CheckCircle, ChevronDown } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const TaskList = () => {
    const tasks = [
        { id: 1, title: 'Navigation bar', description: 'Design and implement top nav', completed: true },
        { id: 2, title: 'Auth function', description: 'Implement user authentication', completed: true },
        { id: 3, title: 'About page', description: 'Create about page and HTML', completed: false },
        { id: 4, title: 'Create database', description: 'Database for data of customers', completed: false },
    ];

    return (
        <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-md h-[calc(40vh-3rem)]">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <h2 className="font-semibold text-foreground">Today&apos;s Tasks</h2>
                    <button className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors">
                        Today
                        <ChevronDown size={16} />
                    </button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[calc(40vh-8rem)] px-2">
                    <div className="space-y-3">
                        {tasks.map(task => (
                            <div
                                key={task.id}
                                className={cn(
                                    "group flex items-center justify-between p-3 rounded-lg",
                                    "bg-background/50 hover:bg-accent/50 transition-all duration-200",
                                    "border border-border/50"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                                            task.completed
                                                ? "bg-success/15 text-success"
                                                : "bg-primary/15 text-primary"
                                        )}
                                    >
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <h3 className={cn(
                                            "font-medium",
                                            task.completed ? "text-muted-foreground" : "text-foreground"
                                        )}>
                                            {task.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{task.description}</p>
                                    </div>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all duration-200">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default TaskList;
