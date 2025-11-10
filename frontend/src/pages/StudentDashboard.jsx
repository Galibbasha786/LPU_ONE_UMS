import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import lpuLogo from "../assets/logo.jpg";
import "../styles/Dashboard.css";

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
    // Fetch classes
    fetch("http://localhost:5001/api/users/classes")
      .then((res) => res.json())
      .then((data) => setUpcomingClasses(data.classes || []))
      .catch(console.error);

    // Fetch exams
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

  // Student statistics
  const studentStats = {
    attendance: user.attendance || "0%",
    marks: user.marks || "0",
    feesStatus: user.fees || "Unpaid",
    cgpa: user.cgpa || "0.0"
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch(status) {
      case "Paid": return "dashboard-status-success";
      case "Present": return "dashboard-status-success";
      case "Excellent": return "dashboard-status-success";
      case "Pending": return "dashboard-status-danger";
      case "Unpaid": return "dashboard-status-danger";
      case "Absent": return "dashboard-status-danger";
      default: return "dashboard-status-warning";
    }
  };

  // Get performance status
  const getPerformanceStatus = () => {
    const marks = parseInt(studentStats.marks) || 0;
    if (marks >= 80) return "Excellent";
    if (marks >= 60) return "Good";
    if (marks >= 40) return "Average";
    return "Needs Improvement";
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <img src={lpuLogo} alt="LPU Logo" className="dashboard-logo" />
          <div className="dashboard-header-text">
            <h1>Lovely Professional University</h1>
            <p>Student Portal</p>
          </div>
        </div>
        <div className="dashboard-header-right">
          <div className="dashboard-user-info">
            <span className="dashboard-welcome">Welcome, {user.name} 🎓</span>
            <button onClick={handleLogout} className="dashboard-logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main-content">
        {/* Sidebar Navigation */}
        <nav className="dashboard-sidebar">
          <div className="dashboard-sidebar-section">
            <h3 className="dashboard-sidebar-title">📊 Dashboard</h3>
            <button 
              className={activeSection === "overview" ? "dashboard-sidebar-btn-active" : "dashboard-sidebar-btn"}
              onClick={() => setActiveSection("overview")}
            >
              📈 Overview
            </button>
          </div>

          <div className="dashboard-sidebar-section">
            <h3 className="dashboard-sidebar-title">📚 Academic</h3>
            <button 
              className={activeSection === "attendance" ? "dashboard-sidebar-btn-active" : "dashboard-sidebar-btn"}
              onClick={() => setActiveSection("attendance")}
            >
              ✅ My Attendance
            </button>
            <button 
              className={activeSection === "marks" ? "dashboard-sidebar-btn-active" : "dashboard-sidebar-btn"}
              onClick={() => setActiveSection("marks")}
            >
              📝 My Marks
            </button>
            <button 
              className={activeSection === "timetable" ? "dashboard-sidebar-btn-active" : "dashboard-sidebar-btn"}
              onClick={() => setActiveSection("timetable")}
            >
              🗓️ My Schedule
            </button>
          </div>

          <div className="dashboard-sidebar-section">
            <h3 className="dashboard-sidebar-title">💰 Finance</h3>
            <button 
              className={activeSection === "fees" ? "dashboard-sidebar-btn-active" : "dashboard-sidebar-btn"}
              onClick={() => setActiveSection("fees")}
            >
              💳 Fee Details
            </button>
          
          </div>

          <div className="dashboard-sidebar-section">
            <h3 className="dashboard-sidebar-title">🔔 Communication</h3>
            <button onClick={() => navigate("/student-notifications")} className="dashboard-sidebar-btn">
              📢 Notifications
            </button>
            <button onClick={() => navigate("/chat")} className="dashboard-sidebar-btn">
              💬 Live Chat
            </button>
              <button onClick={() => navigate("/ai-chatbot")} className="dashboard-sidebar-btn">
  🤖 LPU AI Assistant
</button>
          </div>

          <div className="dashboard-sidebar-section">
            <h3 className="dashboard-sidebar-title">👤 Profile</h3>
            <button onClick={() => navigate("/profile")} className="dashboard-sidebar-btn">
              🔧 My Profile
            </button>
          </div>
        </nav>

        {/* Content Area */}
        <main className="dashboard-content">
          {activeSection === "overview" && (
            <div>
              <h2 className="dashboard-section-title">📊 Student Dashboard</h2>
              
              {/* Statistics Cards */}
              <div className="dashboard-stats-grid">
                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon">✅</div>
                  <div className="dashboard-stat-info">
                    <h3 className="dashboard-stat-number">{studentStats.attendance}</h3>
                    <p className="dashboard-stat-label">Attendance</p>
                  </div>
                </div>
                
                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon">📝</div>
                  <div className="dashboard-stat-info">
                    <h3 className="dashboard-stat-number">{studentStats.marks}</h3>
                    <p className="dashboard-stat-label">Current Marks</p>
                  </div>
                </div>
                
                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon">💰</div>
                  <div className="dashboard-stat-info">
                    <h3 className="dashboard-stat-number">{studentStats.feesStatus}</h3>
                    <p className="dashboard-stat-label">Fee Status</p>
                  </div>
                </div>
                
                <div className="dashboard-stat-card">
                  <div className="dashboard-stat-icon">⭐</div>
                  <div className="dashboard-stat-info">
                    <h3 className="dashboard-stat-number">{getPerformanceStatus()}</h3>
                    <p className="dashboard-stat-label">Performance</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="dashboard-quick-actions">
                <h3 className="dashboard-section-title">🚀 Quick Access</h3>
                <div className="dashboard-action-grid">
                  <Link to="/student-attendance" className="dashboard-action-btn">
                    <span className="dashboard-action-icon">✅</span>
                    <span>View Attendance</span>
                  </Link>
                  <Link to="/student-marks" className="dashboard-action-btn">
                    <span className="dashboard-action-icon">📝</span>
                    <span>Check Marks</span>
                  </Link>
                  <Link to="/student-fees" className="dashboard-action-btn">
                    <span className="dashboard-action-icon">💰</span>
                    <span>Fee Details</span>
                  </Link>
                  <Link to="/class-timetable" className="dashboard-action-btn">
                    <span className="dashboard-action-icon">🏫</span>
                    <span>Class Schedule</span>
                  </Link>
                </div>
              </div>

              {/* Student Information */}
              <div className="dashboard-info-card">
                <h3 style={{marginBottom: '1rem', color: '#2c3e50'}}>👤 Student Information</h3>
                <div className="dashboard-info-grid">
                  <div className="dashboard-info-item">
                    <span className="dashboard-info-label">Name:</span>
                    <span className="dashboard-info-value">{user.name}</span>
                  </div>
                  <div className="dashboard-info-item">
                    <span className="dashboard-info-label">Email:</span>
                    <span className="dashboard-info-value">{user.email}</span>
                  </div>
                  <div className="dashboard-info-item">
                    <span className="dashboard-info-label">Section:</span>
                    <span className="dashboard-info-value">{user.section || "Not Assigned"}</span>
                  </div>
                  <div className="dashboard-info-item">
                    <span className="dashboard-info-label">Roll Number:</span>
                    <span className="dashboard-info-value">{user.email.split('@')[0]}</span>
                  </div>
                </div>
              </div>

              {/* Upcoming Classes */}
              <div className="dashboard-info-card">
                <h3 style={{marginBottom: '1rem', color: '#2c3e50'}}>🏫 Today's Classes</h3>
                <div className="dashboard-schedule-list">
                  {upcomingClasses.slice(0, 3).map((classItem, index) => (
                    <div key={index} className="dashboard-schedule-item">
                      <span className="dashboard-schedule-subject">{classItem.subject}</span>
                      <span className="dashboard-schedule-time">{classItem.time} | {classItem.day}</span>
                    </div>
                  ))}
                  {upcomingClasses.length === 0 && (
                    <p style={{color: '#7f8c8d', textAlign: 'center'}}>No classes scheduled for today</p>
                  )}
                </div>
              </div>

              {/* Recent Notifications */}
              <div className="dashboard-info-card">
                <h3 style={{marginBottom: '1rem', color: '#2c3e50'}}>📢 Recent Notifications</h3>
                <div>
                  {notifications.slice(0, 3).map((notification, index) => (
                    <div key={index} className="dashboard-notification-item">
                      <p className="dashboard-notification-message">{notification.message}</p>
                      <small className="dashboard-notification-time">
                        {new Date(notification.date).toLocaleString()}
                      </small>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p style={{color: '#7f8c8d', textAlign: 'center'}}>No notifications yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === "attendance" && (
            <div>
              <h2 className="dashboard-section-title">✅ My Attendance</h2>
              <div className="dashboard-info-card">
                <div className="dashboard-info-item">
                  <span className="dashboard-info-label">Current Attendance:</span>
                  <span className={`dashboard-status-badge ${getStatusClass("Present")}`}>
                    {studentStats.attendance}
                  </span>
                </div>
                <div className="dashboard-info-item">
                  <span className="dashboard-info-label">Status:</span>
                  <span className={`dashboard-status-badge ${getStatusClass("Present")}`}>
                    {parseInt(studentStats.attendance) >= 75 ? "Satisfactory" : "Needs Improvement"}
                  </span>
                </div>
                <div className="dashboard-info-item">
                  <span className="dashboard-info-label">Last Updated:</span>
                  <span className="dashboard-info-value">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{textAlign: 'center', marginTop: '2rem'}}>
                <p style={{color: '#7f8c8d'}}>Detailed attendance records are maintained by your faculty</p>
              </div>
            </div>
          )}

          {activeSection === "marks" && (
            <div>
              <h2 className="dashboard-section-title">📝 My Academic Performance</h2>
              <div className="dashboard-info-card">
                <div className="dashboard-info-item">
                  <span className="dashboard-info-label">Current Marks:</span>
                  <span className="dashboard-info-value">{studentStats.marks}</span>
                </div>
                <div className="dashboard-info-item">
                  <span className="dashboard-info-label">Performance:</span>
                  <span className={`dashboard-status-badge ${getStatusClass(getPerformanceStatus())}`}>
                    {getPerformanceStatus()}
                  </span>
                </div>
                <div className="dashboard-info-item">
                  <span className="dashboard-info-label">CGPA:</span>
                  <span className="dashboard-info-value">{studentStats.cgpa}</span>
                </div>
              </div>
              <div style={{textAlign: 'center', marginTop: '2rem'}}>
                <p style={{color: '#7f8c8d'}}>Detailed mark sheets and grade cards are available with the examination department</p>
              </div>
            </div>
          )}

          {activeSection === "fees" && (
            <div>
              <h2 className="dashboard-section-title">💰 My Fee Details</h2>
              <div className="dashboard-info-card">
                <div className="dashboard-info-item">
                  <span className="dashboard-info-label">Fee Status:</span>
                  <span className={`dashboard-status-badge ${getStatusClass(studentStats.feesStatus)}`}>
                    {studentStats.feesStatus}
                  </span>
                </div>
                <div className="dashboard-info-item">
                  <span className="dashboard-info-label">Last Payment:</span>
                  <span className="dashboard-info-value">
                    {studentStats.feesStatus === "Paid" ? "Cleared" : "Pending"}
                  </span>
                </div>
                <div className="dashboard-info-item">
                  <span className="dashboard-info-label">Next Due:</span>
                  <span className="dashboard-info-value">
                    {studentStats.feesStatus === "Paid" ? "Next Semester" : "Immediate"}
                  </span>
                </div>
              </div>
              <div style={{textAlign: 'center', marginTop: '2rem'}}>
                <Link to="/student-fees" className="dashboard-action-btn" style={{display: 'inline-flex', width: 'auto', padding: '1rem 2rem'}}>
                  <span className="dashboard-action-icon">📋</span>
                  <span>View Detailed Fee Statement</span>
                </Link>
              </div>
            </div>
          )}

          {activeSection === "timetable" && (
            <div>
              <h2 className="dashboard-section-title">🗓️ My Schedule</h2>
              
              {/* Upcoming Exams */}
              <div className="dashboard-info-card">
                <h3 style={{marginBottom: '1rem', color: '#2c3e50'}}>📅 Upcoming Exams</h3>
                <div className="dashboard-schedule-list">
                  {upcomingExams.slice(0, 5).map((exam, index) => (
                    <div key={index} className="dashboard-schedule-item" style={{borderLeftColor: '#e74c3c'}}>
                      <span className="dashboard-schedule-subject">{exam.subject} Exam</span>
                      <span className="dashboard-schedule-time">{exam.date} | {exam.time}</span>
                    </div>
                  ))}
                  {upcomingExams.length === 0 && (
                    <p style={{color: '#7f8c8d', textAlign: 'center'}}>No upcoming exams scheduled</p>
                  )}
                </div>
              </div>

              {/* Weekly Classes */}
              <div className="dashboard-info-card">
                <h3 style={{marginBottom: '1rem', color: '#2c3e50'}}>🏫 Weekly Class Schedule</h3>
                <div className="dashboard-schedule-list">
                  {upcomingClasses.slice(0, 10).map((classItem, index) => (
                    <div key={index} className="dashboard-schedule-item">
                      <span className="dashboard-schedule-subject">{classItem.subject}</span>
                      <span className="dashboard-schedule-time">{classItem.time} | {classItem.day}</span>
                    </div>
                  ))}
                  {upcomingClasses.length === 0 && (
                    <p style={{color: '#7f8c8d', textAlign: 'center'}}>No classes scheduled</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;