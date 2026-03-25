// backend/routes/marksRoutes.js
import express from "express";
import { Marks } from "../models/Marks.js";
import { Student } from "../models/Student.js";

const router = express.Router();

// ✅ Get marks by student
router.get("/student/:studentId", async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.studentId }).sort({ courseCode: 1 });
    res.json({ success: true, marks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get marks by course
router.get("/course/:courseCode", async (req, res) => {
  try {
    const { examType, section } = req.query;
    let filter = { courseCode: req.params.courseCode };
    if (examType) filter.examType = examType;
    if (section) filter.section = section;
    
    const marks = await Marks.find(filter).populate('studentId', 'name email enrollmentId');
    res.json({ success: true, marks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Enter/Update marks
router.post("/enter", async (req, res) => {
  try {
    const { studentId, courseCode, examType, internalMarks, externalMarks, enteredBy } = req.body;
    
    const existing = await Marks.findOne({ studentId, courseCode, examType });
    if (existing) {
      existing.internalMarks = internalMarks;
      existing.externalMarks = externalMarks;
      await existing.save();
      return res.json({ success: true, message: "Marks updated", marks: existing });
    }
    
    const marks = new Marks({
      studentId,
      courseCode,
      examType,
      internalMarks,
      externalMarks,
      enteredBy
    });
    await marks.save();
    
    res.json({ success: true, message: "Marks entered", marks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Bulk marks entry
router.post("/bulk-enter", async (req, res) => {
  try {
    const { marksList } = req.body;
    let successCount = 0;
    
    for (const mark of marksList) {
      const existing = await Marks.findOne({ 
        studentId: mark.studentId, 
        courseCode: mark.courseCode, 
        examType: mark.examType 
      });
      
      if (existing) {
        existing.internalMarks = mark.internalMarks;
        existing.externalMarks = mark.externalMarks;
        await existing.save();
      } else {
        const newMark = new Marks(mark);
        await newMark.save();
      }
      successCount++;
    }
    
    res.json({ success: true, message: `${successCount} marks entries processed` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get grade card
router.get("/gradecard/:studentId", async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.studentId });
    const student = await Student.findById(req.params.studentId);
    
    const gradeCard = {
      student: {
        name: student.name,
        enrollmentId: student.enrollmentId,
        department: student.department,
        semester: student.semester
      },
      subjects: marks.map(m => ({
        courseCode: m.courseCode,
        internalMarks: m.internalMarks,
        externalMarks: m.externalMarks,
        total: m.totalMarks,
        percentage: m.percentage,
        grade: m.grade,
        gradePoint: m.gradePoint
      })),
      totalCGPA: student.cgpa
    };
    
    res.json({ success: true, gradeCard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;