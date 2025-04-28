import axios from 'axios';

export class ProjectService {
  static async getProjects(): Promise<any> {
    try {
      const response = await axios.get('/api/get-all-projects');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch projects');
    }
  }

  static async getProjectById(projectId: string): Promise<any> {
    try {
      const response = await axios.get(`/api/get-project/${projectId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch project');
    }
  }
}
