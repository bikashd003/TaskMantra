'use client';

import posthog from 'posthog-js';

// Only execute analytics in production
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Track task-related events
 */
export const taskAnalytics = {
  /**
   * Track when a task is created
   */
  trackTaskCreated: (taskId: string, taskName: string, taskProperties: any) => {
    if (isProduction) {
      posthog.capture('task_created', {
        task_id: taskId,
        task_name: taskName,
        ...taskProperties,
      });
    }
  },

  /**
   * Track when a task is updated
   */
  trackTaskUpdated: (
    taskId: string,
    taskName: string,
    updatedFields: string[],
    taskProperties: any
  ) => {
    if (isProduction) {
      posthog.capture('task_updated', {
        task_id: taskId,
        task_name: taskName,
        updated_fields: updatedFields,
        ...taskProperties,
      });
    }
  },

  /**
   * Track when a task status changes
   */
  trackTaskStatusChanged: (
    taskId: string,
    taskName: string,
    oldStatus: string,
    newStatus: string
  ) => {
    if (isProduction) {
      posthog.capture('task_status_changed', {
        task_id: taskId,
        task_name: taskName,
        old_status: oldStatus,
        new_status: newStatus,
        is_completed: newStatus === 'Completed',
      });
    }
  },

  /**
   * Track when a task is deleted
   */
  trackTaskDeleted: (taskId: string, taskName: string, taskProperties: any) => {
    if (isProduction) {
      posthog.capture('task_deleted', {
        task_id: taskId,
        task_name: taskName,
        ...taskProperties,
      });
    }
  },
};

/**
 * Track project-related events
 */
export const projectAnalytics = {
  /**
   * Track when a project is created
   */
  trackProjectCreated: (projectId: string, projectName: string, projectProperties: any) => {
    if (isProduction) {
      posthog.capture('project_created', {
        project_id: projectId,
        project_name: projectName,
        ...projectProperties,
      });
    }
  },

  /**
   * Track when a project is updated
   */
  trackProjectUpdated: (
    projectId: string,
    projectName: string,
    updatedFields: string[],
    projectProperties: any
  ) => {
    if (isProduction) {
      posthog.capture('project_updated', {
        project_id: projectId,
        project_name: projectName,
        updated_fields: updatedFields,
        ...projectProperties,
      });
    }
  },
};

/**
 * Track user interaction events
 */
export const interactionAnalytics = {
  /**
   * Track when a user interacts with a specific UI element
   */
  trackUIInteraction: (
    elementType: string,
    elementName: string,
    action: string,
    properties: any = {}
  ) => {
    if (isProduction) {
      posthog.capture('ui_interaction', {
        element_type: elementType, // e.g., 'button', 'link', 'dropdown'
        element_name: elementName, // e.g., 'create_task_button', 'settings_link'
        action: action, // e.g., 'click', 'hover', 'focus'
        ...properties,
      });
    }
  },

  /**
   * Track when a user views a specific section
   */
  trackSectionView: (sectionName: string, properties: any = {}) => {
    if (isProduction) {
      posthog.capture('section_viewed', {
        section_name: sectionName,
        ...properties,
      });
    }
  },

  /**
   * Track when a user performs a search
   */
  trackSearch: (
    searchQuery: string,
    searchType: string,
    resultCount: number,
    properties: any = {}
  ) => {
    if (isProduction) {
      posthog.capture('search_performed', {
        search_query: searchQuery,
        search_type: searchType, // e.g., 'task', 'project', 'global'
        result_count: resultCount,
        ...properties,
      });
    }
  },

  /**
   * Track when a user applies filters
   */
  trackFiltersApplied: (filterType: string, filterValues: any, properties: any = {}) => {
    if (isProduction) {
      posthog.capture('filters_applied', {
        filter_type: filterType, // e.g., 'task', 'project'
        filter_values: filterValues,
        ...properties,
      });
    }
  },
};

/**
 * Track error events
 */
export const errorAnalytics = {
  /**
   * Track when an API error occurs
   */
  trackAPIError: (
    endpoint: string,
    errorMessage: string,
    errorCode: number,
    properties: any = {}
  ) => {
    if (isProduction) {
      posthog.capture('api_error', {
        endpoint,
        error_message: errorMessage,
        error_code: errorCode,
        ...properties,
      });
    }
  },

  /**
   * Track when a form validation error occurs
   */
  trackFormError: (
    formName: string,
    fieldName: string,
    errorMessage: string,
    properties: any = {}
  ) => {
    if (isProduction) {
      posthog.capture('form_error', {
        form_name: formName,
        field_name: fieldName,
        error_message: errorMessage,
        ...properties,
      });
    }
  },
};

/**
 * Track feature usage events
 */
export const featureAnalytics = {
  /**
   * Track when a specific feature is used
   */
  trackFeatureUsed: (featureName: string, properties: any = {}) => {
    if (isProduction) {
      posthog.capture('feature_used', {
        feature_name: featureName,
        ...properties,
      });
    }
  },
};
