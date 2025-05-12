import axios from 'axios';

export interface NotionPage {
  id: string;
  title: string;
  icon?: string;
  lastUpdated: Date;
  url: string;
}

export interface NotionDatabase {
  id: string;
  title: string;
  icon?: string;
  lastUpdated: Date;
  columns: string[];
  url: string;
  isConnected?: boolean;
}

export class NotionService {
  static async getPages(): Promise<NotionPage[]> {
    try {
      const response = await axios.get('/api/notion/pages');
      return response.data.pages;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch Notion pages');
    }
  }
  static async getDatabases(): Promise<NotionDatabase[]> {
    try {
      const response = await axios.get('/api/notion/databases');
      return response.data.databases;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch Notion databases');
    }
  }
  static async importPageAsTask(pageId: string): Promise<any> {
    try {
      const response = await axios.post('/api/notion/import-page', { pageId });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to import Notion page');
    }
  }

  static async connectDatabase(databaseId: string): Promise<any> {
    try {
      const response = await axios.post('/api/notion/connect-database', { databaseId });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to connect Notion database');
    }
  }

  static async disconnectDatabase(databaseId: string): Promise<any> {
    try {
      const response = await axios.post('/api/notion/disconnect-database', { databaseId });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to disconnect Notion database');
    }
  }
  static async getConnectedDatabases(): Promise<string[]> {
    try {
      const response = await axios.get('/api/notion/connected-databases');
      return response.data.connectedDatabases;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch connected databases');
    }
  }

  static async syncDatabases(): Promise<any> {
    try {
      const response = await axios.post('/api/notion/sync-databases');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to sync Notion databases');
    }
  }
}
