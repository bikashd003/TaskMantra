import { Task } from '@/types/task';
import { TaskService } from './Task.service';
import { DateRange } from 'react-day-picker';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';

export class CalendarService {
    /**
     * Get tasks for a specific date range with filters
     */
    static async getTasksByDateRange(
        dateRange?: DateRange,
        filters?: {
            status?: string;
            priority?: string;
            assignedTo?: string;
            searchQuery?: string;
        }
    ): Promise<Task[]> {
        try {
            // If no date range is provided, use the current week
            const today = new Date();
            const from = dateRange?.from ? startOfDay(dateRange.from) : startOfDay(today);
            const to = dateRange?.to ? endOfDay(dateRange.to) : endOfDay(addDays(from, 6));

            // Format dates for API query
            const fromStr = format(from, 'yyyy-MM-dd');
            const toStr = format(to, 'yyyy-MM-dd');

            // Call the task service with date range filter and other filters
            const tasks = await TaskService.getAllTasks({
                dateRange: {
                    from: fromStr,
                    to: toStr
                },
                status: filters?.status,
                priority: filters?.priority,
                assignedTo: filters?.assignedTo,
                searchQuery: filters?.searchQuery
            });

            return tasks;
        } catch (error) {
            console.error('Error fetching tasks by date range:', error);
            throw new Error('Failed to fetch tasks for calendar');
        }
    }

    /**
     * Create a new task from the calendar
     */
    static async createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
        try {
            return await TaskService.createTask(taskData);
        } catch (error) {
            console.error('Error creating task from calendar:', error);
            throw new Error('Failed to create task');
        }
    }

    /**
     * Update a task from the calendar
     */
    static async updateTask(taskId: string, taskData: Partial<Task>): Promise<Task> {
        try {
            return await TaskService.updateTask(taskId, taskData);
        } catch (error) {
            console.error('Error updating task from calendar:', error);
            throw new Error('Failed to update task');
        }
    }

    /**
     * Delete a task from the calendar
     */
    static async deleteTask(taskId: string): Promise<void> {
        try {
            await TaskService.deleteTask(taskId);
        } catch (error) {
            console.error('Error deleting task from calendar:', error);
            throw new Error('Failed to delete task');
        }
    }
}
