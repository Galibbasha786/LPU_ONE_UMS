import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userEmail: String,
  userName: String,
  userRole: { type: String, enum: ["Staff", "Student"] },
  leaveType: { type: String, enum: ["Sick", "Casual", "Emergency", "Study", "Other"], required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  reason: String,
  document: String,
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  remarks: String
}, { timestamps: true });

export const Leave = mongoose.models.Leave || mongoose.model("Leave", leaveSchema);