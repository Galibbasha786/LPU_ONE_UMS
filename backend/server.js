// backend/server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import userRoutes from "./routes/userRoutes.js"; 
import { User } from "./models/User.js"; 

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// ✅ MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/lpuPortal", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Use User Routes
app.use("/api/users", userRoutes);

// ✅ Notification Schema (Persistent in MongoDB)
const notificationSchema = new mongoose.Schema({
  message: String,
  date: { type: Date, default: Date.now },
});
const Notification = mongoose.model("Notification", notificationSchema);

// ✅ Schedule Schema
const scheduleSchema = new mongoose.Schema({
  type: String,
  subject: String,
  date: String,
  time: String,
});
const Schedule = mongoose.model("Schedule", scheduleSchema);

// ✅ Chat Message Schema
const messageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

// ✅ Notification Routes (for Admin + Student)
app.post("/api/users/notify-all", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ success: false, message: "Message required" });

    const note = new Notification({ message });
    await note.save();
    res.json({ success: true, message: "Notification sent successfully!" });
  } catch (err) {
    console.error("Notification Error:", err);
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
    const { type, subject, date, time } = req.body;
    const schedule = new Schedule({ type, subject, date, time });
    await schedule.save();
    res.json({ message: "✅ Schedule Created" });
  } catch (err) {
    res.status(500).json({ message: "❌ Error creating schedule" });
  }
});

app.get("/api/users/schedules", async (req, res) => {
  const schedules = await Schedule.find();
  res.json({ schedules });
});

// ✅ Chat APIs
app.get("/api/users/messages", async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});

app.post("/api/users/messages", async (req, res) => {
  const { sender, text } = req.body;
  const message = new Message({ sender, text });
  await message.save();
  res.json({ message: "✅ Message stored" });
});

// ✅ Student Static Data (for fallback)
const studentsData = [
  {
    name: "John Doe",
    email: "john@lpu.in",
    attendance: "92%",
    marks: { math: 85, science: 90, english: 88 },
    cgpa: 8.7,
    fees: "Paid",
    section: "CSE-A",
    examSchedule: "Mid Term - 20 Nov",
    classSchedule: "Mon-Fri 9AM to 4PM",
    notifications: ["Project submission due next week!", "New exam date announced."],
  },
];

// ✅ Fetch static student details
app.get("/api/users/student/:email", (req, res) => {
  const student = studentsData.find((s) => s.email === req.params.email);
  if (student) {
    res.json({ success: true, student });
  } else {
    res.json({ success: false, message: "Student not found" });
  }
});

// ✅ Socket.IO Chat Integration
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }, // Change 5173 to 3000 if using Create React App
});

io.on("connection", (socket) => {
  console.log("🟢 Chat connected:", socket.id);

  socket.on("send_message", async (data) => {
    // Save to database
    const message = new Message({ 
      sender: data.sender, 
      text: data.text,
      timestamp: data.timestamp 
    });
    await message.save();
    
    // Broadcast to all clients
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => console.log("🔴 Disconnected:", socket.id));
});

// ✅ Start Server
server.listen(5001, () => console.log("🚀 Server running on port 5001"));
