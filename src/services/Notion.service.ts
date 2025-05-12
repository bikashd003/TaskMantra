import axios from 'axios';

export interface NotionPage {
  id: string;
  title: string;
  icon?: string;
  lastUpdated: Date;
  url: string;
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
}
