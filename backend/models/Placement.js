import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: String,
  contactPerson: String,
  contactEmail: String,
  contactPhone: String,
  website: String,
  logo: String
});

const placementSchema = new mongoose.Schema({
  company: companySchema,
  driveDate: Date,
  lastDateToApply: Date,
  packageOffered: { type: Number, min: 0 },
  roles: [String],
  eligibility: {
    minCGPA: { type: Number, default: 6 },
    allowedBranches: [String],
    allowedSemesters: [Number],
    backlogAllowed: { type: Boolean, default: true }
  },
  selectedStudents: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentName: String,
    studentEmail: String,
    offerLetter: String,
    accepted: { type: Boolean, default: false }
  }],
  status: { type: String, enum: ["Upcoming", "Ongoing", "Completed"], default: "Upcoming" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

export const Placement = mongoose.models.Placement || mongoose.model("Placement", placementSchema);