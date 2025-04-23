import axios from 'axios';

export interface KanbanColumn {
  id: string;
  title: string;
  order: number;
}

export interface KanbanSettingsData {
  userId: string;
  columns: KanbanColumn[];
  defaultView: 'kanban' | 'list' | 'calendar';
  compactView: boolean;
  showCompletedTasks: boolean;
  columnWidth: number;
}

export class KanbanSettingsService {
  static async getSettings(): Promise<KanbanSettingsData> {
    try {
      const response = await axios.get('/api/kanban-settings');
      return response.data.settings;
    } catch (error) {
      throw new Error('Failed to fetch kanban settings');
    }
  }

  static async updateSettings(settings: Partial<KanbanSettingsData>): Promise<KanbanSettingsData> {
    try {
      const response = await axios.patch('/api/kanban-settings', settings);
      return response.data.settings;
    } catch (error) {
      throw new Error('Failed to update kanban settings');
    }
  }

  static async updateColumns(columns: KanbanColumn[]): Promise<KanbanSettingsData> {
    try {
      const response = await axios.patch('/api/kanban-settings/columns', { columns });
      return response.data.settings;
    } catch (error) {
      throw new Error('Failed to update kanban columns');
    }
  }
}
