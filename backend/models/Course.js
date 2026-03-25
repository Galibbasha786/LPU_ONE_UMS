import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  department: { type: String, required: true },
  credits: { type: Number, required: true },
  semester: { type: Number, min: 1, max: 8 },
  theoryPractical: { type: String, enum: ["Theory", "Practical", "Theory+Practical"], default: "Theory" },
  prerequisites: [String],
  syllabus: String,
  assignedTeachers: [{
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    section: String
  }]
}, { timestamps: true });

export const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

