import mongoose from "mongoose";

const taskAssignmentsSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['Assignee', 'Reviewer', 'Creator'], required: true },
    assignedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const TaskAssignments = mongoose.models.TaskAssignments || mongoose.model('TaskAssignments', taskAssignmentsSchema);