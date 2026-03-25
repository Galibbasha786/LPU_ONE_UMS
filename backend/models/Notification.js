import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["Announcement", "Event", "Exam", "Fee", "General"], default: "General" },
  target: {
    type: String,
    enum: ["All", "Students", "Staff", "Specific"],
    default: "All"
  },
  targetDepartment: [String],
  targetSemester: [Number],
  targetSections: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  published: { type: Boolean, default: true },
  expiresAt: Date,
  attachments: [String]
}, { timestamps: true });

export const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);