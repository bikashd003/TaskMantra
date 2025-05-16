import axios from 'axios';

export class IntegrationService {
  static async getIntegrations() {
    try {
      const response = await axios.get('/api/integrations');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch integrations');
    }
  }

  static async connectIntegration(provider: string, data?: any) {
    try {
      const response = await axios.post(`/api/integrations/${provider}/connect`, data);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(`Failed to connect to ${provider}`);
    }
  }

  static async disconnectIntegration(provider: string) {
    try {
      const response = await axios.post(`/api/integrations/${provider}/disconnect`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(`Failed to disconnect from ${provider}`);
    }
  }

  static async syncIntegration(provider: string) {
    try {
      const response = await axios.post(`/api/integrations/${provider}/sync`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(`Failed to sync data from ${provider}`);
    }
  }

  static async getWorkspaces(provider: string) {
    try {
      const response = await axios.get(`/api/integrations/${provider}/workspaces`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(`Failed to fetch ${provider} workspaces`);
    }
  }
}
