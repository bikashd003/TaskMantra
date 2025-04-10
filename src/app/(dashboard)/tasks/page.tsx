"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

// Import components
import CreateTaskModal from "@/components/Tasks/CreateTaskModal";
import TaskHeader from "@/components/Tasks/TaskHeader";
import TaskFilters from "@/components/Tasks/TaskFilters";
import TaskList from "@/components/Tasks/TaskList";
import KanbanBoard from "@/components/Tasks/KanbanBoard";

// Import types
import {
    Task,
    TaskStatus,
    TaskPriority,
    TaskFilterState,
    TaskSortOption,
    sortOptions
} from "@/components/Tasks/types";

// Import services
import { TaskService } from "@/services/Task.service";

export default function TasksPage() {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<TaskFilterState>({
        searchQuery: "",
        status: "all",
        priority: "all"
    });
    const [currentSort, setCurrentSort] = useState<TaskSortOption>(sortOptions[0]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

    // Fetch tasks
    const { data: tasksData = [], isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const apiTasks = await TaskService.getAllTasks();
            // Transform API tasks to UI tasks
            return apiTasks.map((apiTask: any) => ({
                id: apiTask.id || apiTask._id,
                title: apiTask.title || apiTask.name,
                description: apiTask.description || "",
                status: (apiTask.status || "To Do").toLowerCase().replace(" ", "-") as TaskStatus,
                priority: (apiTask.priority || "Medium").toLowerCase() as TaskPriority,
                dueDate: apiTask.dueDate ? new Date(apiTask.dueDate).toISOString() : new Date().toISOString(),
                assignee: {
                    name: apiTask.assignee?.name || "Unassigned",
                    avatar: apiTask.assignee?.avatar || "",
                    initials: apiTask.assignee?.initials || "UA"
                },
                tags: apiTask.tags || [],
                project: apiTask.project || apiTask.projectId || ""
            }));
        }
    });

    // Mutations
    const createTaskMutation = useMutation({
        mutationFn: (taskData: any) => TaskService.createTask(taskData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task created successfully');
            setIsCreateModalOpen(false);
        },
        onError: (error: Error) => {
            toast.error('Failed to create task');
            console.error('Create task error:', error);
        },
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => {
            // Convert UI status format to API status format
            const apiStatus = status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ");
            return TaskService.updateTask(id, {
                status: apiStatus as any // Use type assertion to bypass type checking
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task updated successfully');
        },
        onError: (error: Error) => {
            toast.error('Failed to update task');
            console.error('Update task error:', error);
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: TaskService.deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task deleted successfully');
        },
        onError: (error: Error) => {
            toast.error('Failed to delete task');
            console.error('Delete task error:', error);
        },
    });

    // Filter and sort tasks
    const filteredTasks = React.useMemo(() => {
        if (!tasksData) return [];

        return tasksData.filter((task: Task) => {
            const matchesSearch =
                task.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
            const matchesStatus = filters.status === "all" || task.status === filters.status;
            const matchesPriority = filters.priority === "all" || task.priority === filters.priority;
            return matchesSearch && matchesStatus && matchesPriority;
        }).sort((a: Task, b: Task) => {
            if (!currentSort.field) return 0;

            const fieldA = a[currentSort.field];
            const fieldB = b[currentSort.field];

            if (typeof fieldA === 'string' && typeof fieldB === 'string') {
                return currentSort.direction === 'asc'
                    ? fieldA.localeCompare(fieldB)
                    : fieldB.localeCompare(fieldA);
            }

            return 0;
        });
    }, [tasksData, filters, currentSort]);

    // Group tasks for kanban view
    const groupedTasks = React.useMemo(() => ({
        todo: filteredTasks.filter((task: Task) => task.status === "todo"),
        inProgress: filteredTasks.filter((task: Task) => task.status === "in-progress"),
        completed: filteredTasks.filter((task: Task) => task.status === "completed")
    }), [filteredTasks]);

    // Event handlers
    const handleFilterChange = useCallback((newFilters: Partial<TaskFilterState>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const handleSortChange = useCallback((sortOption: TaskSortOption) => {
        setCurrentSort(sortOption);
    }, []);

    const handleStatusChange = useCallback((taskId: string, newStatus: TaskStatus) => {
        updateTaskMutation.mutate({ id: taskId, status: newStatus });
    }, [updateTaskMutation]);

    const handleDeleteTask = useCallback((taskId: string) => {
        deleteTaskMutation.mutate(taskId);
    }, [deleteTaskMutation]);

    const handleCreateTask = useCallback((taskData: any) => {
        createTaskMutation.mutate({
            name: taskData.title,
            title: taskData.title,
            description: taskData.description,
            status: taskData.status.charAt(0).toUpperCase() + taskData.status.slice(1).replace("-", " "),
            priority: taskData.priority.toUpperCase(),
            dueDate: new Date(taskData.dueDate),
            startDate: new Date(),
            estimatedTime: 0,
            loggedTime: 0,
            createdBy: '',
            dependencies: [],
            assignedTo: [],
            subtasks: [],
            comments: [],
            completed: false,
            tags: taskData.tags,
            project: taskData.project,
            assignee: taskData.assignee
        });
    }, [createTaskMutation]);

    const renderPriorityBadge = useCallback((priority: TaskPriority) => {
        const colors: Record<TaskPriority, string> = {
            low: "bg-green-100 text-green-800 hover:bg-green-100",
            medium: "bg-blue-100 text-blue-800 hover:bg-blue-100",
            high: "bg-red-100 text-red-800 hover:bg-red-100"
        };

        return (
            <Badge className={`${colors[priority]} border-none`} variant="outline">
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
        );
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white px-4 rounded-md py-6"
        >
            <TaskHeader onCreateTask={() => setIsCreateModalOpen(true)} />

            <TaskFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                currentSort={currentSort}
            />

            <Tabs defaultValue="kanban" className="my-4">
                <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="kanban">Kanban View</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    <TaskList
                        tasks={filteredTasks}
                        searchQuery={filters.searchQuery}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteTask}
                        renderPriorityBadge={renderPriorityBadge}
                        onCreateTask={() => setIsCreateModalOpen(true)}
                        isLoading={isLoading}
                    />
                </TabsContent>

                <TabsContent value="kanban">
                    <KanbanBoard
                        tasks={groupedTasks}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteTask}
                        renderPriorityBadge={renderPriorityBadge}
                        isLoading={isLoading}
                    />
                </TabsContent>
            </Tabs>

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreateTask={(taskData) => handleCreateTask({
                    ...taskData,
                    status: taskData.status as TaskStatus,
                    priority: taskData.priority.toLowerCase() as TaskPriority,
                    assignee: {
                        name: 'Unassigned',
                        avatar: '',
                        initials: 'UA'
                    },
                    tags: taskData.tags || [],
                    project: taskData.project || ''
                })}
                isLoading={createTaskMutation.isPending}
            />
        </motion.div>
    );
}

