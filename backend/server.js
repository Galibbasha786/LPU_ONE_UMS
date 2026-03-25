// backend/server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import userRoutes from "./routes/userRoutes.js"; 
import { Student } from "./models/Student.js"; // ✅ Using Student model
import { Staff } from "./models/Staff.js";
import { Admin } from "./models/Admin.js";
import { ReportCard } from "./models/ReportCard.js";
import bcrypt from "bcryptjs";
import courseRoutes from "./routes/courseRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import marksRoutes from "./routes/marksRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import placementRoutes from "./routes/placementRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import {Notification} from "./models/Notification.js";
import emailRoutes from './routes/emailRoutes.js';
const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// ✅ MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/lpuCombinedApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
    seedAdmin();
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Seed Admin Function
const seedAdmin = async () => {
  try {
    const adminEmail = "syedsunnygalibbasha@gmail.com";
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("lpulpu", 10);
      const admin = new Admin({
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        employeeId: "ADMIN001",
        department: "Administration"
      });
      await admin.save();
      console.log("✅ Default admin created");
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};

// ✅ Use Routes
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/placement", placementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/email", emailRoutes);
// ✅ UNIFIED LOGIN API
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔍 Login attempt for:", email);
    
    // 1️⃣ Check Admin
    let user = await Admin.findOne({ email });
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        return res.json({
          success: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: "Admin",
            employeeId: user.employeeId,
            department: user.department
          },
          message: "Admin login successful"
        });
      }
    }
    
    // 2️⃣ Check Staff
    user = await Staff.findOne({ email });
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        return res.json({
          success: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: "staff",
            employeeId: user.employeeId,
            department: user.department,
            designation: user.designation,
            coursesTeaching: user.coursesTeaching
          },
          message: "Staff login successful"
        });
      }
    }
    
    // 3️⃣ Check Student
    user = await Student.findOne({ email }); // ✅ Using Student model
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        return res.json({
          success: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || "Student",
            section: user.section,
            enrollmentId: user.enrollmentId,
            department: user.department,
            semester: user.semester,
            attendance: user.attendance,
            marks: user.marks,
            fees: user.fees,
            cgpa: user.cgpa
          },
          message: "Student login successful"
        });
      }
    }
    
    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
});

