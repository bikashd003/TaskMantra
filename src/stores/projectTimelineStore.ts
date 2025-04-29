import { create } from 'zustand';
import { TimelineService, TimelineItem as BackendTimelineItem } from '@/services/Timeline.service';
import { toast } from '@/hooks/use-toast';

export interface FrontendTimelineItem {
  _id?: string;
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  projectId?: string;
  progress?: number;
  color?: string;
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

interface TimelineState {
  items: FrontendTimelineItem[];
  isLoading: boolean;
  error: string | null;
  filter: string;
  selectedItem: FrontendTimelineItem | null;

  // Actions
  fetchTimelineItems: (filters?: {
    projectId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => Promise<void>;
  createTimelineItem: (item: Omit<FrontendTimelineItem, '_id'>) => Promise<void>;
  updateTimelineItem: (id: string, data: Partial<FrontendTimelineItem>) => Promise<void>;
  deleteTimelineItem: (id: string) => Promise<void>;
  updateItemStatus: (id: string, status: FrontendTimelineItem['status']) => Promise<void>;
  setFilter: (filter: string) => void;
  setSelectedItem: (item: FrontendTimelineItem | null) => void;
  reset: () => void;
}

// Convert backend status to frontend status
const mapStatusToFrontend = (
  backendStatus: BackendTimelineItem['status']
): FrontendTimelineItem['status'] => {
  const statusMap: Record<BackendTimelineItem['status'], FrontendTimelineItem['status']> = {
    planned: 'planned',
    in_progress: 'in_progress',
    completed: 'completed',
    delayed: 'delayed',
  };
  return statusMap[backendStatus] || 'planned';
};

// Convert frontend status to backend status
const mapStatusToBackend = (
  frontendStatus: FrontendTimelineItem['status']
): BackendTimelineItem['status'] => {
  const statusMap: Record<FrontendTimelineItem['status'], BackendTimelineItem['status']> = {
    planned: 'planned',
    in_progress: 'in_progress',
    completed: 'completed',
    delayed: 'delayed',
  };
  return statusMap[frontendStatus];
};

// Format timeline items from backend to frontend format
const formatTimelineItems = (items: any[]): FrontendTimelineItem[] => {
  return items.map(item => ({
    _id: item._id,
    id: item._id || item.id,
    title: item.title,
    description: item.description || '',
    startDate: item.startDate,
    endDate: item.endDate,
    status: mapStatusToFrontend(item.status),
    projectId: item.projectId?._id || item.projectId,
    progress: item.progress || 0,
    color: item.color || '#3498db',
    users: (item.users || []).map((user: any) => ({
      id: user._id || user.id,
      name: user.name,
      avatar: user.image || user.avatar,
    })),
  }));
};

export const useProjectTimelineStore = create<TimelineState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  filter: 'all',
  selectedItem: null,

  fetchTimelineItems: async filters => {
    set({ isLoading: true, error: null });
    try {
      const response = await TimelineService.getTimelineItems(filters);
      if (response.timelineItems) {
        const formattedItems = formatTimelineItems(response.timelineItems);
        set({ items: formattedItems });
      } else {
        set({ items: [] });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch timeline items' });
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch timeline items',
        variant: 'destructive',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createTimelineItem: async item => {
    set({ isLoading: true, error: null });
    try {
      const backendItem: BackendTimelineItem = {
        title: item.title,
        description: item.description,
        startDate: item.startDate,
        endDate: item.endDate,
        status: mapStatusToBackend(item.status),
        projectId: item.projectId || '',
        progress: item.progress,
        color: item.color,
        users: item.users.map(user => user.id),
      };

      const response = await TimelineService.createTimelineItem(backendItem);
      if (response.timelineItem) {
        await get().fetchTimelineItems();
        toast({
          title: 'Success',
          description: 'Timeline item created successfully',
          variant: 'default',
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to create timeline item' });
      toast({
        title: 'Error',
        description: error.message || 'Failed to create timeline item',
        variant: 'destructive',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateTimelineItem: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const backendData: Partial<BackendTimelineItem> = {};

      if (data.title !== undefined) backendData.title = data.title;
      if (data.description !== undefined) backendData.description = data.description;
      if (data.startDate !== undefined) backendData.startDate = data.startDate;
      if (data.endDate !== undefined) backendData.endDate = data.endDate;
      if (data.progress !== undefined) backendData.progress = data.progress;
      if (data.color !== undefined) backendData.color = data.color;
      if (data.projectId !== undefined) backendData.projectId = data.projectId;

      if (data.status) {
        backendData.status = mapStatusToBackend(data.status);
      }

      if (data.users) {
        backendData.users = data.users.map(user => user.id);
      }

      const response = await TimelineService.updateTimelineItem(id, backendData);
      if (response.timelineItem) {
        const updatedItems = get().items.map(item =>
          item._id === id || item.id === id ? { ...item, ...data } : item
        );
        set({ items: updatedItems });

        const selectedItem = get().selectedItem;
        if (selectedItem && (selectedItem._id === id || selectedItem.id === id)) {
          set({ selectedItem: { ...selectedItem, ...data } });
        }

        toast({
          title: 'Success',
          description: 'Timeline item updated successfully',
          variant: 'default',
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update timeline item' });
      toast({
        title: 'Error',
        description: error.message || 'Failed to update timeline item',
        variant: 'destructive',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTimelineItem: async id => {
    set({ isLoading: true, error: null });
    try {
      await TimelineService.deleteTimelineItem(id);

      // Remove the item from the local state
      const updatedItems = get().items.filter(item => item._id !== id && item.id !== id);
      set({ items: updatedItems });

      // If the deleted item is the selected item, clear the selection
      const selectedItem = get().selectedItem;
      if (selectedItem && (selectedItem._id === id || selectedItem.id === id)) {
        set({ selectedItem: null });
      }

      toast({
        title: 'Success',
        description: 'Timeline item deleted successfully',
        variant: 'default',
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete timeline item' });
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete timeline item',
        variant: 'destructive',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateItemStatus: async (id, status) => {
    await get().updateTimelineItem(id, { status });
  },

  setFilter: filter => {
    set({ filter });
    const currentFilter = filter === 'all' ? undefined : filter;
    get().fetchTimelineItems({ status: currentFilter });
  },

  setSelectedItem: item => {
    set({ selectedItem: item });
  },

  reset: () => {
    set({
      items: [],
      isLoading: false,
      error: null,
      filter: 'all',
      selectedItem: null,
    });
  },
}));
