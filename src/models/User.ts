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
    systemRole: {
        type: String,
        enum: ['User', 'Admin'], // User means all normal user and admin means Bikash (this admin role will used as making dashboard for controlling everything)
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
