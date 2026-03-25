import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
  department: String,
  semester: Number,
  section: String,
  academicYear: String,
  timetable: {
    monday: [{
      timeSlot: String,
      courseCode: String,
      courseName: String,
      teacher: String,
      room: String,
      type: { type: String, enum: ["Theory", "Practical", "Tutorial"] }
    }],
    tuesday: [{
      timeSlot: String,
      courseCode: String,
      courseName: String,
      teacher: String,
      room: String,
      type: { type: String, enum: ["Theory", "Practical", "Tutorial"] }
    }],
    // ... other days
  },
  modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  approved: Boolean,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

export const Timetable = mongoose.models.Timetable || mongoose.model("Timetable", timetableSchema);

