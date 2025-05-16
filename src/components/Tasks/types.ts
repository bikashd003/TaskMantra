// Task-related type definitions
export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Completed';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Attachment {
  filename: string;
  url: string;
}

export interface Comment {
  userId: string;
  text: string;
  timestamp: Date;
  attachments: Attachment[];
}

export interface Subtask {
  name: string;
  completed: boolean;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  image?: string;
}

import React from 'react';

export interface CalendarMetadata {
  isStartDate: boolean;
  isEndDate: boolean;
  isContinuation: boolean;
  datePosition: number;
  totalDates: number;
}

export interface Task {
  id: string;
  name: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
  dueDate?: Date;
  startDate?: Date;
  estimatedTime?: number;
  loggedTime?: number;
  assignedTo?: any[];
  subtasks?: any[];
  createdBy: string;
  projectId?: string;
  dependencies: string[];
  comments: Comment[];
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  renderPriorityBadge: (priority: TaskPriority) => React.ReactNode;
}

export interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  renderPriorityBadge: (priority: TaskPriority) => React.ReactNode;
  id?: string;
  onTaskClick?: (taskId: string) => void;
}

export interface TaskActionsProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}

export interface TaskMetadataProps {
  task: Task;
  renderPriorityBadge: (priority: TaskPriority) => React.ReactNode;
}

export interface TaskFilterState {
  searchQuery: string;
  status: string;
  priority: string;
}

export interface TaskSortOption {
  label: string;
  field: keyof Task | null;
  direction: 'asc' | 'desc';
}

export const statusOptions = [
  { value: 'To Do' as const, label: 'To Do', color: 'bg-slate-500' },
  { value: 'In Progress' as const, label: 'In Progress', color: 'bg-blue-500' },
  { value: 'Review' as const, label: 'Review', color: 'bg-amber-500' },
  { value: 'Completed' as const, label: 'Completed', color: 'bg-green-500' },
];

export const priorityOptions = [
  { value: 'Low' as const, label: 'Low', color: 'text-green-500' },
  { value: 'Medium' as const, label: 'Medium', color: 'text-yellow-500' },
  { value: 'High' as const, label: 'High', color: 'text-red-500' },
];

export const sortOptions: TaskSortOption[] = [
  { label: 'Date (Newest First)', field: 'dueDate', direction: 'desc' },
  { label: 'Date (Oldest First)', field: 'dueDate', direction: 'asc' },
  { label: 'Priority (High to Low)', field: 'priority', direction: 'desc' },
  { label: 'Priority (Low to High)', field: 'priority', direction: 'asc' },
  { label: 'Alphabetical (A-Z)', field: 'name', direction: 'asc' },
  { label: 'Alphabetical (Z-A)', field: 'name', direction: 'desc' },
];
