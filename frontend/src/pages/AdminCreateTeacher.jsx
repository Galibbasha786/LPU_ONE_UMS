import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import lpuLogo from "../assets/logo.jpg";

function AdminCreateTeacher() {
  const navigate = useNavigate();
  
  // Load saved data from localStorage on mount
  const loadSavedData = () => {
    const saved = localStorage.getItem("teacherFormData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  };
  
  const [teacherData, setTeacherData] = useState(() => {
    const saved = loadSavedData();
    return saved ? saved.teacherData : {
      name: "",
      email: "",
      password: "",
      employeeId: "",
      department: "",
      designation: "",
      phoneNumber: "",
      profilePicture: "",
      qualification: "",
      experience: "",
      specialization: "",
      joinDate: new Date().toISOString().split('T')[0],
      isClassTeacher: false,
      classTeacherSemester: "",
      classTeacherSection: "",
      coursesTeaching: [],
      bankAccountNumber: "",
      bankName: "",
      ifscCode: "",
      address: "",
      emergencyContact: "",
      bloodGroup: "",
      dateOfBirth: "",
      gender: "",
      maritalStatus: "",
      panNumber: "",
      aadharNumber: ""
    };
  });
  
  const [courses, setCourses] = useState(() => {
    const saved = loadSavedData();
    return saved ? saved.courses : [
      { courseId: "CS101", courseName: "Programming Fundamentals", semester: "1", section: "" },
      { courseId: "CS202", courseName: "Data Structures", semester: "2", section: "" },
      { courseId: "CS303", courseName: "Database Management", semester: "3", section: "" },
      { courseId: "CS404", courseName: "Operating Systems", semester: "4", section: "" }
    ];
  });
  
  const [availableCourses, setAvailableCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = loadSavedData();
    return saved ? saved.currentStep : 1;
  });
  const [showPassword, setShowPassword] = useState(false);

  // Save form data to localStorage on every change
  useEffect(() => {
    const formData = {
      teacherData,
      courses,
      currentStep
    };
    localStorage.setItem("teacherFormData", JSON.stringify(formData));
  }, [teacherData, courses, currentStep]);

  // Fetch available courses from backend
  useEffect(() => {
    fetchAvailableCourses();
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/courses");
      const data = await res.json();
      if (data.success) {
        setAvailableCourses(data.courses);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  // Clear saved data after successful submission
  const clearSavedData = () => {
    localStorage.removeItem("teacherFormData");
  };

  // Department options
  const departments = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Information Technology",
    "Business Administration",
    "Management Studies",
    "Physics",
    "Chemistry",
    "Mathematics",
    "English"
  ];

  // Designation options
  const designations = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Senior Lecturer",
    "Lecturer",
    "Head of Department",
    "Dean",
    "Lab Instructor",
    "Visiting Faculty"
  ];

  // Qualification options
  const qualifications = [
    "Ph.D",
    "M.Tech",
    "M.E",
    "M.Sc",
    "B.Tech",
    "B.E",
    "MBA",
    "MCA",
    "M.Phil",
    "Post Graduate",
    "Graduate"
  ];

  // Section options
  const sections = ["A", "B", "C", "D", "E"];

  // Semester options
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  // Gender options
  const genders = ["Male", "Female", "Other"];

  // Blood Group options
  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  // Marital Status options
  const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTeacherData({
      ...teacherData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const generateEmployeeId = () => {
    const deptCode = teacherData.department ? teacherData.department.substring(0, 3).toUpperCase() : "STA";
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000);
    const empId = `${deptCode}${year}${random}`;
    setTeacherData({ ...teacherData, employeeId: empId });
  };

  const handleCourseChange = (index, field, value) => {
    const updatedCourses = [...courses];
    updatedCourses[index][field] = value;
    setCourses(updatedCourses);
  };

  const addCourse = () => {
    setCourses([
      ...courses,
      { courseId: "", courseName: "", semester: "", section: "" }
    ]);
  };

  const removeCourse = (index) => {
    const updatedCourses = courses.filter((_, i) => i !== index);
    setCourses(updatedCourses);
  };

  const addCourseFromList = (course) => {
    setCourses([
      ...courses,
      {
        courseId: course.courseCode,
        courseName: course.courseName,
        semester: course.semester?.toString() || "1",
        section: ""
      }
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    // Prepare final staff data
    const staffData = {
      name: teacherData.name,
      email: teacherData.email,
      password: teacherData.password || teacherData.email,
      employeeId: teacherData.employeeId,
      department: teacherData.department,
      designation: teacherData.designation,
      phoneNumber: teacherData.phoneNumber,
      profilePicture: teacherData.profilePicture,
      qualification: teacherData.qualification,
      experience: teacherData.experience,
      specialization: teacherData.specialization,
      joinDate: teacherData.joinDate,
      isClassTeacher: teacherData.isClassTeacher,
      classTeacherOf: teacherData.isClassTeacher ? {
        semester: teacherData.classTeacherSemester,
        section: teacherData.classTeacherSection
      } : null,
      coursesTeaching: courses.filter(c => c.courseId && c.courseName),
      bankAccountNumber: teacherData.bankAccountNumber,
      bankName: teacherData.bankName,
      ifscCode: teacherData.ifscCode,
      address: teacherData.address,
      emergencyContact: teacherData.emergencyContact,
      bloodGroup: teacherData.bloodGroup,
      dateOfBirth: teacherData.dateOfBirth,
      gender: teacherData.gender,
      maritalStatus: teacherData.maritalStatus,
      panNumber: teacherData.panNumber,
      aadharNumber: teacherData.aadharNumber
    };
    
    try {
      const res = await fetch("http://localhost:5001/api/users/create-staff", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(staffData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      
      if (data.success) {
        setMessageType("success");
        setMessage(`✅ Staff created successfully! Password: ${teacherData.password || teacherData.email}`);
        
        // Clear saved data after successful submission
        clearSavedData();
        
        // Reset form
        setTeacherData({
          name: "", email: "", password: "", employeeId: "", department: "", designation: "",
          phoneNumber: "", profilePicture: "", qualification: "", experience: "", specialization: "",
          joinDate: new Date().toISOString().split('T')[0], isClassTeacher: false,
          classTeacherSemester: "", classTeacherSection: "", coursesTeaching: [],
          bankAccountNumber: "", bankName: "", ifscCode: "", address: "", emergencyContact: "",
          bloodGroup: "", dateOfBirth: "", gender: "", maritalStatus: "", panNumber: "", aadharNumber: ""
        });
        setCourses([
          { courseId: "CS101", courseName: "Programming Fundamentals", semester: "1", section: "" },
          { courseId: "CS202", courseName: "Data Structures", semester: "2", section: "" },
          { courseId: "CS303", courseName: "Database Management", semester: "3", section: "" },
          { courseId: "CS404", courseName: "Operating Systems", semester: "4", section: "" }
        ]);
        setCurrentStep(1);
        
        setTimeout(() => navigate("/admin-dashboard"), 2000);
      } else {
        setMessageType("error");
        setMessage("❌ Failed to create staff: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ Error creating staff:", err);
      setMessageType("error");
      setMessage("⚠️ Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!teacherData.name || !teacherData.email || !teacherData.employeeId || !teacherData.department) {
        setMessageType("error");
        setMessage("Please fill all required fields in Personal Details");
        return;
      }
    }
    if (currentStep === 2) {
      // Optional: Validate at least one course is added
      const hasCourses = courses.some(c => c.courseId && c.courseName);
      if (!hasCourses) {
        setMessageType("warning");
        setMessage("⚠️ No courses added. You can add courses later.");
        // Allow proceeding but show warning
      }
    }
    setCurrentStep(currentStep + 1);
    // Clear any existing messages when moving to next step
    setMessage("");
    setMessageType("");
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setMessage("");
    setMessageType("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={lpuLogo} alt="LPU Logo" style={styles.logo} />
        <h2 style={styles.title}>Create Staff Account</h2>
        <p style={styles.subtitle}>Complete Staff Registration Form</p>
        
        {/* Progress Steps */}
        <div style={styles.steps}>
          <div style={{...styles.step, ...(currentStep >= 1 ? styles.stepActive : {})}}>1</div>
          <div style={{...styles.stepLine, ...(currentStep >= 2 ? styles.stepLineActive : {})}}></div>
          <div style={{...styles.step, ...(currentStep >= 2 ? styles.stepActive : {})}}>2</div>
          <div style={{...styles.stepLine, ...(currentStep >= 3 ? styles.stepLineActive : {})}}></div>
          <div style={{...styles.step, ...(currentStep >= 3 ? styles.stepActive : {})}}>3</div>
          <div style={{...styles.stepLine, ...(currentStep >= 4 ? styles.stepLineActive : {})}}></div>
          <div style={{...styles.step, ...(currentStep >= 4 ? styles.stepActive : {})}}>4</div>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Step 1: Personal Details */}
          {currentStep === 1 && (
            <div style={styles.stepContent}>
              <h3 style={styles.stepTitle}>📝 Personal Details</h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  style={styles.input}
                  placeholder="Dr. John Doe"
                  name="name"
                  value={teacherData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address *</label>
                  <input
                    style={styles.input}
                    type="email"
                    placeholder="john.doe@lpu.edu"
                    name="email"
                    value={teacherData.email}
                    onChange={handleChange}
                    required
                  />
                  <small style={styles.helperText}>Password will be set to this email by default</small>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Password</label>
                  <div style={styles.passwordContainer}>
                    <input
                      style={{...styles.input, paddingRight: "40px"}}
                      type={showPassword ? "text" : "password"}
                      placeholder="Leave blank to use email"
                      name="password"
                      value={teacherData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={styles.passwordToggle}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Employee ID *</label>
                  <div style={styles.idInputGroup}>
                    <input
                      style={{...styles.input, flex: 1}}
                      placeholder="EMP001"
                      name="employeeId"
                      value={teacherData.employeeId}
                      onChange={handleChange}
                      required
                    />
                    <button type="button" onClick={generateEmployeeId} style={styles.generateBtn}>
                      Generate
                    </button>
                  </div>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    style={styles.input}
                    placeholder="9876543210"
                    name="phoneNumber"
                    value={teacherData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Department *</label>
                  <select
                    style={styles.select}
                    name="department"
                    value={teacherData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Designation *</label>
                  <select
                    style={styles.select}
                    name="designation"
                    value={teacherData.designation}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Designation</option>
                    {designations.map(des => (
                      <option key={des} value={des}>{des}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Qualification</label>
                  <select
                    style={styles.select}
                    name="qualification"
                    value={teacherData.qualification}
                    onChange={handleChange}
                  >
                    <option value="">Select Qualification</option>
                    {qualifications.map(qual => (
                      <option key={qual} value={qual}>{qual}</option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Experience (Years)</label>
                  <input
                    style={styles.input}
                    placeholder="e.g., 5"
                    name="experience"
                    value={teacherData.experience}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Specialization</label>
                  <input
                    style={styles.input}
                    placeholder="e.g., Artificial Intelligence"
                    name="specialization"
                    value={teacherData.specialization}
                    onChange={handleChange}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Joining Date</label>
                  <input
                    style={styles.input}
                    type="date"
                    name="joinDate"
                    value={teacherData.joinDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Gender</label>
                  <select
                    style={styles.select}
                    name="gender"
                    value={teacherData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    {genders.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date of Birth</label>
                  <input
                    style={styles.input}
                    type="date"
                    name="dateOfBirth"
                    value={teacherData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Blood Group</label>
                  <select
                    style={styles.select}
                    name="bloodGroup"
                    value={teacherData.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Marital Status</label>
                  <select
                    style={styles.select}
                    name="maritalStatus"
                    value={teacherData.maritalStatus}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    {maritalStatuses.map(ms => (
                      <option key={ms} value={ms}>{ms}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Profile Picture URL</label>
                <input
                  style={styles.input}
                  placeholder="https://example.com/photo.jpg"
                  name="profilePicture"
                  value={teacherData.profilePicture}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
          
          {/* Step 2: Academic Details */}
          {currentStep === 2 && (
            <div style={styles.stepContent}>
              <h3 style={styles.stepTitle}>📚 Academic Details</h3>
              
              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isClassTeacher"
                    checked={teacherData.isClassTeacher}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  Is Class Teacher?
                </label>
              </div>
              
              {teacherData.isClassTeacher && (
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Class Teacher - Semester</label>
                    <select
                      style={styles.select}
                      name="classTeacherSemester"
                      value={teacherData.classTeacherSemester}
                      onChange={handleChange}
                    >
                      <option value="">Select Semester</option>
                      {semesters.map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Class Teacher - Section</label>
                    <select
                      style={styles.select}
                      name="classTeacherSection"
                      value={teacherData.classTeacherSection}
                      onChange={handleChange}
                    >
                      <option value="">Select Section</option>
                      {sections.map(sec => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Courses Teaching</label>
                {availableCourses.length > 0 && (
                  <div style={styles.quickAddCourses}>
                    <label style={styles.labelSmall}>Quick Add from Course List:</label>
                    <select
                      onChange={(e) => {
                        const course = availableCourses.find(c => c.courseCode === e.target.value);
                        if (course) addCourseFromList(course);
                        e.target.value = "";
                      }}
                      style={styles.selectSmall}
                      value=""
                    >
                      <option value="">Select a course to add...</option>
                      {availableCourses.map(course => (
                        <option key={course.courseCode} value={course.courseCode}>
                          {course.courseCode} - {course.courseName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {courses.map((course, index) => (
                  <div key={index} style={styles.courseCard}>
                    <div style={styles.courseHeader}>
                      <strong>Course {index + 1}</strong>
                      {index >= 4 && (
                        <button
                          type="button"
                          onClick={() => removeCourse(index)}
                          style={styles.removeCourseBtn}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <input
                          style={styles.inputSmall}
                          placeholder="Course ID"
                          value={course.courseId}
                          onChange={(e) => handleCourseChange(index, "courseId", e.target.value)}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <input
                          style={styles.inputSmall}
                          placeholder="Course Name"
                          value={course.courseName}
                          onChange={(e) => handleCourseChange(index, "courseName", e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <select
                          style={styles.selectSmall}
                          value={course.semester}
                          onChange={(e) => handleCourseChange(index, "semester", e.target.value)}
                        >
                          <option value="">Semester</option>
                          {semesters.map(sem => (
                            <option key={sem} value={sem}>{sem}</option>
                          ))}
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <select
                          style={styles.selectSmall}
                          value={course.section}
                          onChange={(e) => handleCourseChange(index, "section", e.target.value)}
                        >
                          <option value="">Section</option>
                          {sections.map(sec => (
                            <option key={sec} value={sec}>{sec}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addCourse} style={styles.addCourseBtn}>
                  + Add More Course
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Bank & Contact Details */}
          {currentStep === 3 && (
            <div style={styles.stepContent}>
              <h3 style={styles.stepTitle}>🏦 Bank & Contact Details</h3>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>PAN Number</label>
                  <input
                    style={styles.input}
                    placeholder="ABCDE1234F"
                    name="panNumber"
                    value={teacherData.panNumber}
                    onChange={handleChange}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Aadhar Number</label>
                  <input
                    style={styles.input}
                    placeholder="1234 5678 9012"
                    name="aadharNumber"
                    value={teacherData.aadharNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Bank Account Number</label>
                <input
                  style={styles.input}
                  placeholder="XXXXXXXXXX"
                  name="bankAccountNumber"
                  value={teacherData.bankAccountNumber}
                  onChange={handleChange}
                />
              </div>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Bank Name</label>
                  <input
                    style={styles.input}
                    placeholder="State Bank of India"
                    name="bankName"
                    value={teacherData.bankName}
                    onChange={handleChange}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>IFSC Code</label>
                  <input
                    style={styles.input}
                    placeholder="SBIN0001234"
                    name="ifscCode"
                    value={teacherData.ifscCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Address</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Full Address"
                  name="address"
                  value={teacherData.address}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Emergency Contact Number</label>
                <input
                  style={styles.input}
                  placeholder="9876543210"
                  name="emergencyContact"
                  value={teacherData.emergencyContact}
                  onChange={handleChange}
                />
              </div>
              
              <div style={styles.infoBox}>
                <p style={styles.infoText}>
                  📌 Note: The staff member will receive their login credentials via email. 
                  Default password is their email address.
                </p>
              </div>
            </div>
          )}
          
          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div style={styles.stepContent}>
              <h3 style={styles.stepTitle}>✅ Review & Submit</h3>
              
              <div style={styles.reviewCard}>
                <h4>Personal Information</h4>
                <div style={styles.reviewGrid}>
                  <div><strong>Name:</strong> {teacherData.name || "-"}</div>
                  <div><strong>Email:</strong> {teacherData.email || "-"}</div>
                  <div><strong>Employee ID:</strong> {teacherData.employeeId || "-"}</div>
                  <div><strong>Department:</strong> {teacherData.department || "-"}</div>
                  <div><strong>Designation:</strong> {teacherData.designation || "-"}</div>
                  <div><strong>Qualification:</strong> {teacherData.qualification || "-"}</div>
                  <div><strong>Experience:</strong> {teacherData.experience || "0"} years</div>
                  <div><strong>Phone:</strong> {teacherData.phoneNumber || "-"}</div>
                  <div><strong>Gender:</strong> {teacherData.gender || "-"}</div>
                  <div><strong>Blood Group:</strong> {teacherData.bloodGroup || "-"}</div>
                </div>
              </div>
              
              <div style={styles.reviewCard}>
                <h4>Academic Information</h4>
                <div><strong>Class Teacher:</strong> {teacherData.isClassTeacher ? "Yes" : "No"}</div>
                {teacherData.isClassTeacher && (
                  <div><strong>Class Teacher Of:</strong> Semester {teacherData.classTeacherSemester} - Section {teacherData.classTeacherSection}</div>
                )}
                <div><strong>Courses Teaching:</strong> {courses.filter(c => c.courseId).length} course(s)</div>
                {courses.filter(c => c.courseId).length > 0 && (
                  <ul style={styles.courseList}>
                    {courses.filter(c => c.courseId).map((c, i) => (
                      <li key={i}>{c.courseId} - {c.courseName} (Sem {c.semester}, Sec {c.section || "TBD"})</li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div style={styles.reviewCard}>
                <h4>Bank & Contact Details</h4>
                <div style={styles.reviewGrid}>
                  <div><strong>Bank Account:</strong> {teacherData.bankAccountNumber || "-"}</div>
                  <div><strong>Bank Name:</strong> {teacherData.bankName || "-"}</div>
                  <div><strong>IFSC:</strong> {teacherData.ifscCode || "-"}</div>
                  <div><strong>Emergency Contact:</strong> {teacherData.emergencyContact || "-"}</div>
                </div>
              </div>
              
              <div style={styles.infoBox}>
                <p style={styles.infoText}>
                  ⚠️ Please review all details before submitting. After submission, the staff member will receive their credentials via email.
                </p>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div style={styles.buttonGroup}>
            {currentStep > 1 && (
              <button type="button" onClick={prevStep} style={styles.prevBtn}>
                ← Previous
              </button>
            )}
            
            {currentStep < 4 ? (
              <button type="button" onClick={nextStep} style={styles.nextBtn}>
                Next →
              </button>
            ) : (
              <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? "Creating..." : "✅ Create Staff Account"}
              </button>
            )}
          </div>
        </form>
        
        {message && (
          <div style={{
            ...styles.message,
            ...(messageType === "success" ? styles.messageSuccess : 
               messageType === "error" ? styles.messageError : 
               styles.messageWarning)
          }}>
            {message}
          </div>
        )}
        
        <button 
          onClick={() => navigate("/admin-dashboard")}
          style={styles.backBtn}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },
  card: {
    background: "white",
    padding: "2rem",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "900px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  logo: {
    width: "60px",
    height: "60px",
    marginBottom: "1rem",
    borderRadius: "50%",
    display: "block",
    margin: "0 auto 1rem auto",
  },
  title: {
    color: "#2c3e50",
    marginBottom: "0.5rem",
    fontSize: "1.8rem",
    textAlign: "center",
  },
  subtitle: {
    color: "#7f8c8d",
    marginBottom: "2rem",
    fontSize: "1rem",
    textAlign: "center",
  },
  steps: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "2rem",
  },
  step: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    background: "#e1e8ed",
    color: "#7f8c8d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  stepActive: {
    background: "#f58003",
    color: "white",
  },
  stepLine: {
    width: "50px",
    height: "2px",
    background: "#e1e8ed",
    margin: "0 10px",
  },
  stepLineActive: {
    background: "#f58003",
  },
  stepContent: {
    animation: "fadeIn 0.5s ease",
  },
  stepTitle: {
    fontSize: "1.3rem",
    marginBottom: "1.5rem",
    color: "#2c3e50",
    borderLeft: "4px solid #f58003",
    paddingLeft: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formGroup: {
    marginBottom: "1rem",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "600",
    color: "#2c3e50",
    fontSize: "0.9rem",
  },
  labelSmall: {
    fontSize: "0.85rem",
    fontWeight: "500",
    color: "#7f8c8d",
    marginBottom: "0.3rem",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
    fontWeight: "600",
    color: "#2c3e50",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordToggle: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1.2rem",
  },
  input: {
    width: "100%",
    padding: "0.8rem",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    fontSize: "0.95rem",
    transition: "border-color 0.3s",
    outline: "none",
  },
  inputSmall: {
    width: "100%",
    padding: "0.6rem",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    fontSize: "0.9rem",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "0.8rem",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    fontSize: "0.95rem",
    background: "white",
    outline: "none",
  },
  selectSmall: {
    width: "100%",
    padding: "0.6rem",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    fontSize: "0.9rem",
    background: "white",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "0.8rem",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
  },
  idInputGroup: {
    display: "flex",
    gap: "0.5rem",
  },
  generateBtn: {
    padding: "0 1rem",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  quickAddCourses: {
    background: "#f8f9fa",
    padding: "0.8rem",
    borderRadius: "8px",
    marginBottom: "1rem",
  },
  courseCard: {
    background: "#f8f9fa",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
  },
  courseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  removeCourseBtn: {
    background: "#e74c3c",
    color: "white",
    border: "none",
    padding: "0.3rem 0.8rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  addCourseBtn: {
    width: "100%",
    padding: "0.6rem",
    background: "#ecf0f1",
    border: "2px dashed #bdc3c7",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: "0.5rem",
  },
  reviewCard: {
    background: "#f8f9fa",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
  },
  reviewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  courseList: {
    marginTop: "0.5rem",
    paddingLeft: "1.5rem",
    fontSize: "0.9rem",
  },
  infoBox: {
    background: "#e3f2fd",
    padding: "1rem",
    borderRadius: "8px",
    marginTop: "1rem",
  },
  infoText: {
    margin: 0,
    color: "#1976d2",
    fontSize: "0.9rem",
  },
  helperText: {
    display: "block",
    marginTop: "0.3rem",
    fontSize: "0.8rem",
    color: "#7f8c8d",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    marginTop: "2rem",
  },
  prevBtn: {
    flex: 1,
    padding: "0.8rem",
    background: "white",
    color: "#7f8c8d",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
  },
  nextBtn: {
    flex: 1,
    padding: "0.8rem",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
  },
  submitBtn: {
    flex: 1,
    padding: "0.8rem",
    background: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
  },
  backBtn: {
    width: "100%",
    background: "transparent",
    color: "#3498db",
    border: "2px solid #3498db",
    padding: "0.8rem",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "1rem",
    fontWeight: "600",
  },
  message: {
    padding: "1rem",
    borderRadius: "8px",
    marginTop: "1rem",
    fontWeight: "500",
    textAlign: "center",
  },
  messageSuccess: {
    background: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
  },
  messageError: {
    background: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  },
  messageWarning: {
    background: "#fff3e0",
    color: "#f57c00",
    border: "1px solid #ffe0b2",
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  input:focus, select:focus, textarea:focus {
    border-color: #f58003;
    box-shadow: 0 0 0 3px rgba(245, 128, 3, 0.1);
    outline: none;
  }
`;
document.head.appendChild(styleSheet);

export default AdminCreateTeacher;