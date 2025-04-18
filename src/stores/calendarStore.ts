/* eslint-disable no-unused-vars */
import { create } from "zustand";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Task } from "@/types/task";

interface CalendarTask {
  id: string;
  title: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  completed: boolean;
  status: string;
  priority: string;
  assignedTo: any[];
  color?: string;
}

interface CalendarFilters {
  status: string;
  priority: string;
  assignedTo: string;
  searchQuery: string;
}

interface CalendarState {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  selectedDate: Date | null;
  tasks: CalendarTask[];
  isLoading: boolean;
  error: string | null;
  selectedTask: CalendarTask | null;
  filters: CalendarFilters;
  setSelectedDate: (date: Date | null) => void;
  setTasks: (tasks: CalendarTask[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedTask: (task: CalendarTask | null) => void;
  setFilter: (key: keyof CalendarFilters, value: string) => void;
  resetFilters: () => void;
  convertApiTaskToCalendarTask: (apiTask: Task) => CalendarTask;
}

// Helper function to convert API task to calendar task format
const convertApiTaskToCalendarTask = (apiTask: Task): CalendarTask => {
  return {
    id: apiTask.id,
    title: apiTask.name,
    name: apiTask.name,
    description: apiTask.description,
    startDate: apiTask.startDate ? format(new Date(apiTask.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    endDate: apiTask.dueDate ? format(new Date(apiTask.dueDate), 'yyyy-MM-dd') : format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    dueDate: apiTask.dueDate ? format(new Date(apiTask.dueDate), 'yyyy-MM-dd') : format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    completed: apiTask.completed,
    status: apiTask.status,
    priority: apiTask.priority,
    assignedTo: apiTask.assignedTo || [],
    color: getPriorityColor(apiTask.priority),
  };
};

// Get color based on priority
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 hover:bg-red-200 border-red-200';
    case 'Medium':
      return 'bg-yellow-100 hover:bg-yellow-200 border-yellow-200';
    case 'Low':
      return 'bg-green-100 hover:bg-green-200 border-green-200';
    default:
      return 'bg-blue-100 hover:bg-blue-200 border-blue-200';
  }
};

export const useCalendarStore = create<CalendarState>((set) => ({
  dateRange: {
    from: new Date(),
    to: addDays(new Date(), 6),
  },
  setDateRange: (range) => set({ dateRange: range }),
  selectedDate: null,
  tasks: [],
  isLoading: false,
  error: null,
  selectedTask: null,
  filters: {
    status: 'all',
    priority: 'all',
    assignedTo: '',
    searchQuery: ''
  },
  setSelectedDate: (date) => set({ selectedDate: date }),
  setTasks: (tasks) => set({ tasks }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setFilter: (key, value) => set((state) => ({
    filters: {
      ...state.filters,
      [key]: value
    }
  })),
  resetFilters: () => set({
    filters: {
      status: 'all',
      priority: 'all',
      assignedTo: '',
      searchQuery: ''
    }
  }),
  convertApiTaskToCalendarTask,
}));
