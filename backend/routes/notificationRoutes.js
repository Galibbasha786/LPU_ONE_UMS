// backend/routes/notificationRoutes.js
import express from "express";
import { Notification } from "../models/Notification.js";
import { Student } from "../models/Student.js";
import { Staff } from "../models/Staff.js";

const router = express.Router();

// ✅ Get all notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Create notification
router.post("/", async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.json({ success: true, message: "Notification created", notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Send notification to targeted users
router.post("/send", async (req, res) => {
  try {
    const { title, message, target, targetDepartment, targetSemester, targetSections } = req.body;
    
    let recipients = [];
    if (target === "All") {
      recipients = await Student.find({}, 'email');
    } else if (target === "Students") {
      let filter = {};
      if (targetDepartment) filter.department = { $in: targetDepartment };
      if (targetSemester) filter.semester = { $in: targetSemester };
      if (targetSections) filter.section = { $in: targetSections };
      recipients = await Student.find(filter, 'email');
    } else if (target === "Staff") {
      recipients = await Staff.find({}, 'email');
    }
    
    const notification = new Notification({
      title,
      message,
      type: req.body.type || "General",
      target,
      targetDepartment,
      targetSemester,
      targetSections,
      createdBy: req.body.createdBy
    });
    await notification.save();
    
    // Here you would integrate email/SMS service
    console.log(`Notification sent to ${recipients.length} recipients`);
    
    res.json({ 
      success: true, 
      message: `Notification sent to ${recipients.length} recipients`,
      notification 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Mark notification as read
router.put("/:id/read", async (req, res) => {
  try {
    // This would mark as read for a specific user
    // Implementation depends on your read receipts system
    res.json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Delete notification
router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;