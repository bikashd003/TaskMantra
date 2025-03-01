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
  
}, {
  timestamps: true,
});

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

