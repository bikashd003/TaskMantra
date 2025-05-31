import axios from 'axios';
import { EmailTemplate, SMTPSettings, TestEmailData } from '../Schemas/EmailTemplate';

export class EmailTemplateService {
  static async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await axios.get('/api/settings/email-templates');
      return response.data.templates || [];
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch email templates');
    }
  }

  static async getEmailTemplateById(templateId: string): Promise<EmailTemplate> {
    try {
      const response = await axios.get(`/api/settings/email-templates/${templateId}`);
      return response.data.template;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch email template');
    }
  }

  static async createEmailTemplate(
    data: Omit<EmailTemplate, 'id' | 'lastModified' | 'variables'>
  ): Promise<EmailTemplate> {
    try {
      const response = await axios.post('/api/settings/email-templates', data);
      return response.data.template;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to create email template');
    }
  }

  static async updateEmailTemplate(
    templateId: string,
    data: Partial<EmailTemplate>
  ): Promise<EmailTemplate> {
    try {
      const response = await axios.patch(`/api/settings/email-templates/${templateId}`, data);
      return response.data.template;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to update email template');
    }
  }

  static async deleteEmailTemplate(templateId: string): Promise<void> {
    try {
      await axios.delete(`/api/settings/email-templates/${templateId}`);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to delete email template');
    }
  }

  static async duplicateEmailTemplate(templateId: string): Promise<EmailTemplate> {
    try {
      const response = await axios.post(`/api/settings/email-templates/${templateId}/duplicate`);
      return response.data.template;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to duplicate email template');
    }
  }

  static async testEmailTemplate(
    data: TestEmailData
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post('/api/settings/email-templates/test', data);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to send test email');
    }
  }

  // Get SMTP settings
  static async getSMTPSettings(): Promise<SMTPSettings> {
    try {
      const response = await axios.get('/api/settings/smtp');
      return response.data.settings;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch SMTP settings');
    }
  }

  // Update SMTP settings
  static async updateSMTPSettings(data: SMTPSettings): Promise<SMTPSettings> {
    try {
      const response = await axios.patch('/api/settings/smtp', data);
      return response.data.settings;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to update SMTP settings');
    }
  }

  // Test SMTP connection
  static async testSMTPConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post('/api/settings/smtp/test');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to test SMTP connection');
    }
  }

  // Export templates
  static async exportTemplates(): Promise<Blob> {
    try {
      const response = await axios.get('/api/settings/email-templates/export', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to export templates');
    }
  }

  // Import templates
  static async importTemplates(
    file: File
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/settings/email-templates/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to import templates');
    }
  }
}
