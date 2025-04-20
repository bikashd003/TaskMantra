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

export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Completed';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Task {
  _id: string;
  name: string;
  title: string;
  description: string;
  createdBy: string;
  projectId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  startDate: Date;
  estimatedTime: number;
  loggedTime: number;
  completed: boolean;

  // References
  dependencies: string[]; // Task IDs
  assignedTo: string[]; // User IDs

  // Nested structures
  subtasks: Subtask[];
  comments: Comment[];

  // Optional metadata
  tags?: string[];
  category?: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  projectId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface TaskSortOptions {
  field: keyof Task;
  direction: 'asc' | 'desc';
}
