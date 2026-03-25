import mongoose from "mongoose";

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentEmail: { type: String, required: true },
  studentName: String,
  courseCode: { type: String, required: true },
  courseName: String,
  examType: { type: String, enum: ["Mid Semester", "End Semester", "Practical", "Quiz", "Assignment"], required: true },
  internalMarks: { type: Number, default: 0, max: 50 },
  externalMarks: { type: Number, default: 0, max: 50 },
  totalMarks: { type: Number, default: 0 },
  maxMarks: { type: Number, default: 100 },
  percentage: Number,
  grade: { type: String, enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"] },
  gradePoint: Number,
  semester: Number,
  section: String,
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  academicYear: String
}, { timestamps: true });

marksSchema.pre('save', function(next) {
  this.totalMarks = (this.internalMarks || 0) + (this.externalMarks || 0);
  this.percentage = (this.totalMarks / this.maxMarks) * 100;
  next();
});

export const Marks = mongoose.models.Marks || mongoose.model("Marks", marksSchema);