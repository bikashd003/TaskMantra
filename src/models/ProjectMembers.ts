
import mongoose from 'mongoose';
const projectMembersSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    members: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            role: { type: String, enum: ['Project Admin', 'Developer', 'Viewer', 'Employee', 'HR', 'Other'], required: true },
            invitedAt: { type: Date, default: Date.now },
            acceptedAt: Date,
        }
    ],
}, { timestamps: true });

export const ProjectMembers = mongoose.models.ProjectMembers || mongoose.model('ProjectMembers', projectMembersSchema);