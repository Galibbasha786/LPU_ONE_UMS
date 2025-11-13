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

// ========================
// 🔹 ATTENDANCE ROUTES (FIXED)
// ========================

// Get all attendance records
router.get('/attendance', async (req, res) => {
  try {
    // Get all students with their attendance data
    const students = await User.find({ role: "Student" }).select('email attendanceData');
    
    const records = {};
    students.forEach(student => {
      records[student.email] = student.attendanceData || {};
    });
    
    res.json({
      success: true,
      records
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark attendance for a student
router.post('/attendance/mark', async (req, res) => {
  try {
    const { studentEmail, date, status } = req.body;
    
    // Validate input
    if (!studentEmail || !date || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: studentEmail, date, status" 
      });
    }

    // Find student and update attendance
    const student = await User.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }

    // Initialize attendanceData if it doesn't exist
    if (!student.attendanceData) {
      student.attendanceData = {};
    }

    // Update attendance for the specific date
    student.attendanceData[date] = status;
    
    // Save the updated student
    await student.save();
    
    res.json({ 
      success: true, 
      message: `Attendance marked as ${status} for ${studentEmail} on ${date}` 
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk mark attendance
router.post('/attendance/bulk-mark', async (req, res) => {
  try {
    const { date, status, studentEmails } = req.body;
    
    // Validate input
    if (!date || !status || !studentEmails || !Array.isArray(studentEmails)) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: date, status, studentEmails" 
      });
    }

    // Bulk update all students
    const bulkOperations = studentEmails.map(email => ({
      updateOne: {
        filter: { email: email },
        update: { 
          $set: { 
            [`attendanceData.${date}`]: status 
          } 
        }
      }
    }));

    // Execute bulk operation
    const result = await User.bulkWrite(bulkOperations);
    
    res.json({ 
      success: true, 
      message: `Bulk marked ${result.modifiedCount} students as ${status} on ${date}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error in bulk marking attendance:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get student's attendance
router.get('/attendance/student/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Find student and get attendance data
    const student = await User.findOne({ email: email }).select('attendanceData name email section');
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }

    res.json({ 
      success: true, 
      attendance: {
        records: student.attendanceData || {},
        studentInfo: {
          name: student.name,
          email: student.email,
          section: student.section
        }
      }
    });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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