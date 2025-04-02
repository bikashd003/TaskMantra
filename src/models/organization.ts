import mongoose, { Schema } from 'mongoose';

const organizationSchema = new Schema({
    name: { type: String, required: true, unique: true },
    location: String,
    logo: String,
    description: String,
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            role: { type: String, enum: ['Owner', 'Member', 'Guest'], required: true },
            joinedAt: { type: Date, default: Date.now },
        }
    ],
}, { timestamps: true });
export const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);
