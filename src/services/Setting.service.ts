import axios from 'axios';

export class SettingService {
  static async getGeneralSettings(): Promise<any> {
    try {
      const response = await axios.get('/api/settings/general');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch general settings');
    }
  }
  static async getThemeSettings(): Promise<any> {
    try {
      const response = await axios.get('/api/settings/theme');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch theme settings');
    }
  }
  static async updateProfileSettings(settings: any): Promise<any> {
    try {
      const response = await axios.patch('/api/settings/profile', settings);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update profile settings');
    }
  }
  static async updateGeneralSettings(settings: any): Promise<any> {
    try {
      const response = await axios.put('/api/settings/general', settings);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update general settings');
    }
  }

  static async getNotificationsSettings(): Promise<any> {
    try {
      const response = await axios.get('/api/settings/notifications');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch notifications settings');
    }
  }

  static async updateNotificationsSettings(settings: any): Promise<any> {
    try {
      const response = await axios.put('/api/settings/notifications', settings);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update notifications settings');
    }
  }

  static async updateTheme(theme: string): Promise<any> {
    try {
      // Get current general settings
      const currentSettings = await this.getGeneralSettings();

      // Update only the theme
      const updatedSettings = {
        ...currentSettings.general,
        appearance: {
          ...currentSettings.general?.appearance,
          theme,
        },
      };

      const response = await axios.put('/api/settings/general', updatedSettings);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update theme');
    }
  }
}
