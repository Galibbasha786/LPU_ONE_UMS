import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  duration: { type: String, required: true },
  stipend: { type: String, required: true },
  location: { type: String, required: true },
  deadline: { type: Date, required: true },
  skills: [String],
  description: { type: String },
  eligibility: {
    minCGPA: { type: Number, default: 6 },
    allowedBranches: [String],
    allowedSemesters: [Number],
    yearOfStudy: [Number]
  },
  openings: { type: Number, default: 10 },
  applications: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    studentName: String,
    studentEmail: String,
    appliedDate: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ["Pending", "Shortlisted", "Rejected", "Selected"],
      default: "Pending"
    },
    resume: String,
    remarks: String
  }],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Internship = mongoose.models.Internship || mongoose.model("Internship", internshipSchema);