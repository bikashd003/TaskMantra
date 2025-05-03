import { create } from 'zustand';

interface ProjectStore {
  projects: any[];
  setProjects: (projects: any[]) => void;
}

export const useProjectStore = create<ProjectStore>(set => ({
  projects: [],
  setProjects: projects => set({ projects }),
}));
