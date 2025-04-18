import axios from 'axios';

export interface WorkflowState {
  id: string;
  name: string;
  color: string;
  description?: string;
  order: number;
  useAsColumn?: boolean;
  columnWidth?: number;
  wip?: number; // Work in progress limit
}

export interface WorkflowTransition {
  fromState: string;
  toState: string;
  name: string;
  description?: string;
  requiresApproval?: boolean;
  allowedRoles?: string[];
}

export interface WorkflowTemplate {
  id?: string;
  name: string;
  description?: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  isPublic?: boolean;
  createdBy?: string;
}

export interface WorkflowSettingsData {
  userId: string;
  name: string;
  description: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  isDefault: boolean;
  syncWithKanban?: boolean;
  allowCustomStatuses?: boolean;
  templates?: WorkflowTemplate[];
}

export class WorkflowSettingsService {
  static async getSettings(): Promise<WorkflowSettingsData> {
    try {
      const response = await axios.get('/api/workflow-settings');
      return response.data.settings;
    } catch (error) {
      throw new Error('Failed to fetch workflow settings', { cause: error });
    }
  }

  static async updateSettings(
    settings: Partial<WorkflowSettingsData>
  ): Promise<WorkflowSettingsData> {
    try {
      const response = await axios.patch('/api/workflow-settings', settings);
      return response.data.settings;
    } catch (error) {
      throw new Error('Failed to update workflow settings', { cause: error });
    }
  }

  static async updateStates(states: WorkflowState[]): Promise<WorkflowSettingsData> {
    try {
      const response = await axios.patch('/api/workflow-settings/states', { states });
      return response.data.settings;
    } catch (error) {
      throw new Error('Failed to update workflow states', { cause: error });
    }
  }

  static async updateTransitions(transitions: WorkflowTransition[]): Promise<WorkflowSettingsData> {
    try {
      const response = await axios.patch('/api/workflow-settings/transitions', { transitions });
      return response.data.settings;
    } catch (error) {
      throw new Error('Failed to update workflow transitions', { cause: error });
    }
  }

  static async createWorkflow(workflow: {
    name: string;
    description: string;
    states: WorkflowState[];
    transitions: WorkflowTransition[];
  }): Promise<WorkflowSettingsData> {
    try {
      const response = await axios.post('/api/workflow-settings/create', workflow);
      return response.data.settings;
    } catch (error) {
      throw new Error('Failed to create workflow', { cause: error });
    }
  }

  static async getTemplates(): Promise<WorkflowTemplate[]> {
    try {
      const response = await axios.get('/api/workflow-settings/templates');
      return response.data.templates;
    } catch (error) {
      throw new Error('Failed to fetch workflow templates', { cause: error });
    }
  }

  static async createTemplate(template: Omit<WorkflowTemplate, 'id'>): Promise<WorkflowTemplate> {
    try {
      const response = await axios.post('/api/workflow-settings/templates', template);
      return response.data.template;
    } catch (error) {
      throw new Error('Failed to create workflow template', { cause: error });
    }
  }

  static async applyTemplate(templateId: string): Promise<WorkflowSettingsData> {
    try {
      const response = await axios.post(`/api/workflow-settings/templates/${templateId}/apply`);
      return response.data.settings;
    } catch (error) {
      throw new Error('Failed to apply workflow template', { cause: error });
    }
  }
}
