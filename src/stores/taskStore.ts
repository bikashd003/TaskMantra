import { create } from 'zustand';

interface TaskStore {
  tasks: any[];
  setTasks: (tasks: any[]) => void;
}

export const useTaskStore = create<TaskStore>(set => ({
  tasks: [],
  setTasks: tasks => set({ tasks }),
}));
