import mongoose,{Schema} from 'mongoose';

const projectSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ["Planning", "In Progress", "Completed", "On Hold", "Cancelled"], default: "Planning" },
  priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  files: [{ name: { type: String, required: true }, url: { type: String, required: true }, public_id: { type: String, required: true } }],
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
}, { timestamps: true });

export const Project =mongoose.models.Project || mongoose.model('Project', projectSchema);
