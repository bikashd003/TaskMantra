import mongoose, { Schema } from 'mongoose';

const storageUsageSchema = new Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    fileId: {
      type: String, // Cloudinary public_id
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true, // File size in bytes
    },
    fileType: {
      type: String,
      required: true, // MIME type
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resourceType: {
      type: String,
      enum: ['project', 'task', 'feedback', 'organization', 'user'],
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // ID of the project, task, etc.
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

storageUsageSchema.index({ organizationId: 1, isDeleted: 1 });
storageUsageSchema.index({ fileId: 1 });
storageUsageSchema.index({ uploadedBy: 1 });
storageUsageSchema.index({ resourceType: 1, resourceId: 1 });
storageUsageSchema.index({ createdAt: -1 });

storageUsageSchema.index({ organizationId: 1, isDeleted: 1, fileSize: 1 });

export const StorageUsage =
  mongoose.models.StorageUsage || mongoose.model('StorageUsage', storageUsageSchema);
