import mongoose, { Schema } from 'mongoose';

const storagePurchaseSchema = new Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storageAmount: {
      type: Number,
      required: true, // Storage amount in bytes
    },
    pricePerMB: {
      type: Number,
      required: true, // Price per MB in rupees
    },
    totalPrice: {
      type: Number,
      required: true, // Total price in rupees
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'manual'],
      default: 'razorpay',
    },
    paymentId: {
      type: String, // Payment gateway transaction ID
    },
    orderId: {
      type: String, // Payment gateway order ID
    },
    purchaseType: {
      type: String,
      enum: ['lifetime', 'monthly', 'yearly'],
      default: 'lifetime',
    },
    description: {
      type: String,
      default: '',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

storagePurchaseSchema.index({ organizationId: 1, createdAt: -1 });
storagePurchaseSchema.index({ purchasedBy: 1 });
storagePurchaseSchema.index({ paymentStatus: 1 });
storagePurchaseSchema.index({ paymentId: 1 });

export const StoragePurchase =
  mongoose.models.StoragePurchase || mongoose.model('StoragePurchase', storagePurchaseSchema);
