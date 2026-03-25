import mongoose from "mongoose";

const feeHeadSchema = new mongoose.Schema({
  headName: { type: String, required: true },
  amount: { type: Number, required: true },
  description: String
});

const feeStructureSchema = new mongoose.Schema({
  academicYear: { type: String, required: true },
  department: { type: String, required: true },
  course: String,
  semester: Number,
  feeHeads: [feeHeadSchema],
  totalAmount: Number,
  dueDate: Date,
  lateFee: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

feeStructureSchema.pre('save', function(next) {
  this.totalAmount = this.feeHeads.reduce((sum, head) => sum + head.amount, 0);
  next();
});

export const FeeStructure = mongoose.models.FeeStructure || mongoose.model("FeeStructure", feeStructureSchema);