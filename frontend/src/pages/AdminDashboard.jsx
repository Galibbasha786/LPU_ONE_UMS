import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import lpuBackground from "../assets/background.jpeg"; // Add LPU background
import lpuLogo from "../assets/logo.jpg"; // LPU logo

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== "Admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch student list
  useEffect(() => {
    fetch("http://localhost:5001/api/users/students")
      .then((res) => res.json())
      .then((data) => setStudents(data.students || []))
      .catch(() => console.log("Error fetching students"));
  }, []);

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (student, field) => {
    setSelected(student);
    setEditField(field);
    setEditValue(student[field]);
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
        alert("✅ Updated successfully!");
        setSelected(null);
        // Refresh students list
        const updatedRes = await fetch("http://localhost:5001/api/users/students");
        const updatedData = await updatedRes.json();
        setStudents(updatedData.students || []);
      } else {
        alert("❌ Failed to update: " + data.message);
      }
    } catch (err) {
      console.error("Error updating:", err);
      alert("⚠️ Server error while updating");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user || user.role !== "Admin") {
    return null;
  }

  // Stats for dashboard
  const stats = {
    totalStudents: students.length,
    presentToday: students.filter(s => s.attendance === "Present").length,
    pendingFees: students.filter(s => s.fees === "Pending").length,
    excellentMarks: students.filter(s => parseInt(s.marks) >= 80).length
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={lpuLogo} alt="LPU Logo" style={styles.logo} />
          <div style={styles.headerText}>
            <h1 style={styles.title}>Lovely Professional University</h1>
            <p style={styles.subtitle}>Admin Portal</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <span style={styles.welcome}>Welcome, {user.name}</span>
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
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>📚 Academic</h3>
            <button onClick={() => navigate("/attendance")} style={styles.sidebarBtn}>
              ✅ Attendance
            </button>
            <button onClick={() => navigate("/marks")} style={styles.sidebarBtn}>
              📝 Marks
            </button>
            <button onClick={() => navigate("/allot-section")} style={styles.sidebarBtn}>
              🏫 Sections
            </button>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>🗓️ Schedule</h3>
            <button onClick={() => navigate("/class-timetable")} style={styles.sidebarBtn}>
              🏫 Classes
            </button>
            <button onClick={() => navigate("/exam-timetable")} style={styles.sidebarBtn}>
              📅 Exams
            </button>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>💰 Finance</h3>
            <button onClick={() => navigate("/fees")} style={styles.sidebarBtn}>
              💳 Fee Management
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
            <h3 style={styles.sidebarTitle}>👤 Profile</h3>
            <button onClick={() => navigate("/profile")} style={styles.sidebarBtn}>
              🔧 My Profile
            </button>
          </div>
        </nav>

        {/* Content Area */}
        <main style={styles.content}>
          {activeSection === "overview" && (
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
              </div>

              {/* Quick Actions */}
              <div style={styles.quickActions}>
                <h3 style={styles.sectionTitle}>🚀 Quick Actions</h3>
                <div style={styles.actionGrid}>
                  <button onClick={() => navigate("/create-student")} style={styles.actionBtn}>
                    <span style={styles.actionIcon}>👨‍🎓</span>
                    <span>Create Student</span>
                  </button>
                  <button onClick={() => navigate("/attendance")} style={styles.actionBtn}>
                    <span style={styles.actionIcon}>✅</span>
                    <span>Mark Attendance</span>
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
            </div>
          )}

          {activeSection === "students" && (
            <div style={styles.studentsSection}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>👨‍🎓 Student Management</h2>
                <div style={styles.searchBox}>
                  <input
                    type="text"
                    placeholder="🔍 Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
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
                    {filteredStudents.map((student, index) => (
                      <tr key={index} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                        <td style={styles.tableCell}>{student.name}</td>
                        <td style={styles.tableCell}>{student.email}</td>
                        <td style={styles.tableCell}>
                          <span style={styles.sectionBadge}>
                            {student.section || "Not Assigned"}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={{
                            ...styles.statusBadge,
                            ...(student.attendance === "Present" ? styles.statusSuccess : 
                                 student.attendance === "Absent" ? styles.statusDanger : 
                                 styles.statusWarning)
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
                            ...(student.fees === "Paid" ? styles.statusSuccess : 
                                 student.fees === "Pending" ? styles.statusDanger : 
                                 styles.statusWarning)
                          }}>
                            {student.fees}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.actionButtons}>
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
                          </div>
                        </td>
                      </tr>
                    ))}
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
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              style={styles.modalInput}
              placeholder={`Enter ${editField}...`}
            />
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
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    //background: "linear-gradient(90deg, #f27305ff 0%, #f57c02ff 100%)",
    background:"rgba(240, 125, 1, 1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
    fontSize: "0.9rem",
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
  welcome: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#2c3e50",
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
    width: "280px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "1.5rem",
    borderRight: "1px solid #e1e8ed",
    overflowY: "auto",
  },
  sidebarSection: {
    marginBottom: "2rem",
  },
  sidebarTitle: {
    fontSize: "0.9rem",
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
    padding: "0.8rem 1rem",
    textAlign: "left",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "0.3rem",
    fontSize: "0.95rem",
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
    padding: "0.8rem 1rem",
    textAlign: "left",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "0.3rem",
    fontSize: "0.95rem",
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
  },
  sectionTitle: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "1.5rem",
  },
  // Stats Grid
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
  },
  statIcon: {
    fontSize: "2rem",
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
  // Quick Actions
  quickActions: {
    marginBottom: "2rem",
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  actionBtn: {
    background: "white",
    border: "2px solid #e1e8ed",
    padding: "1.5rem",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#2c3e50",
  },
  actionIcon: {
    fontSize: "2rem",
  },
  // Students Section
  studentsSection: {
    
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  searchBox: {
    position: "relative",
  },
  searchInput: {
    padding: "0.8rem 1rem 0.8rem 2.5rem",
    border: "2px solid #e1e8ed",
    borderRadius: "25px",
    fontSize: "1rem",
    width: "300px",
    outline: "none",
    transition: "all 0.3s ease",
  },
  tableContainer: {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
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
  // Modal
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
    transition: "all 0.3s ease",
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

// Add hover effects
Object.assign(styles.logoutBtn, {
  ':hover': {
    background: "#c0392b",
    transform: "translateY(-2px)",
  }
});

Object.assign(styles.sidebarBtn, {
  ':hover': {
    background: "#ecf0f1",
    transform: "translateX(5px)",
  }
});

Object.assign(styles.actionBtn, {
  ':hover': {
    borderColor: "#3498db",
    transform: "translateY(-3px)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
  }
});

Object.assign(styles.smallBtn, {
  ':hover': {
    background: "#ecf0f1",
    transform: "scale(1.1)",
  }
});

Object.assign(styles.modalSaveBtn, {
  ':hover': {
    background: "#219a52",
    transform: "translateY(-2px)",
  }
});

Object.assign(styles.modalCancelBtn, {
  ':hover': {
    background: "#c0392b",
    transform: "translateY(-2px)",
  }
});

export default AdminDashboard;