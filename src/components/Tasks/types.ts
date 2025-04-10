// Task-related type definitions
export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskAssignee {
  name: string;
  avatar: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee: TaskAssignee;
  tags: string[];
  project: string;
}

export interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  renderPriorityBadge: (priority: TaskPriority) => JSX.Element;
}

export interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  renderPriorityBadge: (priority: TaskPriority) => JSX.Element;
}

export interface TaskActionsProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}

export interface TaskMetadataProps {
  task: Task;
  renderPriorityBadge: (priority: TaskPriority) => JSX.Element;
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
  { value: 'todo' as const, label: 'To Do', color: 'bg-slate-500' },
  { value: 'in-progress' as const, label: 'In Progress', color: 'bg-blue-500' },
  { value: 'completed' as const, label: 'Completed', color: 'bg-green-500' },
];

export const priorityOptions = [
  { value: 'low' as const, label: 'Low', color: 'text-green-500' },
  { value: 'medium' as const, label: 'Medium', color: 'text-yellow-500' },
  { value: 'high' as const, label: 'High', color: 'text-red-500' },
];

export const sortOptions: TaskSortOption[] = [
  { label: 'Date (Newest First)', field: 'dueDate', direction: 'desc' },
  { label: 'Date (Oldest First)', field: 'dueDate', direction: 'asc' },
  { label: 'Priority (High to Low)', field: 'priority', direction: 'desc' },
  { label: 'Priority (Low to High)', field: 'priority', direction: 'asc' },
  { label: 'Alphabetical (A-Z)', field: 'title', direction: 'asc' },
  { label: 'Alphabetical (Z-A)', field: 'title', direction: 'desc' },
];
