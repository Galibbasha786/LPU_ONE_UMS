import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentEmail: { type: String, required: true },
  courseCode: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["Present", "Absent", "Late", "Leave"], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  remarks: String,
  semester: Number,
  section: String
}, { timestamps: true });

// Compound index to prevent duplicate attendance for same student/course/date
attendanceSchema.index({ studentEmail: 1, courseCode: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);