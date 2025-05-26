import { create } from 'zustand';

interface SidebarStore {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>(set => ({
  isExpanded: true,
  setIsExpanded: isExpanded => set({ isExpanded }),
}));
