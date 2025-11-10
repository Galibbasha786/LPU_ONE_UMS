// backend/controllers/userController.js
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";

// ✅ Create Student (Admin only)
export const createStudent = async (req, res) => {
  try {
    const { name, email, password, section } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "⚠️ User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const student = new User({
      name,
      email,
      password: hashed,
      section,
      attendance: "0%",
      marks: "0",
      fees: "Pending",
      role: "Student",
    });

    await student.save();
    res.json({ success: true, message: "✅ Student created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Error creating student" });
  }
};

// ✅ Login (Admin + Student)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Admin login
    if (email === "galiblpu@lpu.in" && password === "lpulpu") {
      return res.json({
        success: true,
        user: { name: "Admin", email, role: "Admin" },
        message: "✅ Admin login successful",
      });
    }

    // Student login
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.json({ success: false, message: "Invalid password" });

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        section: user.section,
        attendance: user.attendance,
        marks: user.marks,
        fees: user.fees,
        role: user.role,
      },
      message: "✅ Login successful",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "❌ Server error" });
  }
};

// ✅ Update Student Field (Generic)
export const updateStudentField = async (req, res) => {
  try {
    const { email, field, value } = req.body;
    const student = await User.findOne({ email, role: "Student" });

    if (!student)
      return res.status(404).json({ success: false, message: "Student not found" });

    const restricted = ["password", "_id", "role"];
    if (restricted.includes(field)) {
      return res.status(400).json({ success: false, message: "Field not editable" });
    }

    student[field] = value;
    await student.save();

    res.json({ success: true, message: `${field} updated successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating student" });
  }
};

// ✅ Mark Attendance (Admin)
export const markAttendance = async (req, res) => {
  try {
    const { email, attendance } = req.body;

    const student = await User.findOne({ email, role: "Student" });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    student.attendance = attendance;
    await student.save();
    
    res.json({ success: true, message: "Attendance updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error marking attendance" });
  }
};

// ✅ Enter Marks (Admin)
export const enterMarks = async (req, res) => {
  try {
    const { email, marks } = req.body;

    const student = await User.findOne({ email, role: "Student" });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    student.marks = marks;
    await student.save();
    
    res.json({ success: true, message: "Marks updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error entering marks" });
  }
};

// ✅ Allot Section (Admin)
export const allotSection = async (req, res) => {
  try {
    const { email, section } = req.body;

    const student = await User.findOne({ email, role: "Student" });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    student.section = section;
    await student.save();
    
    res.json({ success: true, message: "Section allotted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error allotting section" });
  }
};

// ✅ Notification System
let notifications = [];

// ✅ Admin: Send Notification to All Students
export const notifyAllStudents = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message)
      return res.json({ success: false, message: "Message required" });

    const note = { message, date: new Date() };
    notifications.unshift(note);
    res.json({ success: true, message: "Notification sent", notification: note });
  } catch (err) {
    console.error("Notification Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Student: Get All Notifications
export const getAllNotifications = async (req, res) => {
  try {
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
};