import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import lpuLogo from "../assets/logo.jpg";
import CGPACalculator from "./CGPACalculator";
import AttendanceCalculator from "./AttendanceCalculator";
import "../styles/StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeSection, setActiveSection] = useState("overview");
  const [notifications, setNotifications] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [marksData, setMarksData] = useState({});
  const [feeDetails, setFeeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [studentProfile, setStudentProfile] = useState(user);

  // Redirect if not student
  useEffect(() => {
    if (!user || user.role !== "Student") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch student profile data
  useEffect(() => {
    if (user && user.email) {
      fetchStudentProfile();
    }
  }, [user]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch classes and exams
  useEffect(() => {
    fetchClasses();
    fetchExams();
  }, []);

  // Fetch attendance data
  useEffect(() => {
    if (user && user.email) {
      fetchAttendanceData();
    }
  }, [user]);

  // Fetch marks data
  useEffect(() => {
    if (user && user.email) {
      fetchMarksData();
    }
  }, [user]);

  // Fetch fee details
  useEffect(() => {
    if (user && user.email) {
      fetchFeeDetails();
    }
  }, [user]);

  const fetchStudentProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/users/student/${user.email}`);
      const data = await res.json();
      if (data.success) {
        setStudentProfile(data.student);
      }
    } catch (err) {
      console.error("Error fetching student profile:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/users/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/users/classes");
      const data = await res.json();
      setUpcomingClasses(data.classes || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/users/exams");
      const data = await res.json();
      setUpcomingExams(data.exams || []);
    } catch (err) {
      console.error("Error fetching exams:", err);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/users/attendance/student/${user.email}`);
      const data = await res.json();
      if (data.success) {
        setAttendanceData(data.attendance);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const fetchMarksData = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/users/reportcards/${user.email}`);
      const data = await res.json();
      if (data.success) {
        setMarksData(data.reports);
      }
    } catch (err) {
      console.error("Error fetching marks:", err);
    }
  };

  const fetchFeeDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/users/fees/${user.email}`);
      const data = await res.json();
      if (data.success) {
        setFeeDetails(data.fee);
      }
    } catch (err) {
      console.error("Error fetching fee details:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user || user.role !== "Student") {
    return null;
  }

  const studentStats = {
    attendance: studentProfile.attendance || "0%",
    marks: studentProfile.marks || "0",
    feesStatus: studentProfile.fees || "Unpaid",
    cgpa: studentProfile.cgpa || "0.0",
    enrollmentId: studentProfile.enrollmentId || "N/A",
    department: studentProfile.department || "Not Assigned",
    semester: studentProfile.semester || "1",
    section: studentProfile.section || "Not Assigned"
  };

  const getStatusClass = (status) => {
    switch(status) {
      case "Paid": return "status-success";
      case "Present": return "status-success";
      case "Excellent": return "status-success";
      case "Good": return "status-success";
      case "Pending": return "status-warning";
      case "Unpaid": return "status-danger";
      case "Absent": return "status-danger";
      case "Average": return "status-warning";
      case "Needs Improvement": return "status-danger";
      default: return "status-warning";
    }
  };

  const getPerformanceStatus = () => {
    const marks = parseInt(studentStats.marks) || 0;
    if (marks >= 80) return "Excellent";
    if (marks >= 60) return "Good";
    if (marks >= 40) return "Average";
    return "Needs Improvement";
  };

  const getAttendancePercentage = () => {
    return parseInt(studentStats.attendance) || 0;
  };

  const getAttendanceStatus = () => {
    const percentage = getAttendancePercentage();
    if (percentage >= 75) return "Satisfactory";
    if (percentage >= 50) return "At Risk";
    return "Critical";
  };

  const getAttendanceColor = () => {
    const percentage = getAttendancePercentage();
    if (percentage >= 75) return "#10b981";
    if (percentage >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getCGPAStatus = () => {
    const cgpa = parseFloat(studentStats.cgpa);
    if (cgpa >= 8.5) return "Excellent";
    if (cgpa >= 7.0) return "Good";
    if (cgpa >= 5.5) return "Average";
    return "Needs Improvement";
  };

  return (
    <div className="student-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-brand">
          <img src={lpuLogo} alt="LPU Logo" className="brand-logo" />
          <div className="brand-text">
            <h1 className="university-name">Lovely Professional University</h1>
            <p className="portal-name">Student Portal</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="user-info">
            <div className="user-avatar-small">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="user-name">Welcome, {user.name}</span>
              <span className="user-role">Student</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">📊 Dashboard</h3>
            <button 
              className={`sidebar-btn ${activeSection === "overview" ? "active" : ""}`}
              onClick={() => setActiveSection("overview")}
            >
              <span className="btn-icon">📊</span>
              <span className="btn-text">Overview</span>
            </button>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">🎓 Academic</h3>
            <button 
              className={`sidebar-btn ${activeSection === "attendance" ? "active" : ""}`}
              onClick={() => setActiveSection("attendance")}
            >
              <span className="btn-icon">✅</span>
              <span className="btn-text">My Attendance</span>
            </button>
            <button 
              className={`sidebar-btn ${activeSection === "marks" ? "active" : ""}`}
              onClick={() => setActiveSection("marks")}
            >
              <span className="btn-icon">📝</span>
              <span className="btn-text">My Marks</span>
            </button>
            <button 
              className={`sidebar-btn ${activeSection === "cgpa" ? "active" : ""}`}
              onClick={() => setActiveSection("cgpa")}
            >
              <span className="btn-icon">🎓</span>
              <span className="btn-text">CGPA Calculator</span>
            </button>
            <button 
              className={`sidebar-btn ${activeSection === "timetable" ? "active" : ""}`}
              onClick={() => setActiveSection("timetable")}
            >
              <span className="btn-icon">🗓️</span>
              <span className="btn-text">My Schedule</span>
            </button>
            <button 
              className={`sidebar-btn ${activeSection === "subjects" ? "active" : ""}`}
              onClick={() => setActiveSection("subjects")}
            >
              <span className="btn-icon">📚</span>
              <span className="btn-text">My Subjects</span>
            </button>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">💰 Finance</h3>
            <button 
              className={`sidebar-btn ${activeSection === "fees" ? "active" : ""}`}
              onClick={() => setActiveSection("fees")}
            >
              <span className="btn-icon">💰</span>
              <span className="btn-text">Fee Details</span>
            </button>
            <button onClick={() => navigate("/payment-history")} className="sidebar-btn">
              <span className="btn-icon">📜</span>
              <span className="btn-text">Payment History</span>
            </button>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">💼 Placement</h3>
            <button onClick={() => navigate("/placements")} className="sidebar-btn">
              <span className="btn-icon">💼</span>
              <span className="btn-text">Placement Cell</span>
            </button>
            <button onClick={() => navigate("/internships")} className="sidebar-btn">
              <span className="btn-icon">📋</span>
              <span className="btn-text">Internships</span>
            </button>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">🔔 Communication</h3>
            <button onClick={() => navigate("/student-notifications")} className="sidebar-btn">
              <span className="btn-icon">🔔</span>
              <span className="btn-text">Notifications</span>
            </button>
            <button onClick={() => navigate("/chat")} className="sidebar-btn">
              <span className="btn-icon">💬</span>
              <span className="btn-text">Live Chat</span>
            </button>
            <button onClick={() => navigate("/ai-chatbot")} className="sidebar-btn">
              <span className="btn-icon">🤖</span>
              <span className="btn-text">LPU AI Assistant</span>
            </button>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">⚙️ Settings</h3>
            <button onClick={() => setShowProfileModal(true)} className="sidebar-btn">
              <span className="btn-icon">👤</span>
              <span className="btn-text">My Profile</span>
            </button>
            <button onClick={() => navigate("/change-password")} className="sidebar-btn">
              <span className="btn-icon">🔒</span>
              <span className="btn-text">Change Password</span>
            </button>
          </div>
        </nav>

        {/* Content Area */}
        <main className="dashboard-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <>
              {activeSection === "overview" && (
                <div className="content-section">
                  <h2 className="section-title">Student Dashboard</h2>
                  
                  {/* Welcome Card */}
                  <div className="welcome-card">
                    <div className="welcome-content">
                      <h3>Welcome back, {user.name}!</h3>
                      <p>Track your academic progress, attendance, and stay updated with university announcements.</p>
                    </div>
                    <div className="welcome-date">
                      <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  {/* Statistics Cards */}
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon attendance">📊</div>
                      <div className="stat-info">
                        <h3 className="stat-value">{studentStats.attendance}</h3>
                        <p className="stat-label">Attendance</p>
                        <div className="attendance-progress">
                          <div className="progress-bar" style={{ width: getAttendancePercentage() + '%', backgroundColor: getAttendanceColor() }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon marks">📝</div>
                      <div className="stat-info">
                        <h3 className="stat-value">{studentStats.marks}</h3>
                        <p className="stat-label">Current Marks</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon fees">💰</div>
                      <div className="stat-info">
                        <h3 className={`stat-value ${getStatusClass(studentStats.feesStatus)}`}>
                          {studentStats.feesStatus}
                        </h3>
                        <p className="stat-label">Fee Status</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon cgpa">🎓</div>
                      <div className="stat-info">
                        <h3 className="stat-value">{studentStats.cgpa}</h3>
                        <p className="stat-label">CGPA</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="quick-actions">
                    <h3 className="section-subtitle">Quick Access</h3>
                    <div className="actions-grid">
                      <button onClick={() => setActiveSection("attendance")} className="action-btn">
                        <span className="action-icon">✅</span>
                        <span className="action-text">View Attendance</span>
                      </button>
                      <button onClick={() => setActiveSection("marks")} className="action-btn">
                        <span className="action-icon">📝</span>
                        <span className="action-text">Check Marks</span>
                      </button>
                      <button onClick={() => setActiveSection("fees")} className="action-btn">
                        <span className="action-icon">💰</span>
                        <span className="action-text">Fee Details</span>
                      </button>
                      <button onClick={() => setActiveSection("timetable")} className="action-btn">
                        <span className="action-icon">🗓️</span>
                        <span className="action-text">Class Schedule</span>
                      </button>
                    </div>
                  </div>

                  <div className="content-grid">
                    {/* Student Information */}
                    <div className="info-card">
                      <h3 className="card-title">Student Information</h3>
                      <div className="info-list">
                        <div className="info-item">
                          <span className="info-label">Name:</span>
                          <span className="info-value">{studentProfile.name}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Enrollment ID:</span>
                          <span className="info-value">{studentStats.enrollmentId}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Department:</span>
                          <span className="info-value">{studentStats.department}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Semester:</span>
                          <span className="info-value">{studentStats.semester}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Section:</span>
                          <span className="info-value">{studentStats.section}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Email:</span>
                          <span className="info-value">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Today's Classes */}
                    <div className="info-card">
                      <h3 className="card-title">Today's Classes</h3>
                      <div className="schedule-list">
                        {upcomingClasses.filter(c => c.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })).slice(0, 3).map((classItem, index) => (
                          <div key={index} className="schedule-item">
                            <span className="schedule-subject">{classItem.subject}</span>
                            <span className="schedule-time">{classItem.time} | Room {classItem.room || "TBD"}</span>
                          </div>
                        ))}
                        {upcomingClasses.filter(c => c.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })).length === 0 && (
                          <p className="no-data">No classes scheduled for today</p>
                        )}
                      </div>
                    </div>

                    {/* Recent Notifications */}
                    <div className="info-card">
                      <h3 className="card-title">Recent Notifications</h3>
                      <div className="notifications-list">
                        {notifications.slice(0, 3).map((notification, index) => (
                          <div key={index} className="notification-item">
                            <div className="notification-icon">📢</div>
                            <div className="notification-content">
                              <p className="notification-message">{notification.message}</p>
                              <small className="notification-time">
                                {new Date(notification.date).toLocaleString()}
                              </small>
                            </div>
                          </div>
                        ))}
                        {notifications.length === 0 && (
                          <p className="no-data">No notifications yet</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Exams */}
                  <div className="info-card">
                    <h3 className="card-title">📅 Upcoming Exams</h3>
                    <div className="exam-list">
                      {upcomingExams.slice(0, 5).map((exam, index) => (
                        <div key={index} className="exam-item">
                          <div className="exam-subject">{exam.subject}</div>
                          <div className="exam-details">
                            <span>{exam.date} | {exam.time}</span>
                            <span className="exam-badge">{exam.type || "Regular"}</span>
                          </div>
                        </div>
                      ))}
                      {upcomingExams.length === 0 && (
                        <p className="no-data">No upcoming exams scheduled</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "attendance" && (
                <div className="content-section">
                  <h2 className="section-title">My Attendance</h2>
                  <div className="info-card">
                    <div className="attendance-summary">
                      <div className="attendance-circle">
                        <svg viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#e6e6e6" strokeWidth="10"/>
                          <circle cx="50" cy="50" r="45" fill="none" stroke={getAttendanceColor()} strokeWidth="10" 
                            strokeDasharray={`${getAttendancePercentage() * 2.83} 283`} strokeLinecap="round"/>
                        </svg>
                        <div className="attendance-percentage">{getAttendancePercentage()}%</div>
                      </div>
                      <div className="attendance-stats">
                        <div className="info-item">
                          <span className="info-label">Status:</span>
                          <span className={`status-badge ${getStatusClass(getAttendanceStatus())}`}>
                            {getAttendanceStatus()}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Required for 75%:</span>
                          <span className="info-value">{Math.max(0, 75 - getAttendancePercentage())}% more</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Last Updated:</span>
                          <span className="info-value">{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AttendanceCalculator />
                </div>
              )}

              {activeSection === "marks" && (
                <div className="content-section">
                  <h2 className="section-title">My Academic Performance</h2>
                  <div className="info-card">
                    <div className="performance-summary">
                      <div className="performance-stats">
                        <div className="info-item">
                          <span className="info-label">Current Marks:</span>
                          <span className="info-value">{studentStats.marks}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Performance:</span>
                          <span className={`status-badge ${getStatusClass(getPerformanceStatus())}`}>
                            {getPerformanceStatus()}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">CGPA:</span>
                          <span className="info-value">{studentStats.cgpa}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">CGPA Status:</span>
                          <span className={`status-badge ${getStatusClass(getCGPAStatus())}`}>
                            {getCGPAStatus()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {marksData && marksData.length > 0 && (
                    <div className="info-card">
                      <h3 className="card-title">Previous Semesters</h3>
                      <div className="semester-list">
                        {marksData.map((report, index) => (
                          <div key={index} className="semester-item">
                            <div className="semester-header">
                              <span>Semester {report.semester || index + 1}</span>
                              <span className="semester-cgpa">CGPA: {report.cgpa || "N/A"}</span>
                            </div>
                            {report.subjects && report.subjects.map((subject, idx) => (
                              <div key={idx} className="subject-item">
                                <span>{subject.name}</span>
                                <span>{subject.marks}%</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "fees" && (
                <div className="content-section">
                  <h2 className="section-title">My Fee Details</h2>
                  <div className="info-card">
                    <div className="fee-summary">
                      <div className="fee-status-large">
                        <span className={`status-badge ${getStatusClass(studentStats.feesStatus)}`}>
                          {studentStats.feesStatus}
                        </span>
                      </div>
                      {feeDetails && (
                        <>
                          <div className="info-item">
                            <span className="info-label">Total Amount:</span>
                            <span className="info-value">₹{feeDetails.totalAmount || "N/A"}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Amount Paid:</span>
                            <span className="info-value">₹{feeDetails.amountPaid || "0"}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Pending Amount:</span>
                            <span className="info-value">₹{feeDetails.pendingAmount || "N/A"}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Due Date:</span>
                            <span className="info-value">{feeDetails.dueDate || "Not Specified"}</span>
                          </div>
                        </>
                      )}
                      <button className="pay-now-btn">Pay Now</button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "timetable" && (
                <div className="content-section">
                  <h2 className="section-title">My Schedule</h2>
                  
                  <div className="content-grid">
                    <div className="info-card">
                      <h3 className="card-title">Upcoming Exams</h3>
                      <div className="exam-list">
                        {upcomingExams.map((exam, index) => (
                          <div key={index} className="exam-item">
                            <div className="exam-subject">{exam.subject}</div>
                            <div className="exam-details">
                              <span>{exam.date} | {exam.time}</span>
                              <span className="exam-badge">{exam.type || "Regular"}</span>
                            </div>
                          </div>
                        ))}
                        {upcomingExams.length === 0 && (
                          <p className="no-data">No upcoming exams scheduled</p>
                        )}
                      </div>
                    </div>

                    <div className="info-card">
                      <h3 className="card-title">Weekly Class Schedule</h3>
                      <div className="weekly-schedule">
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                          <div key={day} className="day-schedule">
                            <div className="day-name">{day}</div>
                            <div className="day-classes">
                              {upcomingClasses.filter(c => c.day === day).map((classItem, idx) => (
                                <div key={idx} className="class-time">
                                  {classItem.time} - {classItem.subject}
                                </div>
                              ))}
                              {upcomingClasses.filter(c => c.day === day).length === 0 && (
                                <div className="no-class">No classes</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "subjects" && (
                <div className="content-section">
                  <h2 className="section-title">My Subjects</h2>
                  <div className="subjects-grid">
                    <div className="info-card">
                      <h3 className="card-title">Current Semester Subjects</h3>
                      <div className="subject-list">
                        <div className="subject-item">
                          <span>Programming Fundamentals</span>
                          <span>CS101</span>
                        </div>
                        <div className="subject-item">
                          <span>Data Structures</span>
                          <span>CS202</span>
                        </div>
                        <div className="subject-item">
                          <span>Database Management</span>
                          <span>CS303</span>
                        </div>
                        <div className="subject-item">
                          <span>Operating Systems</span>
                          <span>CS404</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "cgpa" && (
                <div className="content-section">
                  <h2 className="section-title">CGPA Calculator</h2>
                  <div className="info-card">
                    <CGPACalculator />
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Profile</h3>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="profile-avatar">
                {studentProfile.name?.charAt(0).toUpperCase()}
              </div>
              <div className="profile-details">
                <p><strong>Name:</strong> {studentProfile.name}</p>
                <p><strong>Enrollment ID:</strong> {studentStats.enrollmentId}</p>
                <p><strong>Email:</strong> {studentProfile.email}</p>
                <p><strong>Department:</strong> {studentStats.department}</p>
                <p><strong>Semester:</strong> {studentStats.semester}</p>
                <p><strong>Section:</strong> {studentStats.section}</p>
                <p><strong>CGPA:</strong> {studentStats.cgpa}</p>
                <p><strong>Attendance:</strong> {studentStats.attendance}</p>
                <p><strong>Fee Status:</strong> {studentStats.feesStatus}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;