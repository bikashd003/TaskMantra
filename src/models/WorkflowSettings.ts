import mongoose, { Schema } from 'mongoose';

// Define the schema for workflow states
const workflowStateSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, required: true, default: '#6b7280' }, // Default gray color
  description: { type: String },
  order: { type: Number, required: true },
  // Add fields for kanban column integration
  useAsColumn: { type: Boolean, default: true },
  columnWidth: { type: Number, default: 280 },
  wip: { type: Number, default: 0 }, // Work in progress limit (0 = no limit)
});

// Define the schema for workflow transitions
const workflowTransitionSchema = new Schema({
  fromState: { type: String, required: true },
  toState: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  // Add fields for transition rules
  requiresApproval: { type: Boolean, default: false },
  allowedRoles: [{ type: String }],
});

// Define the schema for workflow templates
const workflowTemplateSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  states: [workflowStateSchema],
  transitions: [workflowTransitionSchema],
  isPublic: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

// Define the main workflow settings schema
const workflowSettingsSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    default: 'Default Workflow'
  },
  description: {
    type: String,
    default: 'Default task workflow'
  },
  states: [workflowStateSchema],
  transitions: [workflowTransitionSchema],
  isDefault: {
    type: Boolean,
    default: true
  },
  // Add fields for workflow configuration
  syncWithKanban: {
    type: Boolean,
    default: true
  },
  allowCustomStatuses: {
    type: Boolean,
    default: false
  },
  templates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkflowTemplate' }]
}, {
  timestamps: true
});

// Create and export the models
export const WorkflowTemplate = mongoose.models.WorkflowTemplate ||
  mongoose.model('WorkflowTemplate', workflowTemplateSchema);

export const WorkflowSettings = mongoose.models.WorkflowSettings ||
  mongoose.model('WorkflowSettings', workflowSettingsSchema);
