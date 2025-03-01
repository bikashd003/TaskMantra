import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    bio: {
        type: String
    },
    password: {
        type: String
    },
    image: {
        type: String
    },
    emailVerified: {
        type: Date
    },
    urls: {
        type: Object
    },
    role: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User'
    },
    systemRole: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User'
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    settings: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Settings'
    },
}, {
    timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
