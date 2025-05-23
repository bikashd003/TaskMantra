import axios from 'axios';

export interface SendInvitationRequest {
  emails: string[];
  role: string;
  customMessage?: string;
  organizationId: string;
}

export interface InvitationResult {
  email: string;
  success: boolean;
  message?: string;
  inviteId?: string;
  emailId?: string;
}

export interface SendInvitationResponse {
  message: string;
  results: InvitationResult[];
}

export class InvitationService {
  static async sendInvitations(data: SendInvitationRequest): Promise<SendInvitationResponse> {
    try {
      const response = await axios.post('/api/invitations/send', data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to send invitations';
      throw new Error(errorMessage);
    }
  }

  static async getPendingInvitations(): Promise<any[]> {
    try {
      const response = await axios.get('/api/invitations/pending');
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch pending invitations';
      throw new Error(errorMessage);
    }
  }

  static async acceptInvitation(token?: string): Promise<any> {
    try {
      const response = await axios.post('/api/invitations/accept', { token });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to accept invitation';
      throw new Error(errorMessage);
    }
  }
}
