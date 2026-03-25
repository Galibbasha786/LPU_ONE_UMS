// backend/routes/userRoutes.js
import express from "express";
import { Student } from "../models/Student.js"; // ✅ Changed from User to Student
import { Staff } from "../models/Staff.js";
import Exam from "../models/Exam.js";
import Class from "../models/Class.js";
import Fee from "../models/Fee.js";
import bcrypt from "bcryptjs";
import {
  createStudent,
  updateStudentField,
  notifyAllStudents,
  getAllNotifications,
  markAttendance,
  enterMarks,
  allotSection
} from "../controllers/userController.js";

const router = express.Router();

// ========================
// 🔹 STUDENT MANAGEMENT
// ========================

router.post("/create-student", createStudent);

router.get("/students", async (req, res) => {
  try {
    const students = await Student.find({ role: "Student" }).select('-password');
    res.json({ success: true, students: students || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/update-field", updateStudentField);

router.post("/delete-student", async (req, res) => {
  try {
    const { email } = req.body;
    const deleted = await Student.findOneAndDelete({ email, role: "Student" });
    if (!deleted) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========================
// 🔹 STAFF MANAGEMENT
// ========================

// ✅ Create Staff Member with Password Hashing
router.post("/create-staff", async (req, res) => {
  console.log("📝 Create staff endpoint hit");
  console.log("Request body:", req.body);
  
  try {
    const {
      name,
      email,
      password,
      employeeId,
      department,
      designation,
      phoneNumber,
      profilePicture,
      qualification,
      experience,
      joinDate,
      isClassTeacher,
      classTeacherOf,
      coursesTeaching,
      bankAccountNumber,
      bankName,
      ifscCode,
      address,
      emergencyContact
    } = req.body;

    if (!name || !email || !employeeId || !department) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: name, email, employeeId, department are required" 
      });
    }

    const existingStaff = await Staff.findOne({ $or: [{ email }, { employeeId }] });
    if (existingStaff) {
      return res.status(400).json({ 
        success: false, 
        message: "Staff with this email or employee ID already exists" 
      });
    }

    // ✅ HASH THE PASSWORD
    const plainPassword = password || email;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log("Password hashed for:", email);

    const newStaff = new Staff({
      name,
      email,
      password: hashedPassword,
      employeeId,
      department,
      designation: designation || "Assistant Professor",
      phoneNumber: phoneNumber || "",
      profilePicture: profilePicture || "",
      qualification: qualification || "",
      experience: experience || "0",
      joinDate: joinDate || new Date(),
      isClassTeacher: isClassTeacher || false,
      classTeacherOf: classTeacherOf || null,
      coursesTeaching: coursesTeaching || [],
      bankAccountNumber: bankAccountNumber || "",
      bankName: bankName || "",
      ifscCode: ifscCode || "",
      address: address || "",
      emergencyContact: emergencyContact || ""
    });

    await newStaff.save();
    
    console.log("✅ Staff created successfully:", newStaff.email);
    console.log("Password is:", plainPassword, "(hashed in database)");

    res.json({ 
      success: true, 
      message: `Staff created successfully! Password is: ${plainPassword}`,
      staff: {
        name: newStaff.name,
        email: newStaff.email,
        employeeId: newStaff.employeeId,
        department: newStaff.department
      }
    });
  } catch (err) {
    console.error("Error creating staff:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Server error while creating staff" 
    });
  }
});

// ✅ Get all staff members
router.get("/staff", async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json({ success: true, staff });
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get single staff by ID
router.get("/staff/:id", async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }
    res.json({ success: true, staff });
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Update staff details
router.put("/staff/:id", async (req, res) => {
  try {
    // If password is being updated, hash it
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    
    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedStaff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }
    res.json({ success: true, message: "Staff updated successfully", staff: updatedStaff });
  } catch (err) {
    console.error("Error updating staff:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Delete staff member
router.delete("/staff/:id", async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
    if (!deletedStaff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }
    res.json({ success: true, message: "Staff deleted successfully" });
  } catch (err) {
    console.error("Error deleting staff:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========================
// 🔹 ATTENDANCE ROUTES
// ========================

router.get('/attendance', async (req, res) => {
  try {
    const students = await Student.find({ role: "Student" }).select('email attendanceData name section');
    const records = {};
    students.forEach(student => {
      records[student.email] = {
        attendanceData: student.attendanceData || {},
        name: student.name,
        section: student.section
      };
    });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/attendance/mark', markAttendance);

router.post('/attendance/bulk-mark', async (req, res) => {
  try {
    const { date, status, studentEmails, courseCode } = req.body;
    
    if (!date || !status || !studentEmails || !Array.isArray(studentEmails)) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    let modifiedCount = 0;
    for (const email of studentEmails) {
      const student = await Student.findOne({ email });
      if (student) {
        if (!student.attendanceData) student.attendanceData = {};
        const key = courseCode ? `${date}_${courseCode}` : date;
        student.attendanceData[key] = status;
        
        // Update overall percentage
        const totalRecords = Object.keys(student.attendanceData).length;
        const presentCount = Object.values(student.attendanceData).filter(s => s === 'Present').length;
        const percentage = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
        student.attendance = `${percentage}%`;
        
        await student.save();
        modifiedCount++;
      }
    }
    
    res.json({ 
      success: true, 
      message: `Bulk marked ${modifiedCount} students as ${status}`,
      modifiedCount
    });
  } catch (error) {
    console.error("Error in bulk marking attendance:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/attendance/student/:email', async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email }).select('attendanceData name email section');
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
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
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/update-marks", enterMarks);
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
    const newExam = new Exam(req.body);
    await newExam.save();
    res.json({ success: true, message: "Exam added!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post("/delete-exam", async (req, res) => {
  try {
    await Exam.deleteOne({ subject: req.body.subject });
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
    const newClass = new Class(req.body);
    await newClass.save();
    res.json({ success: true, message: "Class added!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post("/delete-class", async (req, res) => {
  try {
    await Class.deleteOne({ subject: req.body.subject });
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
    const status = amountPaid >= totalAmount ? "Paid" : amountPaid > 0 ? "Partial" : "Pending";
    const existing = await Fee.findOne({ studentId });

    if (existing) {
      existing.studentName = studentName;
      existing.totalAmount = totalAmount;
      existing.amountPaid = amountPaid;
      existing.status = status;
      await existing.save();
      return res.json({ success: true, message: "Fee updated!" });
    }

    const newFee = new Fee({ studentId, studentName, totalAmount, amountPaid, status });
    await newFee.save();
    res.json({ success: true, message: "Fee record added!" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.get("/fees", async (req, res) => {
  try {
    const fees = await Fee.find();
    res.json({ success: true, fees });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.get("/fees/:studentId", async (req, res) => {
  try {
    const fee = await Fee.findOne({ studentId: req.params.studentId });
    res.json({ success: true, fee });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

export default router;