import mongoose, { Schema } from 'mongoose';

const columnSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  order: { type: Number, required: true },
});

const kanbanSettingsSchema = new Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  columns: [columnSchema],
  defaultView: { 
    type: String, 
    enum: ['kanban', 'list', 'calendar'], 
    default: 'kanban' 
  },
  compactView: { 
    type: Boolean, 
    default: false 
  },
  showCompletedTasks: { 
    type: Boolean, 
    default: true 
  },
  columnWidth: { 
    type: Number, 
    default: 280 // Default width in pixels
  },
}, {
  timestamps: true
});

export const KanbanSettings = mongoose.models.KanbanSettings || mongoose.model('KanbanSettings', kanbanSettingsSchema);
