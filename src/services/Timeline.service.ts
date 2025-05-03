import axios from 'axios';

export interface TimelineItem {
  _id?: string;
  title: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  projectId: string;
  progress?: number;
  users?: string[];
  dependencies?: string[];
  color?: string;
}

export class TimelineService {
  static async getTimelineItems(filters?: {
    projectId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<any> {
    try {
      let url = '/api/timeline';

      // Add query parameters if filters are provided
      if (filters) {
        const queryParams = new URLSearchParams();

        if (filters.projectId) queryParams.append('projectId', filters.projectId);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.search) queryParams.append('search', filters.search);

        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch timeline items');
    }
  }

  static async getTimelineItemById(id: string): Promise<any> {
    try {
      const response = await axios.get(`/api/timeline/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch timeline item');
    }
  }

  static async createTimelineItem(data: TimelineItem): Promise<any> {
    try {
      const response = await axios.post('/api/timeline', data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create timeline item');
    }
  }

  static async updateTimelineItem(id: string, data: Partial<TimelineItem>): Promise<any> {
    try {
      const response = await axios.patch(`/api/timeline/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update timeline item');
    }
  }

  static async deleteTimelineItem(id: string): Promise<any> {
    try {
      const response = await axios.delete(`/api/timeline/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete timeline item');
    }
  }

  static async getProjectUsers(projectId: string): Promise<any> {
    try {
      const response = await axios.get(`/api/timeline/users/${projectId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch project users');
    }
  }
}
