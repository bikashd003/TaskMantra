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
    password: {
        type: String
    },
    image: {
        type: String
    },
    emailVerified: {
        type: Date
    }
}, {
    timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);