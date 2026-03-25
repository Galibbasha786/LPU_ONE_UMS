import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "staff" },
  employeeId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  designation: String,
  phoneNumber: String,
  profilePicture: String,
  qualification: String,
  experience: String,
  joinDate: { type: Date, default: Date.now },
  coursesTeaching: [{
    courseId: String,
    courseName: String,
    semester: String,
    section: String
  }],
  isClassTeacher: { type: Boolean, default: false },
  classTeacherOf: {
    semester: String,
    section: String
  },
  bankAccountNumber: String,
  bankName: String,
  ifscCode: String,
  address: String,
  emergencyContact: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Staff = mongoose.models.Staff || mongoose.model("Staff", staffSchema);