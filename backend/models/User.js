// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "Student" },
  section: { type: String, default: "" },
  attendance: { type: String, default: "0%" },
  marks: { type: String, default: "0" },
  fees: { type: String, default: "Unpaid" },
  cgpa: { type: Number, default: 0 },
  notifications: [
    {
      message: String,
      date: { type: Date, default: Date.now },
    },
  ],
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
