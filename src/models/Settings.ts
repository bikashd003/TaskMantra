import mongoose from 'mongoose';

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

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

