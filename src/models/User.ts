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
    },
    role: { 
        type: String,
        enum: ['User', 'Admin'],
        default: 'User' 
    },
    projects: [{
        projectId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Project',
        },
        projectRole: {
            type: String,
            enum: ['Project Admin', 'Developer', 'Viewer','Employee','HR','Other'],
        }
    }],
    tasks: [{
        taskId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Task',
        },
        taskRole: {
            type: String,
            enum: ['Project Admin', 'Developer', 'Viewer','Employee','HR','Other'],
        }
    }],
    settings: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Settings',
    }
}, {
    timestamps: true
});

export const User =  mongoose.model('User', userSchema);
