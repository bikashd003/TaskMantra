import axios from 'axios';

export class OrganizationService {
  static async getOrganizationById(organizationId: string): Promise<any> {
    try {
      const response = await axios.get(`/api/organizations/${organizationId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch organization');
    }
  }

  static async getOrganizations(): Promise<any> {
    try {
      const response = await axios.get(`/api/organizations`);

      // Check if response data is null or undefined
      if (!response.data) {
        throw new Error('No organization data returned');
      }

      return response.data;
    } catch (error: any) {
      // Provide more detailed error message if available
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to fetch organizations';
      throw new Error(errorMessage);
    }
  }
}
