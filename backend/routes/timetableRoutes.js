// backend/routes/timetableRoutes.js
import express from "express";
import {Timetable} from "../models/Timetable.js";
import Class from "../models/Class.js"; // ✅ Default import (no curly braces)

const router = express.Router();

// ✅ Get timetable by department, semester, section
router.get("/", async (req, res) => {
  try {
    const { department, semester, section } = req.query;
    let filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);
    if (section) filter.section = section;
    
    const timetable = await Timetable.findOne(filter);
    res.json({ success: true, timetable });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Create or update timetable
router.post("/", async (req, res) => {
  try {
    const { department, semester, section, timetable } = req.body;
    
    let existing = await Timetable.findOne({ department, semester, section });
    if (existing) {
      existing.timetable = timetable;
      existing.modifiedBy = req.body.modifiedBy;
      existing.approved = false;
      await existing.save();
      res.json({ success: true, message: "Timetable updated", timetable: existing });
    } else {
      const newTimetable = new Timetable(req.body);
      await newTimetable.save();
      res.json({ success: true, message: "Timetable created", timetable: newTimetable });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Approve timetable
router.put("/:id/approve", async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) return res.status(404).json({ success: false, message: "Timetable not found" });
    
    timetable.approved = true;
    timetable.approvedBy = req.body.adminId;
    await timetable.save();
    
    res.json({ success: true, message: "Timetable approved" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get class schedule for a teacher
router.get("/teacher/:staffId", async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.params.staffId }).sort({ day: 1, time: 1 });
    res.json({ success: true, classes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;