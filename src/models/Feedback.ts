import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  feedbackType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  screenshot: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
export default Feedback;