import mongoose from "mongoose";

const scholarshipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  criteria: { type: String, required: true },
  deadline: { type: Date, required: true },
  category: { 
    type: String, 
    enum: ["Academic", "Sports", "Financial", "Research", "Merit"],
    default: "Academic"
  },
  description: { type: String },
  eligibility: {
    minCGPA: { type: Number, default: 0 },
    allowedDepartments: [String],
    allowedSemesters: [Number],
    incomeLimit: { type: Number }
  },
  applications: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    studentName: String,
    studentEmail: String,
    appliedDate: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },
    remarks: String
  }],
  totalAmount: { type: Number },
  awardedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

export const Scholarship = mongoose.models.Scholarship || mongoose.model("Scholarship", scholarshipSchema);