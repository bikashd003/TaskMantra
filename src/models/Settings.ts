import mongoose from 'mongoose';

const notificationsSchema = new mongoose.Schema({
  email: {
    taskAssigned: {
      type: Boolean,
      default: true,
    },
    taskUpdates: {
      type: Boolean,
      default: true,
    },
    taskComments: {
      type: Boolean,
      default: false,
    },
    dueDateReminders: {
      type: Boolean,
      default: true,
    },
    teamUpdates: {
      type: Boolean,
      default: true,
    },
  },
  push: {
    instantNotifications: {
      type: Boolean,
      default: true,
    },
    mentions: {
      type: Boolean,
      default: true,
    },
    teamActivity: {
      type: Boolean,
      default: false,
    },
  },
  desktop: {
    showNotifications: {
      type: Boolean,
      default: true,
    },
    soundEnabled: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
});

const generalSchema = new mongoose.Schema({
  appearance: {
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: 'system',
    },
    animations: {
      type: Boolean,
      default: true,
    },
    reducedMotion: {
      type: Boolean,
      default: false,
    },
  },
  localization: {
    language: {
      type: String,
      enum: ['en-US', 'en-GB', 'es', 'fr', 'de', 'hi'],
      default: 'en-US',
    },
    timezone: {
      type: String,
      default: 'IST',
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD'],
      default: 'DD/MM/YYYY',
    },
  },
  accessibility: {
    keyboardShortcuts: {
      type: Boolean,
      default: true,
    },
    screenReader: {
      type: Boolean,
      default: false,
    },
    highContrast: {
      type: Boolean,
      default: false,
    },
    largeText: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
});

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  generalSettings: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'General',
    required: true,
  },
  notificationSettings: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notifications',
    required: true,
  }
}, {
  timestamps: true,
});

export const Notifications = mongoose.models.Notifications || mongoose.model('Notifications', notificationsSchema);
export const General = mongoose.models.General || mongoose.model('General', generalSchema);
export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