// ✅ Staff Routes
app.get("/api/users/staff", async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/users/staff/:id", async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/users/staff/:id", async (req, res) => {
  try {
    const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStaff) return res.status(404).json({ success: false, message: "Staff not found" });
    res.json({ success: true, message: "Staff updated", staff: updatedStaff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/users/staff/:id", async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
    if (!deletedStaff) return res.status(404).json({ success: false, message: "Staff not found" });
    res.json({ success: true, message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Student Routes
app.get("/api/users/students", async (req, res) => {
  try {
    const students = await Student.find({ role: "Student" }).select('-password');
    res.json({ success: true, students: students || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/users/student/:email", async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email }).select('-password');
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Notification Schema


// ✅ Schedule Schema
const scheduleSchema = new mongoose.Schema({
  type: String,
  subject: String,
  date: String,
  time: String,
  courseCode: String,
  room: String
});
const Schedule = mongoose.model("Schedule", scheduleSchema);

// ✅ Chat Message Schema
const messageSchema = new mongoose.Schema({
  sender: String,
  senderRole: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

// ✅ Notification Routes
// Update these routes to use the imported Notification model
app.post("/api/users/notify-all", async (req, res) => {
  try {
    const { message, title } = req.body;
    if (!message) return res.json({ success: false, message: "Message required" });
    const note = new Notification({ message, title: title || "Announcement" });
    await note.save();
    res.json({ success: true, message: "Notification sent!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get("/api/users/notifications", async (req, res) => {
  try {
    const notes = await Notification.find().sort({ date: -1 });
    res.json({ success: true, notifications: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
});

// ✅ Schedule APIs
app.post("/api/users/schedule", async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();
    res.json({ success: true, message: "Schedule Created" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error" });
  }
});

app.get("/api/users/schedules", async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.json({ success: true, schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error" });
  }
});

// ✅ Chat APIs
app.get("/api/users/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/users/messages", async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.json({ success: true, message: "Message stored" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Report Card APIs
app.post("/api/users/reportcard", async (req, res) => {
  try {
    const report = new ReportCard(req.body);
    await report.save();
    res.json({ success: true, message: "Report card saved", report });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get("/api/users/reportcards/:email", async (req, res) => {
  try {
    const reports = await ReportCard.find({ email: req.params.email }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error" });
  }
});

// ✅ Attendance Routes
app.get('/api/users/attendance', async (req, res) => {
  try {
    const students = await Student.find({ role: "Student" }).select('email attendanceData name section enrollmentId');
    const records = {};
    students.forEach(student => {
      records[student.email] = {
        attendanceData: student.attendanceData || {},
        name: student.name,
        section: student.section,
        enrollmentId: student.enrollmentId
      };
    });
    res.json({ success: true, records });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ success: false, error: error.message });
  }
})

app.post('/api/users/attendance/mark', async (req, res) => {
  try {
    const { studentEmail, date, status, courseCode } = req.body;
    
    // Detailed logging for debugging
    console.log("📝 Attendance mark request received:");
    console.log("   - studentEmail:", studentEmail);
    console.log("   - date:", date);
    console.log("   - status:", status);
    console.log("   - courseCode:", courseCode);
    
    // Validate required fields
    if (!studentEmail) {
      console.log("❌ Missing studentEmail");
      return res.status(400).json({ 
        success: false, 
        message: "Student email is required" 
      });
    }
    
    if (!date) {
      console.log("❌ Missing date");
      return res.status(400).json({ 
        success: false, 
        message: "Date is required" 
      });
    }
    
    if (!status) {
      console.log("❌ Missing status");
      return res.status(400).json({ 
        success: false, 
        message: "Attendance status is required" 
      });
    }
    
    // Find student
    const student = await Student.findOne({ email: studentEmail });
    if (!student) {
      console.log("❌ Student not found:", studentEmail);
      return res.status(404).json({ 
        success: false, 
        message: `Student not found with email: ${studentEmail}` 
      });
    }
    
    console.log("✅ Student found:", student.name);
    
    // Initialize attendanceData if not exists
    if (!student.attendanceData) {
      student.attendanceData = {};
    }
    
    // Create key with course code if provided
    const key = courseCode ? `${date}_${courseCode}` : date;
    student.attendanceData[key] = status;
    
    // Calculate overall percentage
    const totalRecords = Object.keys(student.attendanceData).length;
    const presentCount = Object.values(student.attendanceData).filter(s => s === 'Present').length;
    const percentage = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
    student.attendance = `${percentage}%`;
    
    await student.save();
    
    console.log("✅ Attendance marked successfully:", { key, status, percentage });
    
    res.json({ 
      success: true, 
      message: `Attendance marked as ${status}`,
      attendance: {
        overall: student.attendance,
        today: status,
        percentage: percentage,
        totalRecords: totalRecords,
        presentCount: presentCount
      }
    });
  } catch (error) {
    console.error("❌ Error marking attendance:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Server error while marking attendance" 
    });
  }
});
// Add to server.js
const scholarshipSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  criteria: String,
  deadline: Date,
  category: String,
  description: String,
  applications: [{ studentId: String, appliedDate: Date, status: String }]
});
const Scholarship = mongoose.model("Scholarship", scholarshipSchema);

// GET /api/scholarships
app.get("/api/scholarships", async (req, res) => {
  try {
    const scholarships = await Scholarship.find();
    res.json({ success: true, scholarships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/scholarships/apply/:id
app.post("/api/scholarships/apply/:id", async (req, res) => {
  try {
    const { studentId, studentName, studentEmail } = req.body;
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ success: false, message: "Scholarship not found" });
    
    scholarship.applications.push({ studentId, studentName, studentEmail, appliedDate: new Date(), status: "Pending" });
    await scholarship.save();
    
    res.json({ success: true, message: "Application submitted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// Add to server.js
const settingsSchema = new mongoose.Schema({
  academicYear: String,
  semester: String,
  examGrading: String,
  attendanceThreshold: Number,
  lateFeeAmount: Number,
  libraryFinePerDay: Number
});
const Settings = mongoose.model("Settings", settingsSchema);

// GET /api/settings
app.get("/api/settings", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        academicYear: "2024-25",
        semester: "Even",
        examGrading: "Absolute",
        attendanceThreshold: 75,
        lateFeeAmount: 500,
        libraryFinePerDay: 10
      });
      await settings.save();
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/settings
app.put("/api/settings", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json({ success: true, message: "Settings updated", settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// Add to server.js
const internshipSchema = new mongoose.Schema({
  title: String,
  company: String,
  duration: String,
  stipend: String,
  location: String,
  deadline: Date,
  skills: [String],
  applications: [{ studentId: String, studentName: String, appliedDate: Date }]
});
const Internship = mongoose.model("Internship", internshipSchema);

// GET /api/internships
app.get("/api/internships", async (req, res) => {
  try {
    const internships = await Internship.find();
    res.json({ success: true, internships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/internships/apply/:id
app.post("/api/internships/apply/:id", async (req, res) => {
  try {
    const { studentId, studentName } = req.body;
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: "Internship not found" });
    
    internship.applications.push({ studentId, studentName, appliedDate: new Date() });
    await internship.save();
    
    res.json({ success: true, message: "Application submitted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// Add to server.js
app.get("/api/student/subjects/:studentId", async (req, res) => {
  try {
    // Get enrolled courses based on student's semester/department
    const courses = await Course.find({ 
      department: student.department, 
      semester: student.semester 
    });
    res.json({ success: true, subjects: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// ✅ Socket.IO Chat
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("🟢 Chat connected:", socket.id);
  socket.on("send_message", async (data) => {
    const message = new Message(data);
    await message.save();
    io.emit("receive_message", data);
  });
  socket.on("disconnect", () => console.log("🔴 Disconnected"));
});

// ✅ Start Server
server.listen(5001, () => console.log("🚀 Server running on port 5001"));