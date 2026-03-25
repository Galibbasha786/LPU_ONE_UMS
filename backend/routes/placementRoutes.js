// backend/routes/placementRoutes.js
import express from "express";
import { Placement } from "../models/Placement.js";
import { Student } from "../models/Student.js";

const router = express.Router();

// ✅ Get all placements
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) filter.status = status;
    
    const placements = await Placement.find(filter).sort({ driveDate: -1 });
    res.json({ success: true, placements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Create placement drive
router.post("/", async (req, res) => {
  try {
    const placement = new Placement(req.body);
    await placement.save();
    res.json({ success: true, message: "Placement drive created", placement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Register student for placement
router.post("/:id/register", async (req, res) => {
  try {
    const { studentId } = req.body;
    const placement = await Placement.findById(req.params.id);
    if (!placement) return res.status(404).json({ success: false, message: "Placement not found" });
    
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    
    // Check eligibility
    if (student.cgpa < placement.eligibility.minCGPA) {
      return res.status(400).json({ success: false, message: "CGPA below eligibility criteria" });
    }
    
    placement.selectedStudents.push({
      studentId,
      studentName: student.name,
      studentEmail: student.email
    });
    await placement.save();
    
    res.json({ success: true, message: "Student registered for placement" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Update placement status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const placement = await Placement.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!placement) return res.status(404).json({ success: false, message: "Placement not found" });
    res.json({ success: true, message: "Placement status updated", placement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get placement statistics
router.get("/statistics", async (req, res) => {
  try {
    const totalPlacements = await Placement.countDocuments();
    const upcoming = await Placement.countDocuments({ status: "Upcoming" });
    const ongoing = await Placement.countDocuments({ status: "Ongoing" });
    const completed = await Placement.countDocuments({ status: "Completed" });
    
    const allPlacements = await Placement.find();
    const totalStudentsPlaced = allPlacements.reduce((sum, p) => sum + p.selectedStudents.length, 0);
    
    res.json({
      success: true,
      statistics: {
        totalPlacements,
        upcoming,
        ongoing,
        completed,
        totalStudentsPlaced
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;