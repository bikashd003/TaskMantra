import mongoose, { Schema } from 'mongoose';

const taskSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    status: { type: String, default: 'To Do' },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    dueDate: Date,
    startDate: Date,
    estimatedTime: Number,
    loggedTime: Number,
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    subtasks: [
      { name: { type: String, required: true }, completed: { type: Boolean, default: false } },
    ],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        attachments: [
          { filename: { type: String, required: true }, url: { type: String, required: true } },
        ],
      },
    ],
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
