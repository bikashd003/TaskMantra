import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['mention', 'task', 'team', 'system', 'onboarding'], 
    required: true 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  link: { 
    type: String, 
    default: '' 
  },
  metadata: { 
    type: Schema.Types.Mixed, 
    default: {} 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
