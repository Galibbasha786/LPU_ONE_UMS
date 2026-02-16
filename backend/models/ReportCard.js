import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  courseCode: String,
  name: String,
  marks: Number,
  credits: Number,
  grade: String,
  gradePoint: Number,
});

const reportCardSchema = new mongoose.Schema({
  email: { type: String, required: true },
  studentName: String,
  subjects: [subjectSchema],
  cgpa: Number,
  tgpa: Number,
  createdAt: { type: Date, default: Date.now },
});

export const ReportCard = mongoose.model("ReportCard", reportCardSchema);
