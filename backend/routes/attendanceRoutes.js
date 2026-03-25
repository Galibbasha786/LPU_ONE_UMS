// backend/routes/attendanceRoutes.js
import express from "express";
import { Attendance } from "../models/Attendance.js";
import { Student } from "../models/Student.js";

const router = express.Router();

// ✅ Get attendance by student
router.get("/student/:studentId", async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.params.studentId }).sort({ date: -1 });
    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get attendance by course
router.get("/course/:courseCode", async (req, res) => {
  try {
    const { section, date } = req.query;
    let filter = { courseCode: req.params.courseCode };
    if (section) filter.section = section;
    if (date) filter.date = new Date(date);
    
    const attendance = await Attendance.find(filter).populate('studentId', 'name email enrollmentId');
    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Mark attendance (with Attendance model)
router.post("/mark", async (req, res) => {
  try {
    const { studentId, courseCode, date, status, markedBy, remarks } = req.body;
    
    // Check if already marked
    const existing = await Attendance.findOne({ studentId, courseCode, date });
    if (existing) {
      existing.status = status;
      existing.remarks = remarks;
      await existing.save();
      return res.json({ success: true, message: "Attendance updated", attendance: existing });
    }
    
    const attendance = new Attendance({
      studentId,
      courseCode,
      date,
      status,
      markedBy,
      remarks
    });
    await attendance.save();
    
    res.json({ success: true, message: "Attendance marked", attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get attendance summary
router.get("/summary/:courseCode", async (req, res) => {
  try {
    const { section } = req.query;
    let filter = { courseCode: req.params.courseCode };
    if (section) filter.section = section;
    
    const students = await Student.find(filter);
    const summary = [];
    
    for (const student of students) {
      const attendance = await Attendance.find({ studentId: student._id, courseCode: req.params.courseCode });
      const total = attendance.length;
      const present = attendance.filter(a => a.status === 'Present').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      
      summary.push({
        student: {
          id: student._id,
          name: student.name,
          enrollmentId: student.enrollmentId
        },
        total,
        present,
        absent: total - present,
        percentage
      });
    }
    
    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;