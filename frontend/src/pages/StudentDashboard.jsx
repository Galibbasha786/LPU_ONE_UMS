import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import lpuLogo from "../assets/logo.jpg";
import CGPACalculator from "./CGPACalculator";
import "../styles/StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeSection, setActiveSection] = useState("overview");
  const [notifications, setNotifications] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);

  // Redirect if not student
  useEffect(() => {
    if (!user || user.role !== "Student") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch notifications
  useEffect(() => {
    fetch("http://localhost:5001/api/users/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch(console.error);
  }, []);

  // Fetch classes and exams
  useEffect(() => {
    fetch("http://localhost:5001/api/users/classes")
      .then((res) => res.json())
      .then((data) => setUpcomingClasses(data.classes || []))
      .catch(console.error);

    fetch("http://localhost:5001/api/users/exams")
      .then((res) => res.json())
      .then((data) => setUpcomingExams(data.exams || []))
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user || user.role !== "Student") {
    return null;
  }

  const studentStats = {
    attendance: user.attendance || "0%",
    marks: user.marks || "0",
    feesStatus: user.fees || "Unpaid",
    cgpa: user.cgpa || "0.0"
  };

  const getStatusClass = (status) => {
    switch(status) {
      case "Paid": return "status-success";
      case "Present": return "status-success";
      case "Excellent": return "status-success";
      case "Pending": return "status-warning";
      case "Unpaid": return "status-danger";
      case "Absent": return "status-danger";
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
            <span className="user-name">Welcome, {user.name}</span>
            <span className="user-role">Student</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Dashboard</h3>
            <button 
              className={`sidebar-btn ${activeSection === "overview" ? "active" : ""}`}
              onClick={() => setActiveSection("overview")}
            >
              <span className="btn-icon">📊</span>
              <span className="btn-text">Overview</span>
            </button>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Academic</h3>
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
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Finance</h3>
            <button 
              className={`sidebar-btn ${activeSection === "fees" ? "active" : ""}`}
              onClick={() => setActiveSection("fees")}
            >
              <span className="btn-icon">💰</span>
              <span className="btn-text">Fee Details</span>
            </button>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Communication</h3>
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
            <h3 className="sidebar-title">Profile</h3>
            <button onClick={() => navigate("/profile")} className="sidebar-btn">
              <span className="btn-icon">👤</span>
              <span className="btn-text">My Profile</span>
            </button>
          </div>
        </nav>

        {/* Content Area */}
        <main className="dashboard-content">
          {activeSection === "overview" && (
            <div className="content-section">
              <h2 className="section-title">Student Dashboard</h2>
              
              {/* Statistics Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon attendance">✓</div>
                  <div className="stat-info">
                    <h3 className="stat-value">{studentStats.attendance}</h3>
                    <p className="stat-label">Attendance</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon marks">A+</div>
                  <div className="stat-info">
                    <h3 className="stat-value">{studentStats.marks}</h3>
                    <p className="stat-label">Current Marks</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon fees">₹</div>
                  <div className="stat-info">
                    <h3 className="stat-value">{studentStats.feesStatus}</h3>
                    <p className="stat-label">Fee Status</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon performance">★</div>
                  <div className="stat-info">
                    <h3 className="stat-value">{getPerformanceStatus()}</h3>
                    <p className="stat-label">Performance</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h3 className="section-subtitle">Quick Access</h3>
                <div className="actions-grid">
                  <Link to="/student-attendance" className="action-btn">
                    <span className="action-text">View Attendance</span>
                  </Link>
                  <Link to="/student-marks" className="action-btn">
                    <span className="action-text">Check Marks</span>
                  </Link>
                  <Link to="/student-fees" className="action-btn">
                    <span className="action-text">Fee Details</span>
                  </Link>
                  <Link to="/class-timetable" className="action-btn">
                    <span className="action-text">Class Schedule</span>
                  </Link>
                </div>
              </div>

              <div className="content-grid">
                {/* Student Information */}
                <div className="info-card">
                  <h3 className="card-title">Student Information</h3>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{user.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{user.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Section:</span>
                      <span className="info-value">{user.section || "Not Assigned"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Roll Number:</span>
                      <span className="info-value">{user.email.split('@')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Today's Classes */}
                <div className="info-card">
                  <h3 className="card-title">Today's Classes</h3>
                  <div className="schedule-list">
                    {upcomingClasses.slice(0, 3).map((classItem, index) => (
                      <div key={index} className="schedule-item">
                        <span className="schedule-subject">{classItem.subject}</span>
                        <span className="schedule-time">{classItem.time} | {classItem.day}</span>
                      </div>
                    ))}
                    {upcomingClasses.length === 0 && (
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
                        <p className="notification-message">{notification.message}</p>
                        <small className="notification-time">
                          {new Date(notification.date).toLocaleString()}
                        </small>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="no-data">No notifications yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "attendance" && (
            <div className="content-section">
              <h2 className="section-title">My Attendance</h2>
              <div className="info-card">
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Current Attendance:</span>
                    <span className={`status-badge ${getStatusClass("Present")}`}>
                      {studentStats.attendance}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span className={`status-badge ${getStatusClass("Present")}`}>
                      {parseInt(studentStats.attendance) >= 75 ? "Satisfactory" : "Needs Improvement"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Updated:</span>
                    <span className="info-value">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "marks" && (
            <div className="content-section">
              <h2 className="section-title">My Academic Performance</h2>
              <div className="info-card">
                <div className="info-list">
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
                </div>
              </div>
            </div>
          )}

          {activeSection === "fees" && (
            <div className="content-section">
              <h2 className="section-title">My Fee Details</h2>
              <div className="info-card">
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Fee Status:</span>
                    <span className={`status-badge ${getStatusClass(studentStats.feesStatus)}`}>
                      {studentStats.feesStatus}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Payment:</span>
                    <span className="info-value">
                      {studentStats.feesStatus === "Paid" ? "Cleared" : "Pending"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Next Due:</span>
                    <span className="info-value">
                      {studentStats.feesStatus === "Paid" ? "Next Semester" : "Immediate"}
                    </span>
                  </div>
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
                  <div className="schedule-list">
                    {upcomingExams.slice(0, 5).map((exam, index) => (
                      <div key={index} className="schedule-item exam">
                        <span className="schedule-subject">{exam.subject} Exam</span>
                        <span className="schedule-time">{exam.date} | {exam.time}</span>
                      </div>
                    ))}
                    {upcomingExams.length === 0 && (
                      <p className="no-data">No upcoming exams scheduled</p>
                    )}
                  </div>
                </div>

                <div className="info-card">
                  <h3 className="card-title">Weekly Class Schedule</h3>
                  <div className="schedule-list">
                    {upcomingClasses.slice(0, 10).map((classItem, index) => (
                      <div key={index} className="schedule-item">
                        <span className="schedule-subject">{classItem.subject}</span>
                        <span className="schedule-time">{classItem.time} | {classItem.day}</span>
                      </div>
                    ))}
                    {upcomingClasses.length === 0 && (
                      <p className="no-data">No classes scheduled</p>
                    )}
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
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;