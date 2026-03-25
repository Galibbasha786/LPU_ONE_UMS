// backend/models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "Student" },
  section: { type: String, default: "" },
  enrollmentId: String,
  department: String,
  semester: Number,
  attendanceData: {
    type: Map,
    of: String, // Stores status: "Present" or "Absent"
    default: {}
  },
  marks: { type: String, default: "0" },
  fees: { type: String, default: "Unpaid" },
  cgpa: { type: Number, default: 0 },
  notifications: [
    {
      message: String,
      date: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

// ✅ Export as Student (named export)
export const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);