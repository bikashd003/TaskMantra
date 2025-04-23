# TaskMantra Analytics Guide

This guide explains how to use the analytics system in TaskMantra to track user behavior and application performance.

## Overview

TaskMantra uses [PostHog](https://posthog.com/) for analytics. The implementation includes:

1. **Page View Tracking**: Automatically tracks page views with detailed metadata
2. **User Identification**: Tracks user identity and properties
3. **Event Tracking**: Tracks user actions and application events
4. **Performance Monitoring**: Tracks application performance metrics
5. **Error Tracking**: Tracks application errors
6. **Feature Flag Support**: Supports feature flags for A/B testing and gradual rollouts

## How to Use Analytics

### User Identification

Use the `usePostHogUser` hook to identify users:

```tsx
import { usePostHogUser } from '@/hooks/usePostHogUser';

function MyComponent() {
  const { identifyUser } = usePostHogUser();
  
  const handleLogin = (user) => {
    // After user logs in
    identifyUser(user.id, {
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan
    });
  };
  
  return (
    // Component JSX
  );
}
```

### Tracking Events

Use the analytics utility functions to track events:

```tsx
import { taskAnalytics, interactionAnalytics } from '@/utils/analytics';

function TaskComponent({ task }) {
  const handleStatusChange = (newStatus) => {
    // Update task status in the database
    updateTaskStatus(task.id, newStatus);
    
    // Track the status change
    taskAnalytics.trackTaskStatusChanged(
      task.id,
      task.name,
      task.status,
      newStatus
    );
  };
  
  const handleButtonClick = () => {
    // Track UI interaction
    interactionAnalytics.trackUIInteraction(
      'button',
      'complete_task_button',
      'click',
      { task_id: task.id }
    );
  };
  
  return (
    // Component JSX
  );
}
```

### Feature Flags

Use the `usePostHogUser` hook to check feature flags:

```tsx
import { usePostHogUser } from '@/hooks/usePostHogUser';

function MyComponent() {
  const { isFeatureEnabled } = usePostHogUser();
  
  // Check if a feature is enabled for the current user
  const showNewFeature = isFeatureEnabled('new-calendar-view', false);
  
  return (
    <div>
      {showNewFeature ? (
        <NewCalendarView />
      ) : (
        <LegacyCalendarView />
      )}
    </div>
  );
}
```

### Tracking Errors

Use the error analytics utility to track errors:

```tsx
import { errorAnalytics } from '@/utils/analytics';

async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // Track the error
    errorAnalytics.trackAPIError(
      '/api/data',
      error.message,
      error.status || 500,
      { additional_context: 'Fetching dashboard data' }
    );
    
    // Re-throw or handle the error
    throw error;
  }
}
```

## Best Practices

1. **Be Consistent**: Use consistent event names and properties
2. **Be Specific**: Include enough detail to make the data actionable
3. **Respect Privacy**: Don't track sensitive personal information
4. **Track Important Actions**: Focus on tracking actions that provide business value
5. **Use Properties**: Add relevant properties to events for better analysis
6. **Test Tracking**: Verify that events are being tracked correctly

## Event Naming Conventions

- Use snake_case for event names: `task_created`, `project_updated`
- Use descriptive names that indicate the action: `task_status_changed`, `filter_applied`
- Group related events with common prefixes: `task_*`, `project_*`, `user_*`

## Property Naming Conventions

- Use snake_case for property names: `task_id`, `project_name`
- Be consistent with property names across events
- Include IDs for database entities: `task_id`, `user_id`, `project_id`
- Include descriptive names: `task_name`, `project_name`

## Debugging Analytics

To debug analytics in development:

1. Set `localStorage.setItem('debug', 'true')` in the browser console
2. Check the console for PostHog debug messages
3. Use the PostHog dashboard to verify events are being received

## Privacy Considerations

- Sensitive data is automatically masked in session recordings
- User consent is respected through Do Not Track browser settings
- Personal data is only collected for identified users
- No sensitive data is tracked in URL parameters
