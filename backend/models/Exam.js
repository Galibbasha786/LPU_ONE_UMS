import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  examType: { type: String, enum: ["Mid Semester", "End Semester", "Practical", "Viva", "Quiz"], required: true },
  academicYear: String,
  semester: Number,
  department: String,
  exams: [{
    date: Date,
    day: String,
    time: String,
    duration: String,
    courseCode: String,
    courseName: String,
    roomNumber: String,
    invigilators: [String],
    section: String
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  published: { type: Boolean, default: false },
  publishedAt: Date
}, { timestamps: true });

const ExamSchedule = mongoose.models.ExamSchedule || mongoose.model("ExamSchedule", examSchema);
export default ExamSchedule;
