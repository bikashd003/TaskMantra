import mongoose, { Document, Schema } from 'mongoose';

export interface IIntegration extends Document {
  userId: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  provider: string;
  providerUserId?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes?: string[];
  workspaceId?: string;
  workspaceName?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt?: Date;
}

const IntegrationSchema = new Schema<IIntegration>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    provider: {
      type: String,
      required: true,
      enum: ['notion', 'github', 'slack', 'gitlab', 'trello', 'google-calendar'],
    },
    providerUserId: {
      type: String,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
    scopes: {
      type: [String],
    },
    workspaceId: {
      type: String,
    },
    workspaceName: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    lastSyncedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure a user can only have one integration per provider
IntegrationSchema.index({ userId: 1, provider: 1 }, { unique: true });

export const Integration =
  mongoose.models.Integration || mongoose.model<IIntegration>('Integration', IntegrationSchema);
