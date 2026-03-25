// backend/controllers/userController.js
import { Student } from "../models/Student.js";
import bcrypt from "bcryptjs";

export const createStudent = async (req, res) => {
  try {
    const { name, email, password, section, enrollmentId, department, semester } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: "Name and email are required" 
      });
    }
    
    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: "Student already exists" 
      });
    }

    const hashed = await bcrypt.hash(password || email, 10);
    const student = new Student({
      name,
      email,
      password: hashed,
      section: section || "Not Assigned",
      enrollmentId: enrollmentId || `REG${Date.now()}`,
      department: department || "Not Assigned",
      semester: semester || 1,
      attendance: "0%",
      marks: "0",
      fees: "Pending",
      role: "Student",
      cgpa: 0,
      attendanceData: {}
    });
    
    await student.save();
    
    const studentData = student.toObject();
    delete studentData.password;
    
    res.json({ 
      success: true, 
      message: `Student created successfully! Password is: ${password || email}`,
      student: studentData
    });
  } catch (err) {
    console.error("Create student error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error creating student",
      error: err.message 
    });
  }
};

export const updateStudentField = async (req, res) => {
  try {
    const { email, field, value } = req.body;
    
    if (!email || !field) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and field are required" 
      });
    }
    
    const student = await Student.findOne({ email, role: "Student" });
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }
    
    const restricted = ["password", "_id", "role", "__v", "createdAt", "updatedAt"];
    if (restricted.includes(field)) {
      return res.status(400).json({ 
        success: false, 
        message: `${field} cannot be edited` 
      });
    }
    
    if (field === "marks" && value) {
      student.marks = value;
      const marksNum = parseInt(value);
      if (!isNaN(marksNum)) {
        student.cgpa = marksNum / 10;
      }
    } else if (field === "attendance") {
      student.attendance = value;
    } else {
      student[field] = value;
    }
    
    await student.save();
    
    res.json({ 
      success: true, 
      message: `${field} updated successfully`,
      student: {
        name: student.name,
        email: student.email,
        section: student.section,
        attendance: student.attendance,
        marks: student.marks,
        fees: student.fees,
        cgpa: student.cgpa
      }
    });
  } catch (err) {
    console.error("Update student error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error updating student",
      error: err.message 
    });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { email, attendance, date, courseCode } = req.body;
    
    if (!email || !attendance) {
      return res.status(400).json({ 
        success: false, 
        message: "Student email and attendance status are required" 
      });
    }
    
    const student = await Student.findOne({ email, role: "Student" });
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }
    
    const currentDate = date || new Date().toISOString().split('T')[0];
    
    if (!student.attendanceData) {
      student.attendanceData = {};
    }
    
    const attendanceKey = courseCode ? `${currentDate}_${courseCode}` : currentDate;
    student.attendanceData[attendanceKey] = attendance;
    
    const totalRecords = Object.keys(student.attendanceData).length;
    const presentCount = Object.values(student.attendanceData).filter(status => status === 'Present').length;
    const overallPercentage = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
    student.attendance = `${overallPercentage}%`;
    
    await student.save();
    
    res.json({ 
      success: true, 
      message: `Attendance marked as ${attendance}`,
      attendance: {
        overall: student.attendance,
        today: attendance,
        percentage: overallPercentage
      }
    });
  } catch (err) {
    console.error("Mark attendance error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error marking attendance",
      error: err.message 
    });
  }
};

export const enterMarks = async (req, res) => {
  try {
    const { email, marks, examType, courseCode } = req.body;
    
    if (!email || marks === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and marks are required" 
      });
    }
    
    const student = await Student.findOne({ email, role: "Student" });
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }
    
    if (!student.marksData) {
      student.marksData = {};
    }
    
    const markKey = examType ? `${examType}_${courseCode || 'general'}` : 'general';
    student.marksData[markKey] = marks;
    student.marks = marks;
    
    const marksNum = parseInt(marks);
    if (!isNaN(marksNum)) {
      student.cgpa = marksNum / 10;
    }
    
    await student.save();
    
    res.json({ 
      success: true, 
      message: "Marks updated successfully",
      marks: student.marks,
      cgpa: student.cgpa
    });
  } catch (err) {
    console.error("Enter marks error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error entering marks",
      error: err.message 
    });
  }
};

export const allotSection = async (req, res) => {
  try {
    const { email, section } = req.body;
    
    if (!email || !section) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and section are required" 
      });
    }
    
    const student = await Student.findOne({ email, role: "Student" });
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }
    
    student.section = section;
    await student.save();
    
    res.json({ 
      success: true, 
      message: `Section allotted to ${section} successfully`,
      student: {
        name: student.name,
        email: student.email,
        section: student.section
      }
    });
  } catch (err) {
    console.error("Allot section error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error allotting section",
      error: err.message 
    });
  }
};

// In-memory notifications
let notifications = [];

export const notifyAllStudents = async (req, res) => {
  try {
    const { message, title, target } = req.body;
    
    if (!message) {
      return res.json({ 
        success: false, 
        message: "Message is required" 
      });
    }
    
    const notification = {
      id: Date.now(),
      title: title || "Announcement",
      message,
      target: target || "All",
      date: new Date(),
      read: false
    };
    
    notifications.unshift(notification);
    
    if (notifications.length > 100) {
      notifications = notifications.slice(0, 100);
    }
    
    res.json({ 
      success: true, 
      message: "Notification sent successfully",
      notification
    });
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server Error",
      error: err.message 
    });
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    res.json({ 
      success: true, 
      notifications,
      count: notifications.length
    });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching notifications",
      error: err.message 
    });
  }
};

export const getStudentByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const student = await Student.findOne({ email, role: "Student" }).select('-password');
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }
    
    res.json({ 
      success: true, 
      student
    });
  } catch (err) {
    console.error("Get student error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching student",
      error: err.message 
    });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const { section, department, semester } = req.query;
    let filter = { role: "Student" };
    
    if (section) filter.section = section;
    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);
    
    const students = await Student.find(filter).select('-password').sort({ name: 1 });
    
    res.json({ 
      success: true, 
      students,
      count: students.length
    });
  } catch (err) {
    console.error("Get all students error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching students",
      error: err.message 
    });
  }
};