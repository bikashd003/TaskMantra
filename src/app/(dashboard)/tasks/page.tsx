"use client";

import React, { useState, useCallback, useEffect } from "react";
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

    // Debounce search query to prevent excessive API calls
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

    // Update debounced search query after a delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(filters.searchQuery);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [filters.searchQuery]);

    // Fetch tasks with filters applied on the backend
    const { data: tasksData = [], isLoading } = useQuery({
        queryKey: ['tasks', debouncedSearchQuery, filters.status, filters.priority, currentSort],
        queryFn: async () => {
            const apiTasks = await TaskService.getAllTasks({
                searchQuery: debouncedSearchQuery,
                status: filters.status,
                priority: filters.priority,
                sortField: currentSort.field as string,
                sortDirection: currentSort.direction
            });

            // Transform API tasks to UI tasks if needed
            return apiTasks.map((apiTask: any) => ({
                id: apiTask.id || apiTask._id,
                name: apiTask.name,
                description: apiTask.description || "",
                status: apiTask.status || "To Do",
                priority: apiTask.priority || "Medium",
                dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : new Date(),
                startDate: apiTask.startDate ? new Date(apiTask.startDate) : new Date(),
                estimatedTime: apiTask.estimatedTime || 0,
                loggedTime: apiTask.loggedTime || 0,
                createdBy: apiTask.createdBy || "",
                projectId: apiTask.projectId || null,
                dependencies: apiTask.dependencies || [],
                subtasks: apiTask.subtasks || [],
                comments: apiTask.comments || [],
                assignedTo: apiTask.assignedTo || [],
                completed: apiTask.completed || false,
                tags: apiTask.tags || [],
                createdAt: apiTask.createdAt ? new Date(apiTask.createdAt) : undefined,
                updatedAt: apiTask.updatedAt ? new Date(apiTask.updatedAt) : undefined
            }));
        },
        // These settings will override the global defaults if needed
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true,
        refetchOnMount: false, // Don't refetch when component mounts if data is fresh
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
            // Invalidate all task queries regardless of filters
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
            // Invalidate all task queries regardless of filters
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task deleted successfully');
        },
        onError: (error: Error) => {
            toast.error('Failed to delete task');
            console.error('Delete task error:', error);
        },
    });

    // Tasks are now filtered and sorted on the backend
    const filteredTasks = React.useMemo(() => {
        if (!tasksData) return [];
        return tasksData;
    }, [tasksData]);

    // Group tasks for kanban view
    const groupedTasks = React.useMemo(() => ({
        todo: filteredTasks.filter((task: Task) => task.status === "To Do" || task.status.toLowerCase() === "todo"),
        inProgress: filteredTasks.filter((task: Task) => task.status === "In Progress" || task.status.toLowerCase() === "in progress"),
        review: filteredTasks.filter((task: Task) => task.status === "Review" || task.status.toLowerCase() === "review"),
        completed: filteredTasks.filter((task: Task) => task.status === "Completed" || task.status.toLowerCase() === "completed")
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
            name: taskData.name,
            description: taskData.description,
            status: taskData.status,
            priority: taskData.priority,
            dueDate: new Date(taskData.dueDate),
            startDate: taskData.startDate ? new Date(taskData.startDate) : new Date(),
            estimatedTime: taskData.estimatedTime || 0,
            loggedTime: taskData.loggedTime || 0,
            createdBy: '',
            projectId: null, //TODO: get project id from created project dropdown
            dependencies: taskData.dependencies || [],
            assignedTo: taskData.assignedTo || [],
            subtasks: taskData.subtasks || [],
            comments: taskData.comments || [],
            completed: taskData.completed || false,
            tags: taskData.tags || []
        });
    }, [createTaskMutation]);

    const renderPriorityBadge = useCallback((priority: TaskPriority) => {
        const colors: Record<string, string> = {
            'Low': "bg-green-100 text-green-800 hover:bg-green-100",
            'Medium': "bg-blue-100 text-blue-800 hover:bg-blue-100",
            'High': "bg-red-100 text-red-800 hover:bg-red-100"
        };

        return (
            <Badge className={`${colors[priority] || colors['Medium']} border-none`} variant="outline">
                {priority}
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
                    priority: taskData.priority as TaskPriority,
                    assignedTo: taskData.assignedTo || [],
                    tags: taskData.tags || [],
                    projectId: taskData.projectId || ''
                })}
                isLoading={createTaskMutation.isPending}
            />
        </motion.div>
    );
}

