'use client';

import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import CreateTaskModal from '@/components/Tasks/CreateTaskModal';
import TaskBoard from '@/components/Tasks/TaskBoard';
import { TaskStatus, TaskPriority, TaskFilterState, sortOptions } from '@/components/Tasks/types';
import { TaskService } from '@/services/Task.service';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const filters = {
    searchQuery: '',
    status: 'all',
    priority: 'all',
  } as TaskFilterState;
  const currentSort = sortOptions[0];
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const debouncedSearchQuery = '';

  const { data: tasksData = [], isLoading } = useQuery({
    queryKey: ['tasks', debouncedSearchQuery, filters.status, filters.priority, currentSort],
    queryFn: async () => {
      const apiTasks = await TaskService.getAllTasks({
        searchQuery: debouncedSearchQuery,
        status: filters.status,
        priority: filters.priority,
        sortField: currentSort.field as string,
        sortDirection: currentSort.direction,
      });

      return apiTasks.map((apiTask: any) => ({
        id: apiTask.id || apiTask._id,
        name: apiTask.name,
        description: apiTask.description || '',
        status: apiTask.status || 'To Do',
        priority: apiTask.priority || 'Medium',
        dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : new Date(),
        startDate: apiTask.startDate ? new Date(apiTask.startDate) : new Date(),
        estimatedTime: apiTask.estimatedTime || 0,
        loggedTime: apiTask.loggedTime || 0,
        createdBy: apiTask.createdBy || '',
        projectId: apiTask.projectId || null,
        dependencies: apiTask.dependencies || [],
        subtasks: apiTask.subtasks || [],
        comments: apiTask.comments || [],
        assignedTo: apiTask.assignedTo || [],
        completed: apiTask.completed || false,
        tags: apiTask.tags || [],
        createdAt: apiTask.createdAt ? new Date(apiTask.createdAt) : undefined,
        updatedAt: apiTask.updatedAt ? new Date(apiTask.updatedAt) : undefined,
      }));
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (taskData: any) => TaskService.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
      setIsCreateModalOpen(false);
    },
    onError: (_error: Error) => {
      toast.error('Failed to create task');
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      const apiStatus = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
      return TaskService.updateTask(id, {
        status: apiStatus as any,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (_error: Error) => {
      toast.error('Failed to update task');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [key: string]: any }) => {
      return TaskService.updateTask(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully');
    },
    onError: (_error: Error) => {
      toast.error('Failed to update task');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: TaskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (_error: Error) => {
      toast.error('Failed to delete task');
    },
  });

  const filteredTasks = React.useMemo(() => {
    if (!tasksData) return [];
    return tasksData;
  }, [tasksData]);

  const handleStatusChange = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      updateTaskStatusMutation.mutate({ id: taskId, status: newStatus });
    },
    [updateTaskStatusMutation]
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      deleteTaskMutation.mutate(taskId);
    },
    [deleteTaskMutation]
  );

  const handleCreateTask = useCallback(
    (taskData: any) => {
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
        tags: taskData.tags || [],
      });
    },
    [createTaskMutation]
  );

  const handleUpdateTask = useCallback(
    (taskId: string, updates: any) => {
      updateTaskMutation.mutate({ id: taskId, ...updates });
    },
    [updateTaskMutation]
  );

  const renderPriorityBadge = useCallback((priority: TaskPriority) => {
    const colors: Record<string, string> = {
      Low: 'bg-green-100 text-green-800 hover:bg-green-100',
      Medium: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      High: 'bg-red-100 text-red-800 hover:bg-red-100',
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
      className="bg-white px-4 rounded-md py-2 h-full w-full"
    >
      <TaskBoard
        tasks={filteredTasks}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteTask}
        onAddTask={handleCreateTask}
        renderPriorityBadge={renderPriorityBadge}
        isLoading={isLoading}
        onCreateTask={() => setIsCreateModalOpen(true)}
        onUpdateTask={handleUpdateTask}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={taskData =>
          handleCreateTask({
            ...taskData,
            status: taskData.status as TaskStatus,
            priority: taskData.priority as TaskPriority,
            assignedTo: taskData.assignedTo || [],
            tags: taskData.tags || [],
            projectId: taskData.projectId || '',
          })
        }
        isLoading={createTaskMutation.isPending}
      />
    </motion.div>
  );
}
