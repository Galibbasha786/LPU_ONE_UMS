import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  profilePicture: String,
  employeeId: { type: String, unique: true },
  department: String,
  phoneNumber: String,
  joinDate: { type: Date, default: Date.now },
  permissions: { type: [String], default: ["full_access"] }
}, { timestamps: true });

export const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

