// backend/routes/feeRoutes.js
import express from "express";
import Fee from "../models/Fee.js"; // ✅ Default import (no curly braces)
import {FeeStructure} from "../models/FeeStructure.js";
import {Payment} from "../models/Payment.js"; // ✅ Default import (no curly braces)Payment from "../models/Payment.js";

const router = express.Router();

// ✅ Get fee structure
router.get("/structure", async (req, res) => {
  try {
    const { department, semester, academicYear } = req.query;
    let filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);
    if (academicYear) filter.academicYear = academicYear;
    
    const structure = await FeeStructure.findOne(filter);
    res.json({ success: true, structure });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Create/Update fee structure
router.post("/structure", async (req, res) => {
  try {
    const { department, semester, academicYear } = req.body;
    
    let structure = await FeeStructure.findOne({ department, semester, academicYear });
    if (structure) {
      structure.feeHeads = req.body.feeHeads;
      structure.dueDate = req.body.dueDate;
      structure.lateFee = req.body.lateFee;
      await structure.save();
      res.json({ success: true, message: "Fee structure updated", structure });
    } else {
      structure = new FeeStructure(req.body);
      await structure.save();
      res.json({ success: true, message: "Fee structure created", structure });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get student fee details
router.get("/student/:studentId", async (req, res) => {
  try {
    const fee = await Fee.findOne({ studentId: req.params.studentId });
    const payments = await Payment.find({ studentId: req.params.studentId }).sort({ paymentDate: -1 });
    
    res.json({ 
      success: true, 
      fee,
      payments,
      totalPaid: payments.reduce((sum, p) => sum + p.amount, 0)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Record payment
router.post("/payment", async (req, res) => {
  try {
    const { studentId, amount, paymentMode, transactionId, collectedBy, remarks } = req.body;
    
    // Generate receipt number
    const receiptNumber = `RCPT${Date.now()}`;
    
    const payment = new Payment({
      studentId,
      amount,
      paymentMode,
      transactionId,
      receiptNumber,
      collectedBy,
      remarks
    });
    await payment.save();
    
    // Update fee record
    let fee = await Fee.findOne({ studentId });
    if (fee) {
      fee.amountPaid = (fee.amountPaid || 0) + amount;
      fee.status = fee.amountPaid >= fee.totalAmount ? "Paid" : "Partial";
      await fee.save();
    }
    
    res.json({ success: true, message: "Payment recorded", payment, receiptNumber });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get fee defaulters
router.get("/defaulters", async (req, res) => {
  try {
    const defaulters = await Fee.find({ status: { $in: ["Pending", "Partial"] } });
    res.json({ success: true, defaulters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;