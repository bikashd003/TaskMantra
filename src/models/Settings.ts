import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  notifications: {
    email: {
      enabled: { type: Boolean, default: true },
      taskAssigned: { type: Boolean, default: true },
      taskDueSoon: { type: Boolean, default: true },
      projectUpdates: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
    },
    inApp: {
      enabled: { type: Boolean, default: true },
      taskAssigned: { type: Boolean, default: true },
      taskDueSoon: { type: Boolean, default: true },
      projectUpdates: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
    },
    dailySummary: {
      enabled: { type: Boolean, default: false },
      time: { type: String, default: '08:00' },
    },
  },

  projectView: {
    defaultView: { 
      type: String, 
      enum: ['Board', 'List', 'Timeline', 'Calendar'], 
      default: 'Board' 
    },
    sortTasksBy: {
      type: String,
      enum: ['priority', 'dueDate', 'status', 'assignee'],
      default: 'priority'
    },
  },

  // Timezone
  timezone: {
    type: String,
    default: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },

  // Language
  language: {
    type: String,
    enum: ['en', 'es', 'fr', 'de',], 
    default: 'en', 
  },

  // Theme
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'light',
  },

  // Integrations (for future use, add specific fields as needed)
  integrations: {
    slack: {
      connected: { type: Boolean, default: false },
      // ... other Slack-related settings
    },
    // ... other integrations like Google Calendar, Microsoft Teams, etc. 
  },

  // Advanced Settings (consider using a separate subdocument if needed)
  advanced: {
    dataExportFormat: { 
      type: String, 
      enum: ['CSV', 'JSON', 'XML'], 
      default: 'CSV' 
    },
    // ...other advanced options
  },

  // Custom Fields (flexible storage for user-specific preferences)
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, // Allows storing different data types
  },
}, {
  timestamps: true,
});

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

