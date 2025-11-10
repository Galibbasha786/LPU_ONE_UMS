// backend/routes/userRoutes.js
import express from "express";
import { User } from "../models/User.js";
import Exam from "../models/Exam.js";
import Class from "../models/Class.js";
import Fee from "../models/Fee.js";
import {
  createStudent,
  loginUser,
  updateStudentField,
  notifyAllStudents,
  getAllNotifications,
  markAttendance,
  enterMarks,
  allotSection
} from "../controllers/userController.js";

const router = express.Router();

// ========================
// 🔹 AUTH & STUDENT CREATION
// ========================
router.post("/create-student", createStudent);
router.post("/login", loginUser);

// ========================
// 🔹 STUDENT MANAGEMENT
// ========================

// ✅ Get all registered students
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "Student" });
    if (!students || students.length === 0) {
      return res.json({ success: true, students: [] });
    }
    res.json({ success: true, students });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ success: false, message: "Server error fetching students" });
  }
});

// ✅ Update any generic field (ADD THIS ROUTE)
router.post("/update-field", updateStudentField);

// ✅ Update attendance
router.post("/update-attendance", markAttendance);

// ✅ Update marks  
router.post("/update-marks", enterMarks);

// ✅ Update section
router.post("/update-section", allotSection);

// ========================
// 🔹 NOTIFICATIONS
// ========================
router.post("/notify-all", notifyAllStudents);
router.get("/notifications", getAllNotifications);

// ========================
// 🔹 EXAMS
// ========================
router.get("/exams", async (req, res) => {
  try {
    const exams = await Exam.find();
    res.json({ success: true, exams });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post("/add-exam", async (req, res) => {
  try {
    const { subject, date, time } = req.body;
    const newExam = new Exam({ subject, date, time });
    await newExam.save();
    res.json({ success: true, message: "Exam added!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post("/delete-exam", async (req, res) => {
  try {
    const { subject } = req.body;
    await Exam.deleteOne({ subject });
    res.json({ success: true, message: "Exam deleted!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// ========================
// 🔹 CLASSES / SCHEDULE
// ========================
router.get("/classes", async (req, res) => {
  try {
    const classes = await Class.find();
    res.json({ success: true, classes });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post("/add-class", async (req, res) => {
  try {
    const { subject, day, time } = req.body;
    const newClass = new Class({ subject, day, time });
    await newClass.save();
    res.json({ success: true, message: "Class added!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post("/delete-class", async (req, res) => {
  try {
    const { subject } = req.body;
    await Class.deleteOne({ subject });
    res.json({ success: true, message: "Class deleted!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// ========================
// 🔹 FEES MANAGEMENT
// ========================
router.post("/fees/add", async (req, res) => {
  try {
    const { studentId, studentName, totalAmount, amountPaid } = req.body;
    const status =
      amountPaid >= totalAmount
        ? "Paid"
        : amountPaid > 0
        ? "Partial"
        : "Pending";

    const existing = await Fee.findOne({ studentId });

    if (existing) {
      existing.studentName = studentName;
      existing.totalAmount = totalAmount;
      existing.amountPaid = amountPaid;
      existing.status = status;
      await existing.save();
      return res.json({ success: true, message: "Fee updated!" });
    }

    const newFee = new Fee({
      studentId,
      studentName,
      totalAmount,
      amountPaid,
      status,
    });
    await newFee.save();
    res.json({ success: true, message: "Fee record added!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// ✅ Get all fee records (Admin view)
router.get("/fees", async (req, res) => {
  try {
    const fees = await Fee.find();
    res.json({ success: true, fees });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// ✅ Get single student's fee record (Student view)
router.get("/fees/:studentId", async (req, res) => {
  try {
    const fee = await Fee.findOne({ studentId: req.params.studentId });
    res.json({ success: true, fee });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

export default router;