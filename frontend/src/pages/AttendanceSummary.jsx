import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AttendanceSummary() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "staff") {
    return (
      <div style={styles.accessDenied}>
        <h2>⛔ Access Denied</h2>
        <p>Only teachers can view attendance summary.</p>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          ← Go Back
        </button>
      </div>
    );
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const studentsRes = await fetch("http://localhost:5001/api/users/students");
      const studentsData = await studentsRes.json();
      const attendanceRes = await fetch("http://localhost:5001/api/users/attendance");
      const attendanceData = await attendanceRes.json();
      
      // Filter students by teacher's sections
      const teacherSections = user.coursesTeaching?.map(c => c.section) || [];
      const filteredStudents = (studentsData.students || []).filter(s => teacherSections.includes(s.section));
      
      setStudents(filteredStudents);
      setAttendanceData(attendanceData.records || {});
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (studentEmail) => {
    const records = attendanceData[studentEmail]?.attendanceData || {};
    const total = Object.keys(records).length;
    const present = Object.values(records).filter(s => s === 'Present').length;
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return "#10b981";
    if (percentage >= 75) return "#f59e0b";
    return "#ef4444";
  };

  const getStatusText = (percentage) => {
    if (percentage >= 90) return "Excellent";
    if (percentage >= 75) return "Good";
    if (percentage >= 50) return "At Risk";
    return "Critical";
  };

  const averageAttendance = students.length > 0 
    ? Math.round(students.reduce((sum, s) => sum + calculatePercentage(s.email), 0) / students.length)
    : 0;

  const below75 = students.filter(s => calculatePercentage(s.email) < 75).length;
  const above90 = students.filter(s => calculatePercentage(s.email) >= 90).length;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate("/teacher-dashboard")} style={styles.backBtn}>
              ← Back to Dashboard
            </button>
            <h1 style={styles.title}>📊 Attendance Summary</h1>
            <p style={styles.subtitle}>View overall attendance statistics for your students</p>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading attendance data...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>👥</div>
                <div style={styles.statInfo}>
                  <div style={styles.statNumber}>{students.length}</div>
                  <div style={styles.statLabel}>Total Students</div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>📊</div>
                <div style={styles.statInfo}>
                  <div style={styles.statNumber}>{averageAttendance}%</div>
                  <div style={styles.statLabel}>Average Attendance</div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>⚠️</div>
                <div style={styles.statInfo}>
                  <div style={styles.statNumber}>{below75}</div>
                  <div style={styles.statLabel}>Below 75%</div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>⭐</div>
                <div style={styles.statInfo}>
                  <div style={styles.statNumber}>{above90}</div>
                  <div style={styles.statLabel}>Above 90%</div>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div style={styles.tableCard}>
              <h3>Student-wise Attendance</h3>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th>Student Name</th>
                      <th>Enrollment ID</th>
                      <th>Section</th>
                      <th>Attendance %</th>
                      <th>Status</th>
                     </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const percentage = calculatePercentage(student.email);
                      return (
                        <tr key={student._id} style={styles.tableRow}>
                          <td>{student.name}</td>
                          <td>{student.enrollmentId || "N/A"}</td>
                          <td>{student.section || "N/A"}</td>
                          <td>
                            <div style={styles.percentageContainer}>
                              <div style={{...styles.percentageBar, width: `${percentage}%`, backgroundColor: getStatusColor(percentage)}}></div>
                              <span style={styles.percentageText}>{percentage}%</span>
                            </div>
                          </td>
                          <td>
                            <span style={{...styles.statusBadge, backgroundColor: getStatusColor(percentage)}}>
                              {getStatusText(percentage)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "20px 30px",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  backBtn: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    marginBottom: "10px",
  },
  title: {
    margin: "0 0 5px 0",
    fontSize: "2rem",
    fontWeight: "700",
    color: "#2d3748",
  },
  subtitle: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#718096",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px",
    background: "rgba(255,255,255,0.95)",
    borderRadius: "16px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #f58003",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  statIcon: {
    fontSize: "2rem",
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#2d3748",
  },
  statLabel: {
    fontSize: "0.8rem",
    color: "#718096",
  },
  tableCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  tableContainer: {
    overflowX: "auto",
    marginTop: "15px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    background: "#f8f9fa",
    borderBottom: "2px solid #e2e8f0",
  },
  tableRow: {
    borderBottom: "1px solid #e2e8f0",
  },
  percentageContainer: {
    position: "relative",
    width: "120px",
    height: "30px",
    background: "#e2e8f0",
    borderRadius: "15px",
    overflow: "hidden",
  },
  percentageBar: {
    height: "100%",
    borderRadius: "15px",
    transition: "width 0.3s ease",
  },
  percentageText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "0.7rem",
    fontWeight: "bold",
    color: "#2d3748",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    color: "white",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  accessDenied: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    textAlign: "center",
  },
};

export default AttendanceSummary;