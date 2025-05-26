import axios from 'axios';

export interface AnalyticsOverview {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalLoggedTime: number;
  totalEstimatedTime: number;
  completionRate: number;
  productivityRate: number;
  totalUsers: number;
  activeProjects: number;
}

export interface TeamMemberPerformance {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  metrics: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    totalLoggedTime: number;
    totalEstimatedTime: number;
    efficiency: number;
    weeklyHours: number;
    averageTasksPerWeek: number;
  };
}

export interface TimeTrackingData {
  dailyTracking: Array<{
    date: string;
    hours: number;
  }>;
  userTracking: Array<{
    name: string;
    hours: number;
  }>;
  totalHours: number;
}

export interface ProjectAnalytics {
  id: string;
  name: string;
  status: string;
  priority: string;
  createdBy: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalLoggedTime: number;
  totalEstimatedTime: number;
  createdAt: string;
}

export class AnalyticsService {
  static async getOverview(): Promise<AnalyticsOverview> {
    try {
      const response = await axios.get('/api/analytics/overview');
      return response.data.overview;
    } catch (error) {
      throw new Error('Failed to fetch analytics overview');
    }
  }

  static async getTeamPerformance(): Promise<TeamMemberPerformance[]> {
    try {
      const response = await axios.get('/api/analytics/team-performance');
      return response.data.teamPerformance;
    } catch (error) {
      throw new Error('Failed to fetch team performance data');
    }
  }

  static async getTimeTracking(): Promise<TimeTrackingData> {
    try {
      const response = await axios.get('/api/analytics/time-tracking');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch time tracking data');
    }
  }

  static async getProjectAnalytics(): Promise<ProjectAnalytics[]> {
    try {
      const response = await axios.get('/api/analytics/projects');
      return response.data.projects;
    } catch (error) {
      throw new Error('Failed to fetch project analytics');
    }
  }
}
