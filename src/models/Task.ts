import mongoose,{Schema} from 'mongoose';

const taskSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
  }, 
  assignedTo: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  status: {
    type: String,
    enum: ["To Do", "In Progress", "Review", "Completed"],
    default: "To Do",
  },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium",
  },
  dueDate: { 
    type: Date 
  },
  startDate: { 
    type: Date 
  },
  estimatedTime: { 
    type: Number 
  },
  loggedTime: { 
    type: Number 
  },
  dependencies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task' 
  }],
  subtasks: [
    {
      name: { 
        type: String, 
        required: true 
      },
      completed: { 
        type: Boolean, 
        default: false 
      },
    },
  ],
  comments: [
    {
      userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
      },
      text: { 
        type: String, 
        required: true 
      },
      timestamp: { 
        type: Date, 
        default: Date.now 
      },
      attachments: [
        {
          filename: { 
            type: String, 
            required: true 
          },
          url: { 
            type: String, 
            required: true 
          },
        },
      ],
    },
  ],
}, {
  timestamps: true
});

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
