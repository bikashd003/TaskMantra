import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  _id: string;
  title: string;
  content: string | object;
  contentType: 'markdown' | 'rich-text' | 'plain-text' | 'editorjs';
  tags: string[];
  category: string;
  color: string;
  isPinned: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  isPublic: boolean;
  password?: string;
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  collaborators: {
    userId: mongoose.Types.ObjectId;
    permission: 'view' | 'edit' | 'admin';
    addedAt: Date;
  }[];
  attachments: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    uploadedAt: Date;
  }[];
  version: number;
  versions: {
    version: number;
    content: string;
    title: string;
    modifiedBy: mongoose.Types.ObjectId;
    modifiedAt: Date;
    changeDescription?: string;
  }[];
  reminders: {
    reminderDate: Date;
    isCompleted: boolean;
    message?: string;
  }[];
  linkedNotes: mongoose.Types.ObjectId[];
  linkedTasks: mongoose.Types.ObjectId[];
  linkedProjects: mongoose.Types.ObjectId[];
  metadata: {
    wordCount: number;
    readingTime: number;
    lastViewedAt: Date;
    viewCount: number;
    exportedFormats: string[];
  };
  settings: {
    allowComments: boolean;
    allowDownload: boolean;
    allowPrint: boolean;
    autoSave: boolean;
    fontSize: 'small' | 'medium' | 'large';
    theme: 'light' | 'dark' | 'auto';
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: Schema.Types.Mixed,
      required: true,
      default: { blocks: [] },
    },
    contentType: {
      type: String,
      enum: ['markdown', 'rich-text', 'plain-text', 'editorjs'],
      default: 'editorjs',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    category: {
      type: String,
      default: 'general',
      trim: true,
    },
    color: {
      type: String,
      default: '#ffffff',
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      select: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    collaborators: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        permission: {
          type: String,
          enum: ['view', 'edit', 'admin'],
          default: 'view',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileSize: Number,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    version: {
      type: Number,
      default: 1,
    },
    versions: [
      {
        version: Number,
        content: String,
        title: String,
        modifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        modifiedAt: {
          type: Date,
          default: Date.now,
        },
        changeDescription: String,
      },
    ],
    reminders: [
      {
        reminderDate: Date,
        isCompleted: {
          type: Boolean,
          default: false,
        },
        message: String,
      },
    ],
    linkedNotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
      },
    ],
    linkedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    linkedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],
    metadata: {
      wordCount: {
        type: Number,
        default: 0,
      },
      readingTime: {
        type: Number,
        default: 0,
      },
      lastViewedAt: {
        type: Date,
        default: Date.now,
      },
      viewCount: {
        type: Number,
        default: 0,
      },
      exportedFormats: [String],
    },
    settings: {
      allowComments: {
        type: Boolean,
        default: true,
      },
      allowDownload: {
        type: Boolean,
        default: true,
      },
      allowPrint: {
        type: Boolean,
        default: true,
      },
      autoSave: {
        type: Boolean,
        default: true,
      },
      fontSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium',
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

noteSchema.index({ userId: 1, organizationId: 1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ category: 1 });
noteSchema.index({ isPinned: -1, updatedAt: -1 });
noteSchema.index({ isArchived: 1 });
noteSchema.index({ isFavorite: 1 });
noteSchema.index({ title: 'text', content: 'text' });
noteSchema.index({ createdAt: -1 });
noteSchema.index({ updatedAt: -1 });

noteSchema.virtual('formattedCreatedAt').get(function () {
  return this.createdAt.toLocaleDateString();
});

noteSchema.virtual('formattedUpdatedAt').get(function () {
  return this.updatedAt.toLocaleDateString();
});

noteSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    let textContent = '';

    if (typeof this.content === 'string') {
      textContent = this.content;
    } else if (this.content && typeof this.content === 'object' && 'blocks' in this.content) {
      // Extract text from Editor.js blocks
      const editorContent = this.content as { blocks: any[] };
      textContent = editorContent.blocks
        .map((block: any) => {
          if (block.data && block.data.text) {
            return block.data.text.replace(/<[^>]*>/g, ''); // Remove HTML tags
          }
          return '';
        })
        .join(' ');
    }

    const words = textContent.split(/\s+/).filter(word => word.length > 0);
    this.metadata.wordCount = words.length;

    this.metadata.readingTime = Math.ceil(words.length / 200);

    if (!this.isNew) {
      this.version += 1;

      this.versions.push({
        version: this.version - 1,
        content: typeof this.content === 'string' ? this.content : JSON.stringify(this.content),
        title: this.title,
        modifiedBy: this.userId,
        modifiedAt: new Date(),
      });

      if (this.versions.length > 10) {
        this.versions = this.versions.slice(-10);
      }
    }
  }
  next();
});

noteSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  return this.save();
};

noteSchema.methods.restore = function () {
  this.deletedAt = null;
  return this.save();
};

(noteSchema.query as any).notDeleted = function (this: any) {
  return this.where({ deletedAt: null });
};

const Note = mongoose.models.Note || mongoose.model<INote>('Note', noteSchema);

export default Note;
