import mongoose, { Schema } from 'mongoose';

const subscriptionSchema = new Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ['free', 'storage_addon'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'cancelled'],
      default: 'active',
    },
    storageLimit: {
      type: Number,
      default: 52428800, // 50MB in bytes
      required: true,
    },
    totalStoragePurchased: {
      type: Number,
      default: 0, // Additional storage purchased in bytes
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      default: null, // null for lifetime purchases
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ status: 1 });

export const Subscription =
  mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
