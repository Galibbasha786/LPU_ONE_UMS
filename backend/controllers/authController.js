// backend/controllers/authController.js
import bcrypt from "bcryptjs";
import { Admin } from "../models/Admin.js";
import { Staff } from "../models/Staff.js";
import { Student } from "../models/Student.js"; // ✅ Using Student model

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // 1️⃣ Check Admin
    let user = await Admin.findOne({ email });
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        const userData = user.toObject();
        delete userData.password;
        return res.json({ 
          success: true, 
          user: { ...userData, role: "Admin" },
          message: "Admin login successful"
        });
      }
    }

    // 2️⃣ Check Staff
    user = await Staff.findOne({ email });
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        const userData = user.toObject();
        delete userData.password;
        return res.json({ 
          success: true, 
          user: { ...userData, role: "staff" },
          message: "Staff login successful"
        });
      }
    }

    // 3️⃣ Check Student (from Student model)
    user = await Student.findOne({ email });
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        const userData = user.toObject();
        delete userData.password;
        return res.json({ 
          success: true, 
          user: { ...userData, role: "Student" },
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
};

export const createAdmin = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and name are required" 
      });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: "Admin with this email already exists" 
      });
    }

    const hashedPassword = await bcrypt.hash(password || email, 10);
    const admin = new Admin({ 
      ...req.body, 
      password: hashedPassword,
      role: "admin"
    });
    await admin.save();
    
    const adminData = admin.toObject();
    delete adminData.password;
    
    res.json({ 
      success: true, 
      message: "Admin created successfully",
      admin: adminData
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(400).json({ 
      success: false, 
      message: error.message || "Error creating admin" 
    });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { email, name, employeeId, department } = req.body;
    
    if (!email || !name || !employeeId || !department) {
      return res.status(400).json({ 
        success: false, 
        message: "Required fields: email, name, employeeId, department" 
      });
    }

    const existing = await Staff.findOne({ $or: [{ email }, { employeeId }] });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: "Staff with this email or employee ID already exists" 
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password || email, 10);
    const staff = new Staff({ 
      ...req.body, 
      password: hashedPassword,
      role: "staff"
    });
    await staff.save();
    
    const staffData = staff.toObject();
    delete staffData.password;
    
    res.json({ 
      success: true, 
      message: `Staff created successfully! Password is: ${req.body.password || email}`,
      staff: staffData
    });
  } catch (error) {
    console.error("Create staff error:", error);
    res.status(400).json({ 
      success: false, 
      message: error.message || "Error creating staff" 
    });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { email, name, enrollmentId, department, semester, section } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and name are required" 
      });
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: "Student with this email already exists" 
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password || email, 10);
    const student = new Student({ 
      ...req.body, 
      password: hashedPassword,
      role: "Student",
      enrollmentId: enrollmentId || `REG${Date.now()}`,
      attendance: "0%",
      marks: "0",
      fees: "Pending",
      cgpa: 0,
      attendanceData: {}
    });
    await student.save();
    
    const studentData = student.toObject();
    delete studentData.password;
    
    res.json({ 
      success: true, 
      message: `Student created successfully! Password is: ${req.body.password || email}`,
      student: studentData
    });
  } catch (error) {
    console.error("Create student error:", error);
    res.status(400).json({ 
      success: false, 
      message: error.message || "Error creating student" 
    });
  }
};