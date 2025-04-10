import { Task } from '@/types/task';

export class TaskService {
    static async getAllTasks(): Promise<Task[]> {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        return response.json();
    }

    static async createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
        });
        
        if (!response.ok) {
            throw new Error('Failed to create task');
        }
        return response.json();
    }

    static async updateTask(taskId: string, taskData: Partial<Task>): Promise<Task> {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
        });

        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        return response.json();
    }

    static async deleteTask(taskId: string): Promise<void> {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
    }

    static async getTaskById(taskId: string): Promise<Task> {
        const response = await fetch(`/api/tasks/${taskId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch task');
        }
        return response.json();
    }
}
