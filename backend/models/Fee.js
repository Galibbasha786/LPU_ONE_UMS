import mongoose from "mongoose";

const feeSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: String,
  totalAmount: Number,
  amountPaid: Number,
  status: String, // Paid / Pending / Partial
});

const Fee = mongoose.models.Fee || mongoose.model("Fee", feeSchema);
export default Fee;
