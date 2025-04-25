import { Task, TaskStatus } from './types';
import { UniqueIdentifier } from '@dnd-kit/core';
import { KanbanColumn } from '@/services/KanbanSettings.service';

// Type definitions for drag and drop
export type ColumnDragData = {
  type: 'column';
  column: {
    id: string;
    title: string;
  };
};

export type TaskDragData = {
  type: 'task';
  task: Task;
};

export type DraggableData = ColumnDragData | TaskDragData;

// Helper function to check if an item has draggable data
export function hasDraggableData(item: {
  data?: { current?: any };
}): item is { data: { current: DraggableData } } {
  return item.data?.current?.type === 'column' || item.data?.current?.type === 'task';
}

// Helper function to get task data for announcements
export function getDraggingTaskData(
  taskId: UniqueIdentifier,
  columnId: string,
  tasks: Task[],
  columns: KanbanColumn[]
) {
  const tasksInColumn = tasks.filter(task => task.status === getStatusFromColumnId(columnId));
  const taskPosition = tasksInColumn.findIndex(task => task.id === taskId);
  const column = columns.find(col => col.id === columnId);

  return {
    tasksInColumn,
    taskPosition,
    column,
  };
}

// Helper function to convert column ID to task status
export function getStatusFromColumnId(columnId: string): TaskStatus {
  const statusMap: Record<string, TaskStatus> = {
    todo: 'To Do',
    inProgress: 'In Progress',
    review: 'Review',
    completed: 'Completed',
  };

  return statusMap[columnId] || 'To Do';
}

// Helper function to convert task status to column ID
export function getColumnIdFromStatus(status: TaskStatus): string {
  const columnMap: Record<TaskStatus, string> = {
    'To Do': 'todo',
    'In Progress': 'inProgress',
    Review: 'review',
    Completed: 'completed',
  };

  return columnMap[status] || 'todo';
}
