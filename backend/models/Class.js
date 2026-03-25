import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  courseCode: { type: String, required: true },
  day: { 
    type: String, 
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true 
  },
  time: { type: String, required: true },
  endTime: String,
  room: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  teacherName: String,
  section: String,
  semester: Number,
  department: String,
  type: { type: String, enum: ["Theory", "Practical", "Tutorial"], default: "Theory" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Class = mongoose.models.Class || mongoose.model("Class", classSchema);
export default Class;