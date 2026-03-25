// backend/routes/courseRoutes.js
import express from "express";
import { Course } from "../models/Course.js"; // ✅ Named import with curly braces
import { Staff } from "../models/Staff.js"; // ✅ Named import

const router = express.Router();

// ✅ Get all courses
router.get("/", async (req, res) => {
  try {
    const { department, semester } = req.query;
    let filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);
    
    const courses = await Course.find(filter).populate('assignedTeachers.staffId', 'name email employeeId');
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get single course by code
router.get("/:courseCode", async (req, res) => {
  try {
    const course = await Course.findOne({ courseCode: req.params.courseCode }).populate('assignedTeachers.staffId', 'name email employeeId');
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Create new course
router.post("/", async (req, res) => {
  try {
    const existing = await Course.findOne({ courseCode: req.body.courseCode });
    if (existing) {
      return res.status(400).json({ success: false, message: "Course code already exists" });
    }
    
    const course = new Course(req.body);
    await course.save();
    res.json({ success: true, message: "Course created successfully", course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Update course
router.put("/:courseCode", async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { courseCode: req.params.courseCode },
      req.body,
      { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, message: "Course updated", course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Delete course
router.delete("/:courseCode", async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ courseCode: req.params.courseCode });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Assign teacher to course
router.post("/:courseCode/assign-teacher", async (req, res) => {
  try {
    const { staffId, section } = req.body;
    const course = await Course.findOne({ courseCode: req.params.courseCode });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });
    
    course.assignedTeachers.push({ staffId, section });
    await course.save();
    
    // Also update staff's coursesTeaching
    staff.coursesTeaching.push({
      courseId: course.courseCode,
      courseName: course.courseName,
      semester: course.semester,
      section: section
    });
    await staff.save();
    
    res.json({ success: true, message: "Teacher assigned successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;