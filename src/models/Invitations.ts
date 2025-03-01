import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
    email: { type: String, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["Owner", "Member", "Guest"], default: "Member" },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    invitedAt: { type: Date, default: Date.now },
});

export const Invitation = mongoose.models.Invitation || mongoose.model("Invitation", invitationSchema);