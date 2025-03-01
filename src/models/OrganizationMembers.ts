import mongoose from "mongoose";
const organizationMembersSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['Owner', 'Member', 'Guest'], required: true },
    joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const OrganizationMembers = mongoose.models.OrganizationMembers || mongoose.model('OrganizationMembers', organizationMembersSchema);