import { Task } from '@/components/Tasks/types';
import axios from 'axios';

export class TaskService {
  static async getAllTasks(filters?: {
    searchQuery?: string;
    status?: string;
    priority?: string;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    dateRange?: {
      from: string;
      to: string;
    };
    assignedTo?: string;
  }): Promise<Task[]> {
    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters?.searchQuery) {
        params.append('search', filters.searchQuery);
      }

      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }

      if (filters?.priority && filters.priority !== 'all') {
        params.append('priority', filters.priority);
      }

      if (filters?.sortField) {
        params.append('sortField', filters.sortField);
      }

      if (filters?.sortDirection) {
        params.append('sortDirection', filters.sortDirection);
      }

      if (filters?.dateRange) {
        params.append('fromDate', filters.dateRange.from);
        params.append('toDate', filters.dateRange.to);
      }

      if (filters?.assignedTo) {
        params.append('assignedTo', filters.assignedTo);
      }

      const queryString = params.toString();
      const url = queryString ? `/api/tasks?${queryString}` : '/api/tasks';

      const response = await axios.get(url);
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
      return response.data.task;
    } catch (error) {
      throw new Error('Failed to fetch task');
    }
  }

  static async getTasksByTimePeriod(period: 'today' | 'week' | 'month'): Promise<Task[]> {
    try {
      const response = await axios.get(`/api/tasks/period/${period}`);
      return response.data?.tasks || [];
    } catch (error) {
      throw new Error(`Failed to fetch ${period}'s tasks`);
    }
  }
  static async updateTaskStatus(taskId: string, status: string): Promise<Task> {
    try {
      const response = await axios.patch(`/api/tasks/${taskId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error('Failed to update task status');
    }
  }

  // Keeping this for backward compatibility
  static async getTodaysTasks(): Promise<Task[]> {
    return this.getTasksByTimePeriod('today');
  }

  static async getMyTasks(): Promise<Task[]> {
    try {
      const response = await axios.get('/api/tasks/my-tasks');
      return response.data?.tasks || [];
    } catch (error) {
      throw new Error('Failed to fetch my tasks');
    }
  }
}
