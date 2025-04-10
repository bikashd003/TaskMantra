import { Task } from '@/types/task';
import axios from 'axios';

export class TaskService {
    static async getAllTasks(): Promise<Task[]> {
        try {
            const response = await axios.get('/api/tasks');
            return response.data?.tasks || [];
        } catch (error) {
            throw new Error('Failed to fetch tasks');
        }
    }

    static async createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
        try {
            const response = await axios.post('/api/tasks', taskData);
            return response.data;
        } catch (error) {
            throw new Error('Failed to create task');
        }
    }

    static async updateTask(taskId: string, taskData: Partial<Task>): Promise<Task> {
        try {
            const response = await axios.patch(`/api/tasks/${taskId}`, taskData);
            return response.data;
        } catch (error) {
            throw new Error('Failed to update task');
        }
    }

    static async deleteTask(taskId: string): Promise<void> {
        try {
            await axios.delete(`/api/tasks/${taskId}`);
        } catch (error) {
            throw new Error('Failed to delete task');
        }
    }

    static async getTaskById(taskId: string): Promise<Task> {
        try {
            const response = await axios.get(`/api/tasks/${taskId}`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch task');
        }
    }
}
