import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: String,
  studentEmail: String,
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMode: { type: String, enum: ["Cash", "Card", "Online", "Cheque"], required: true },
  transactionId: String,
  receiptNumber: { type: String, unique: true },
  academicYear: String,
  semester: Number,
  remarks: String,
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  status: { type: String, enum: ["Success", "Pending", "Failed"], default: "Success" }
}, { timestamps: true });

export const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);