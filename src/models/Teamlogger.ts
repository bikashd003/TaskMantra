import mongoose,{Schema} from 'mongoose';

const teamloggerSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    checkIn: {
        type: Date,
        default: Date.now,
    },
    checkOut: {
        type: Date,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    task:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
        }
    ],
})

export const Teamlogger = mongoose.models.Teamlogger || mongoose.model('Teamlogger', teamloggerSchema);