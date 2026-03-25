// backend/routes/examRoutes.js
import express from "express";
import ExamSchedule from "../models/Exam.js";

const router = express.Router();

// ✅ Get all exam schedules
router.get("/", async (req, res) => {
  try {
    const { department, semester, academicYear } = req.query;
    let filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);
    if (academicYear) filter.academicYear = academicYear;
    
    const exams = await ExamSchedule.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get exam schedule by ID
router.get("/:id", async (req, res) => {
  try {
    const exam = await ExamSchedule.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam schedule not found" });
    res.json({ success: true, exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Create exam schedule
router.post("/", async (req, res) => {
  try {
    const exam = new ExamSchedule(req.body);
    await exam.save();
    res.json({ success: true, message: "Exam schedule created", exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Update exam schedule
router.put("/:id", async (req, res) => {
  try {
    const exam = await ExamSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!exam) return res.status(404).json({ success: false, message: "Exam schedule not found" });
    res.json({ success: true, message: "Exam schedule updated", exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Publish exam schedule
router.put("/:id/publish", async (req, res) => {
  try {
    const exam = await ExamSchedule.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam schedule not found" });
    
    exam.published = true;
    exam.publishedAt = new Date();
    await exam.save();
    
    res.json({ success: true, message: "Exam schedule published" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Delete exam schedule
router.delete("/:id", async (req, res) => {
  try {
    const exam = await ExamSchedule.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Exam schedule not found" });
    res.json({ success: true, message: "Exam schedule deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;