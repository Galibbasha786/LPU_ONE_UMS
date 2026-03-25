import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import lpuLogo from "../assets/logo.jpg";

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showNotification, setShowNotification] = useState({ show: false, message: "", type: "" });
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    presentToday: 0,
    pendingFees: 0,
    excellentMarks: 0,
    totalCourses: 0
  });

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== "Admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch students
      const studentsRes = await fetch("http://localhost:5001/api/users/students");
      const studentsData = await studentsRes.json();
      const studentList = studentsData.students || [];
      setStudents(studentList);
      
      // Fetch staff
      const staffRes = await fetch("http://localhost:5001/api/users/staff");
      const staffData = await staffRes.json();
      setStaff(staffData.staff || []);
      
      // Fetch attendance records to calculate present today
      const attendanceRes = await fetch("http://localhost:5001/api/users/attendance");
      const attendanceData = await attendanceRes.json();
      const today = new Date().toISOString().split('T')[0];
      
      let presentCount = 0;
      studentList.forEach(student => {
        const studentAttendance = attendanceData.records?.[student.email]?.attendanceData || {};
        if (studentAttendance[today] === 'Present') {
          presentCount++;
        }
      });
      
      // Update stats
      setStats({
        totalStudents: studentList.length,
        totalStaff: staffData.staff?.length || 0,
        presentToday: presentCount,
        pendingFees: studentList.filter(s => s.fees === "Pending").length,
        excellentMarks: studentList.filter(s => parseInt(s.marks) >= 80).length,
        totalCourses: 12 // Mock data, replace with actual API call
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("Error loading data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollmentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (student, field) => {
    setSelected(student);
    setEditField(field);
    setEditValue(student[field] || "");
  };

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/users/update-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: selected.email, 
          field: editField, 
          value: editValue 
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("✅ Updated successfully!", "success");
        setSelected(null);
        fetchAllData(); // Refresh all data
      } else {
        showToast("❌ Failed to update: " + data.message, "error");
      }
    } catch (err) {
      console.error("Error updating:", err);
      showToast("⚠️ Server error while updating", "error");
    }
  };

  const handleDeleteStudent = async (student) => {
    setDeleteTarget(student);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/users/delete-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: deleteTarget.email }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("✅ Student deleted successfully!", "success");
        fetchAllData();
      } else {
        showToast("❌ Failed to delete: " + data.message, "error");
      }
    } catch (err) {
      console.error("Error deleting:", err);
      showToast("⚠️ Server error while deleting", "error");
    } finally {
      setShowConfirmModal(false);
      setDeleteTarget(null);
    }
  };

  const showToast = (message, type) => {
    setShowNotification({ show: true, message, type });
    setTimeout(() => {
      setShowNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const getAttendanceColor = (attendance) => {
    if (attendance === "Present") return styles.statusSuccess;
    if (attendance === "Absent") return styles.statusDanger;
    return styles.statusWarning;
  };

  const getFeeColor = (feeStatus) => {
    if (feeStatus === "Paid") return styles.statusSuccess;
    if (feeStatus === "Pending") return styles.statusDanger;
    return styles.statusWarning;
  };

  if (!user || user.role !== "Admin") {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Notification Toast */}
      {showNotification.show && (
        <div style={{
          ...styles.toast,
          ...(showNotification.type === "success" ? styles.toastSuccess : styles.toastError)
        }}>
          {showNotification.message}
        </div>
      )}

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={lpuLogo} alt="LPU Logo" style={styles.logo} />
          <div style={styles.headerText}>
            <h1 style={styles.title}>Lovely Professional University</h1>
            <p style={styles.subtitle}>Admin Portal - Complete Management System</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {user.name?.charAt(0) || "A"}
            </div>
            <div style={styles.userDetails}>
              <span style={styles.welcome}>Welcome, {user.name}</span>
              <span style={styles.userRole}>Administrator</span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Sidebar Navigation */}
        <nav style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>📊 Dashboard</h3>
            <button 
              style={activeSection === "overview" ? styles.sidebarBtnActive : styles.sidebarBtn}
              onClick={() => setActiveSection("overview")}
            >
              📈 Overview
            </button>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>👨‍🎓 Student Management</h3>
            <button 
              style={activeSection === "students" ? styles.sidebarBtnActive : styles.sidebarBtn}
              onClick={() => setActiveSection("students")}
            >
              📋 All Students
            </button>
            <button onClick={() => navigate("/create-student")} style={styles.sidebarBtn}>
              ➕ Create Student
            </button>
            <button onClick={() => navigate("/student-bulk-upload")} style={styles.sidebarBtn}>
              📤 Bulk Upload
            </button>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>👨‍🏫 Staff Management</h3>
            <button onClick={() => navigate("/staff-management")} style={styles.sidebarBtn}>
              📋 All Staff
            </button>
            <button onClick={() => navigate("/create-staff")} style={styles.sidebarBtn}>
              ➕ Create Staff
            </button>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>📚 Academic</h3>
            <button onClick={() => navigate("/attendance")} style={styles.sidebarBtn}>
              ✅ Attendance Management
            </button>
            <button onClick={() => navigate("/marks")} style={styles.sidebarBtn}>
              📝 Marks Entry
            </button>
            <button onClick={() => navigate("/courses")} style={styles.sidebarBtn}>
              📖 Course Management
            </button>
            <button onClick={() => navigate("/allot-section")} style={styles.sidebarBtn}>
              🏫 Section Allocation
            </button>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>🗓️ Schedule</h3>
            <button onClick={() => navigate("/class-timetable")} style={styles.sidebarBtn}>
              🏫 Class Timetable
            </button>
            <button onClick={() => navigate("/exam-timetable")} style={styles.sidebarBtn}>
              📅 Exam Schedule
            </button>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>💰 Finance</h3>
            <button onClick={() => navigate("/fees")} style={styles.sidebarBtn}>
              💳 Fee Management
            </button>
            <button onClick={() => navigate("/scholarships")} style={styles.sidebarBtn}>
              🎓 Scholarships
            </button>
            <button onClick={() => navigate("/financial-reports")} style={styles.sidebarBtn}>
              📊 Financial Reports
            </button>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>🎯 Placement</h3>
            <button onClick={() => navigate("/placement")} style={styles.sidebarBtn}>
              💼 Placement Cell
            </button>
            <button onClick={() => navigate("/internships")} style={styles.sidebarBtn}>
              📋 Internships
            </button>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>🔔 Communication</h3>
            <button onClick={() => navigate("/notifications")} style={styles.sidebarBtn}>
              📢 Notifications
            </button>
            <button onClick={() => navigate("/chat")} style={styles.sidebarBtn}>
              💬 Live Chat
            </button>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>📊 Reports</h3>
            <button onClick={() => navigate("/reports")} style={styles.sidebarBtn}>
              📈 Analytics Reports
            </button>
            <button onClick={() => navigate("/export-data")} style={styles.sidebarBtn}>
              📤 Export Data
            </button>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>⚙️ Settings</h3>
            <button onClick={() => navigate("/profile")} style={styles.sidebarBtn}>
              🔧 My Profile
            </button>
          </div>
        </nav>

        {/* Content Area */}
        <main style={styles.content}>
          {loading && (
            <div style={styles.loadingOverlay}>
              <div style={styles.spinner}></div>
              <p>Loading...</p>
            </div>
          )}

          {activeSection === "overview" && !loading && (
            <div style={styles.overview}>
              <h2 style={styles.sectionTitle}>📊 Dashboard Overview</h2>
              
              {/* Statistics Cards */}
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>👨‍🎓</div>
                  <div style={styles.statInfo}>
                    <h3 style={styles.statNumber}>{stats.totalStudents}</h3>
                    <p style={styles.statLabel}>Total Students</p>
                  </div>
                </div>
                
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>👨‍🏫</div>
                  <div style={styles.statInfo}>
                    <h3 style={styles.statNumber}>{stats.totalStaff}</h3>
                    <p style={styles.statLabel}>Total Staff</p>
                  </div>
                </div>
                
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>✅</div>
                  <div style={styles.statInfo}>
                    <h3 style={styles.statNumber}>{stats.presentToday}</h3>
                    <p style={styles.statLabel}>Present Today</p>
                  </div>
                </div>
                
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>💰</div>
                  <div style={styles.statInfo}>
                    <h3 style={styles.statNumber}>{stats.pendingFees}</h3>
                    <p style={styles.statLabel}>Pending Fees</p>
                  </div>
                </div>
                
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>⭐</div>
                  <div style={styles.statInfo}>
                    <h3 style={styles.statNumber}>{stats.excellentMarks}</h3>
                    <p style={styles.statLabel}>Excellent Scores</p>
                  </div>
                </div>
                
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>📚</div>
                  <div style={styles.statInfo}>
                    <h3 style={styles.statNumber}>{stats.totalCourses}</h3>
                    <p style={styles.statLabel}>Active Courses</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={styles.quickActions}>
                <h3 style={styles.sectionTitle}>🚀 Quick Actions</h3>
                <div style={styles.actionGrid}>
                  <button onClick={() => navigate("/create-student")} style={styles.actionBtn}>
                    <span style={styles.actionIcon}>👨‍🎓</span>
                    <span>Create Student</span>
                  </button>
                  <button onClick={() => navigate("/create-staff")} style={styles.actionBtn}>
                    <span style={styles.actionIcon}>👨‍🏫</span>
                    <span>Create Staff</span>
                  </button>
                  <button onClick={() => navigate("/attendance")} style={styles.actionBtn}>
                    <span style={styles.actionIcon}>✅</span>
                    <span>Mark Attendance</span>
                  </button>
                  <button onClick={() => navigate("/marks")} style={styles.actionBtn}>
                    <span style={styles.actionIcon}>📝</span>
                    <span>Enter Marks</span>
                  </button>
                  <button onClick={() => navigate("/notifications")} style={styles.actionBtn}>
                    <span style={styles.actionIcon}>📢</span>
                    <span>Send Notification</span>
                  </button>
                  <button onClick={() => navigate("/fees")} style={styles.actionBtn}>
                    <span style={styles.actionIcon}>💰</span>
                    <span>Manage Fees</span>
                  </button>
                </div>
              </div>

              {/* Recent Activities */}
              <div style={styles.recentActivities}>
                <h3 style={styles.sectionTitle}>📋 Recent Activities</h3>
                <div style={styles.activityList}>
                  <div style={styles.activityItem}>
                    <span style={styles.activityIcon}>✅</span>
                    <div style={styles.activityContent}>
                      <p style={styles.activityText}>New student registration: John Doe</p>
                      <span style={styles.activityTime}>2 minutes ago</span>
                    </div>
                  </div>
                  <div style={styles.activityItem}>
                    <span style={styles.activityIcon}>💰</span>
                    <div style={styles.activityContent}>
                      <p style={styles.activityText}>Fee payment received from Jane Smith</p>
                      <span style={styles.activityTime}>1 hour ago</span>
                    </div>
                  </div>
                  <div style={styles.activityItem}>
                    <span style={styles.activityIcon}>📝</span>
                    <div style={styles.activityContent}>
                      <p style={styles.activityText}>Mid-semester exams schedule published</p>
                      <span style={styles.activityTime}>3 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "students" && !loading && (
            <div style={styles.studentsSection}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>👨‍🎓 Student Management</h2>
                <div style={styles.headerActions}>
                  <div style={styles.searchBox}>
                    <input
                      type="text"
                      placeholder="🔍 Search by name, email, enrollment ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={styles.searchInput}
                    />
                  </div>
                  <button onClick={() => navigate("/create-student")} style={styles.addBtn}>
                    <span>+</span> Add New Student
                  </button>
                </div>
              </div>

              <div style={styles.statsSummary}>
                <div style={styles.summaryItem}>
                  <span>Total Students:</span>
                  <strong>{students.length}</strong>
                </div>
                <div style={styles.summaryItem}>
                  <span>Showing:</span>
                  <strong>{filteredStudents.length}</strong>
                </div>
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Enrollment ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Section</th>
                      <th>Attendance</th>
                      <th>Marks</th>
                      <th>Fees Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={styles.noDataCell}>
                          No students found
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student, index) => (
                        <tr key={student._id || student.id || index} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                          <td style={styles.tableCell}>
                            <span style={styles.enrollmentBadge}>
                              {student.enrollmentId || "N/A"}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.studentName}>
                              <div style={styles.studentAvatar}>
                                {student.name?.charAt(0) || "S"}
                              </div>
                              <span>{student.name}</span>
                            </div>
                          </td>
                          <td style={styles.tableCell}>{student.email}</td>
                          <td style={styles.tableCell}>
                            <span style={styles.sectionBadge}>
                              {student.section || "Not Assigned"}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              ...getAttendanceColor(student.attendance)
                            }}>
                              {student.attendance || "Not Marked"}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.marksBadge}>
                              {student.marks || "N/A"}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusBadge,
                              ...getFeeColor(student.fees)
                            }}>
                              {student.fees || "Pending"}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.actionButtons}>
                              <button 
                                onClick={() => navigate(`/student-profile/${student._id || student.email}`)}
                                style={styles.smallBtn}
                                title="View Profile"
                              >
                                👁️
                              </button>
                              <button 
                                onClick={() => handleEdit(student, "attendance")}
                                style={styles.smallBtn}
                                title="Edit Attendance"
                              >
                                ✅
                              </button>
                              <button 
                                onClick={() => handleEdit(student, "marks")}
                                style={styles.smallBtn}
                                title="Edit Marks"
                              >
                                📝
                              </button>
                              <button 
                                onClick={() => handleEdit(student, "fees")}
                                style={styles.smallBtn}
                                title="Edit Fees"
                              >
                                💰
                              </button>
                              <button 
                                onClick={() => handleEdit(student, "section")}
                                style={styles.smallBtn}
                                title="Edit Section"
                              >
                                🏫
                              </button>
                              <button 
                                onClick={() => handleDeleteStudent(student)}
                                style={{...styles.smallBtn, ...styles.deleteBtn}}
                                title="Delete Student"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Modal */}
      {selected && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>
              Edit {editField.charAt(0).toUpperCase() + editField.slice(1)} for {selected.name}
            </h3>
            {editField === "attendance" || editField === "fees" ? (
              <select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={styles.modalSelect}
              >
                {editField === "attendance" && (
                  <>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </>
                )}
                {editField === "fees" && (
                  <>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </>
                )}
              </select>
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={styles.modalInput}
                placeholder={`Enter ${editField}...`}
              />
            )}
            <div style={styles.modalActions}>
              <button onClick={handleSave} style={styles.modalSaveBtn}>
                💾 Save Changes
              </button>
              <button onClick={() => setSelected(null)} style={styles.modalCancelBtn}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Confirm Delete</h3>
            <p>Are you sure you want to delete {deleteTarget?.name}?</p>
            <p style={{ fontSize: "0.9rem", color: "#e74c3c" }}>This action cannot be undone.</p>
            <div style={styles.modalActions}>
              <button onClick={confirmDelete} style={styles.modalSaveBtn}>
                Yes, Delete
              </button>
              <button onClick={() => setShowConfirmModal(false)} style={styles.modalCancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "rgba(240, 125, 1, 1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  toast: {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "1rem 1.5rem",
    borderRadius: "8px",
    zIndex: 2000,
    animation: "slideIn 0.3s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  toastSuccess: {
    background: "#27ae60",
    color: "white",
  },
  toastError: {
    background: "#e74c3c",
    color: "white",
  },
  header: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    borderBottom: "3px solid #f58003ff",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  logo: {
    width: "60px",
    height: "60px",
    borderRadius: "10px",
    objectFit: "cover",
  },
  headerText: {
    color: "#2c3e50",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  subtitle: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#7f8c8d",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  userAvatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "#f58003",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
  },
  welcome: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#2c3e50",
  },
  userRole: {
    fontSize: "0.8rem",
    color: "#7f8c8d",
  },
  logoutBtn: {
    background: "#e74c3c",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  mainContent: {
    display: "flex",
    minHeight: "calc(100vh - 100px)",
  },
  sidebar: {
    width: "300px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "1.5rem",
    borderRight: "1px solid #e1e8ed",
    overflowY: "auto",
    maxHeight: "calc(100vh - 100px)",
  },
  sidebarSection: {
    marginBottom: "1.5rem",
  },
  sidebarTitle: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#7f8c8d",
    marginBottom: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  sidebarBtn: {
    width: "100%",
    background: "transparent",
    border: "none",
    padding: "0.7rem 1rem",
    textAlign: "left",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "0.3rem",
    fontSize: "0.9rem",
    color: "#2c3e50",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  sidebarBtnActive: {
    width: "100%",
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "0.7rem 1rem",
    textAlign: "left",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "0.3rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  content: {
    flex: 1,
    padding: "2rem",
    background: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(10px)",
    overflowY: "auto",
    position: "relative",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255, 255, 255, 0.9)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #f58003",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "1.5rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  statCard: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    border: "1px solid #e1e8ed",
    transition: "transform 0.3s ease",
  },
  statIcon: {
    fontSize: "2.5rem",
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: "bold",
    margin: 0,
    color: "#2c3e50",
  },
  statLabel: {
    margin: 0,
    color: "#7f8c8d",
    fontSize: "0.9rem",
  },
  quickActions: {
    marginBottom: "2rem",
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
  },
  actionBtn: {
    background: "white",
    border: "2px solid #e1e8ed",
    padding: "1.2rem",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#2c3e50",
  },
  actionIcon: {
    fontSize: "1.8rem",
  },
  recentActivities: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.8rem",
    borderBottom: "1px solid #e1e8ed",
  },
  activityIcon: {
    fontSize: "1.5rem",
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    margin: 0,
    fontSize: "0.95rem",
    color: "#2c3e50",
  },
  activityTime: {
    fontSize: "0.8rem",
    color: "#7f8c8d",
  },
  studentsSection: {
    width: "100%",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  headerActions: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  searchBox: {
    position: "relative",
  },
  searchInput: {
    padding: "0.7rem 1rem",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    fontSize: "0.9rem",
    width: "280px",
    outline: "none",
    transition: "all 0.3s ease",
  },
  addBtn: {
    background: "#27ae60",
    color: "white",
    border: "none",
    padding: "0.7rem 1.2rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  statsSummary: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
    padding: "0.8rem",
    background: "#f8f9fa",
    borderRadius: "8px",
  },
  summaryItem: {
    display: "flex",
    gap: "0.5rem",
    fontSize: "0.9rem",
  },
  tableContainer: {
    background: "white",
    borderRadius: "12px",
    overflow: "auto",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },
  tableRowEven: {
    background: "#f8f9fa",
  },
  tableRowOdd: {
    background: "white",
  },
  tableCell: {
    padding: "1rem",
    textAlign: "left",
    borderBottom: "1px solid #e1e8ed",
  },
  noDataCell: {
    padding: "2rem",
    textAlign: "center",
    color: "#7f8c8d",
  },
  studentName: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  studentAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#3498db",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
    fontWeight: "bold",
  },
  enrollmentBadge: {
    background: "#e3f2fd",
    color: "#1976d2",
    padding: "0.3rem 0.6rem",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "600",
    fontFamily: "monospace",
  },
  sectionBadge: {
    background: "#e3f2fd",
    color: "#1976d2",
    padding: "0.3rem 0.8rem",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  statusBadge: {
    padding: "0.3rem 0.8rem",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: "600",
    display: "inline-block",
  },
  statusSuccess: {
    background: "#e8f5e8",
    color: "#2e7d32",
  },
  statusWarning: {
    background: "#fff3e0",
    color: "#f57c00",
  },
  statusDanger: {
    background: "#ffebee",
    color: "#c62828",
  },
  marksBadge: {
    background: "#f3e5f5",
    color: "#7b1fa2",
    padding: "0.3rem 0.8rem",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  actionButtons: {
    display: "flex",
    gap: "0.3rem",
    flexWrap: "wrap",
  },
  smallBtn: {
    background: "transparent",
    border: "none",
    padding: "0.4rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "all 0.3s ease",
  },
  deleteBtn: {
    color: "#e74c3c",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(5px)",
  },
  modalContent: {
    background: "white",
    padding: "2rem",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
  },
  modalTitle: {
    fontSize: "1.3rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    color: "#2c3e50",
  },
  modalInput: {
    width: "100%",
    padding: "0.8rem",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    fontSize: "1rem",
    marginBottom: "1.5rem",
    outline: "none",
  },
  modalSelect: {
    width: "100%",
    padding: "0.8rem",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    fontSize: "1rem",
    marginBottom: "1.5rem",
    outline: "none",
    background: "white",
  },
  modalActions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
  },
  modalSaveBtn: {
    background: "#27ae60",
    color: "white",
    border: "none",
    padding: "0.8rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  modalCancelBtn: {
    background: "#e74c3c",
    color: "white",
    border: "none",
    padding: "0.8rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  .stat-card:hover {
    transform: translateY(-5px);
  }
`;
document.head.appendChild(styleSheet);

export default AdminDashboard;