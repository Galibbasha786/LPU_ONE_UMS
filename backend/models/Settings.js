import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  // Academic Settings
  academicYear: { type: String, default: "2024-25" },
  semester: { type: String, enum: ["Odd", "Even"], default: "Even" },
  examGrading: { type: String, enum: ["Absolute", "Relative"], default: "Absolute" },
  attendanceThreshold: { type: Number, default: 75 },
  
  // Financial Settings
  lateFeeAmount: { type: Number, default: 500 },
  libraryFinePerDay: { type: Number, default: 10 },
  hostelFee: { type: Number, default: 50000 },
  transportFee: { type: Number, default: 15000 },
  
  // Email Settings
  smtpServer: { type: String, default: "smtp.gmail.com" },
  smtpPort: { type: Number, default: 587 },
  senderEmail: { type: String, default: "noreply@lpu.edu.in" },
  
  // Security Settings
  sessionTimeout: { type: Number, default: 30 },
  maxLoginAttempts: { type: Number, default: 3 },
  twoFactorAuth: { type: Boolean, default: false },
  
  // System Status
  registrationOpen: { type: Boolean, default: true },
  feePaymentOpen: { type: Boolean, default: true },
  examFormOpen: { type: Boolean, default: false },
  
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

export const Settings = mongoose.models.Settings || mongoose.model("Settings", settingsSchema);