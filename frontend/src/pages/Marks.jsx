import React, { useEffect, useState } from "react";

function Marks() {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || user.role !== "Admin") {
    return (
      <div style={styles.accessDenied}>
        <div style={styles.deniedContent}>
          <div style={styles.deniedIcon}>🔒</div>
          <h3>Access Denied</h3>
          <p>Admin privileges required to access marks management</p>
        </div>
      </div>
    );
  }

  // ✅ Fetch students from backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/users/students");
        const data = await res.json();
        setStudents(data.students || []);
      } catch (err) {
        console.error("Error fetching students:", err);
        setMessage("⚠️ Failed to load students. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // ✅ Update marks for student
  const handleUpdateMarks = async (email, studentName) => {
    const value = marks[email]?.trim();
    if (!value) {
      setMessage("❌ Please enter marks before submitting!");
      return;
    }

    setUpdatingId(email);
    try {
      const res = await fetch("http://localhost:5001/api/users/update-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, field: "marks", value }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage(`✅ Marks updated for ${studentName}`);
        setStudents((prev) =>
          prev.map((s) =>
            s.email === email ? { ...s, marks: value } : s
          )
        );
        setMarks({ ...marks, [email]: "" }); // Clear input
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ Failed to update marks for ${studentName}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error while updating marks.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Get grade color based on marks
  const getGradeColor = (marks) => {
    if (!marks) return "#718096";
    const numericMarks = parseInt(marks);
    if (numericMarks >= 90) return "#10b981";
    if (numericMarks >= 75) return "#f59e0b";
    if (numericMarks >= 50) return "#3b82f6";
    return "#ef4444";
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading students data...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>📊 Marks Management</h1>
            <p style={styles.subtitle}>Update and manage student marks and grades</p>
          </div>
          <div style={styles.adminBadge}>
            <span style={styles.adminIcon}>👨‍🏫</span>
            <span>Academic Admin</span>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {/* Status Message */}
        {message && (
          <div style={styles.messageContainer}>
            <div style={styles.message}>
              <span style={styles.messageIcon}>
                {message.includes("✅") ? "✅" : message.includes("❌") ? "❌" : "⚠️"}
              </span>
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>{students.length}</div>
              <div style={styles.statLabel}>Total Students</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📝</div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>
                {students.filter(s => s.marks && s.marks !== "Not Assigned").length}
              </div>
              <div style={styles.statLabel}>Marks Entered</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎯</div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>
                {students.filter(s => s.marks && parseInt(s.marks) >= 75).length}
              </div>
              <div style={styles.statLabel}>Above 75%</div>
            </div>
          </div>
        </div>

        {/* Marks Table */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>Student Marks Dashboard</h3>
            <div style={styles.tableSubtitle}>
              {students.filter(s => s.marks && s.marks !== "Not Assigned").length} of {students.length} students have marks
            </div>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>Student Information</th>
                  <th style={styles.th}>Section</th>
                  <th style={styles.th}>Current Marks</th>
                  <th style={styles.th}>Update Marks</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={styles.noData}>
                      <div style={styles.noDataIcon}>📊</div>
                      <p>No students found</p>
                      <p style={styles.noDataSub}>Students will appear here once registered</p>
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr key={index} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div style={styles.studentInfo}>
                          <div style={styles.studentAvatar}>
                            {student.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={styles.studentName}>{student.name}</div>
                            <div style={styles.studentEmail}>{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.sectionBadge}>
                          {student.section || "Not Assigned"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{
                          ...styles.marksBadge,
                          backgroundColor: getGradeColor(student.marks),
                          color: student.marks && parseInt(student.marks) >= 75 ? "white" : "white"
                        }}>
                          {student.marks || "Not Assigned"}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter marks (0-100)"
                          value={marks[student.email] || ""}
                          onChange={(e) =>
                            setMarks({ ...marks, [student.email]: e.target.value })
                          }
                          style={styles.input}
                          disabled={updatingId === student.email}
                        />
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleUpdateMarks(student.email, student.name)}
                          style={updatingId === student.email ? styles.saveBtnLoading : styles.saveBtn}
                          disabled={updatingId === student.email || !marks[student.email]?.trim()}
                        >
                          {updatingId === student.email ? (
                            <>
                              <div style={styles.smallSpinner}></div>
                              Saving...
                            </>
                          ) : (
                            "💾 Save"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Text */}
        <div style={styles.helpCard}>
          <div style={styles.helpIcon}>💡</div>
          <div style={styles.helpContent}>
            <h4>Marks Entry Guidelines</h4>
            <ul style={styles.helpList}>
              <li>Enter marks between 0 and 100</li>
              <li>Marks will be saved immediately upon clicking Save</li>
              <li>Color coding: <span style={{color: '#10b981'}}>Green (90+)</span>, <span style={{color: '#f59e0b'}}>Yellow (75-89)</span>, <span style={{color: '#3b82f6'}}>Blue (50-74)</span>, <span style={{color: '#ef4444'}}>Red (Below 50)</span></li>
              <li>You can update marks multiple times as needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #ff6d00 0%, #e65100 100%)",
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  accessDenied: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #ff6d00 0%, #e65100 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deniedContent: {
    textAlign: "center",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  deniedIcon: {
    fontSize: "3rem",
    marginBottom: "20px",
  },
  loadingContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #ff6d00 0%, #e65100 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid rgba(255, 255, 255, 0.3)",
    borderTop: "4px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  header: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "20px 0",
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  titleSection: {
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: "2.5rem",
    fontWeight: "700",
    margin: "0 0 8px 0",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "1.1rem",
    margin: 0,
    fontWeight: "400",
  },
  adminBadge: {
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    padding: "12px 20px",
    borderRadius: "25px",
    fontSize: "0.9rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backdropFilter: "blur(10px)",
  },
  adminIcon: {
    fontSize: "1.2rem",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  messageContainer: {
    marginBottom: "20px",
  },
  message: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "15px 25px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontWeight: "500",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },
  messageIcon: {
    fontSize: "1.2rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease",
  },
  statIcon: {
    fontSize: "2rem",
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#718096",
    fontWeight: "500",
  },
  tableCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  tableHeader: {
    marginBottom: "25px",
  },
  tableTitle: {
    margin: "0 0 8px 0",
    color: "#2d3748",
    fontSize: "1.5rem",
    fontWeight: "600",
  },
  tableSubtitle: {
    color: "#718096",
    fontSize: "0.95rem",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeadRow: {
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
  },
  th: {
    padding: "20px",
    textAlign: "left",
    color: "white",
    fontWeight: "600",
    fontSize: "1rem",
    borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
  },
  tableRow: {
    borderBottom: "1px solid #e2e8f0",
    transition: "background-color 0.3s ease",
  },
  tableRowHover: {
    backgroundColor: "#f7fafc",
  },
  td: {
    padding: "20px",
    verticalAlign: "middle",
  },
  studentInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  studentAvatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ff6d00, #e65100)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
  studentName: {
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "3px",
  },
  studentEmail: {
    color: "#718096",
    fontSize: "0.85rem",
  },
  sectionBadge: {
    background: "#e2e8f0",
    color: "#4a5568",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "500",
    fontSize: "0.85rem",
    display: "inline-block",
  },
  marksBadge: {
    padding: "8px 16px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "0.9rem",
    display: "inline-block",
    minWidth: "80px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  input: {
    padding: "12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
    width: "100%",
    maxWidth: "150px",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
  },
  inputFocus: {
    borderColor: "#ff6d00",
    boxShadow: "0 0 0 3px rgba(255, 109, 0, 0.1)",
    outline: "none",
  },
  saveBtn: {
    background: "linear-gradient(135deg, #ff6d00, #e65100)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: "100px",
    justifyContent: "center",
  },
  saveBtnHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 15px rgba(255, 109, 0, 0.3)",
  },
  saveBtnLoading: {
    background: "#a0aec0",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "not-allowed",
    fontWeight: "600",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: "100px",
    justifyContent: "center",
  },
  smallSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  noData: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#718096",
  },
  noDataIcon: {
    fontSize: "3rem",
    marginBottom: "15px",
    opacity: 0.5,
  },
  noDataSub: {
    fontSize: "0.9rem",
    marginTop: "8px",
    opacity: 0.7,
  },
  helpCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "25px",
    display: "flex",
    alignItems: "flex-start",
    gap: "20px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },
  helpIcon: {
    fontSize: "2rem",
    background: "linear-gradient(135deg, #ff6d00, #e65100)",
    padding: "10px",
    borderRadius: "10px",
    color: "white",
  },
  helpContent: {
    flex: 1,
  },
  helpList: {
    margin: "15px 0 0 0",
    paddingLeft: "20px",
    color: "#4a5568",
    lineHeight: "1.6",
  },
};

// Add hover effects
Object.assign(styles.statCard, {
  ':hover': {
    transform: "translateY(-5px)",
  },
});

Object.assign(styles.tableRow, {
  ':hover': {
    backgroundColor: "#f7fafc",
  },
});

Object.assign(styles.saveBtn, {
  ':hover': {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 15px rgba(255, 109, 0, 0.3)",
  },
});

Object.assign(styles.input, {
  ':focus': {
    borderColor: "#ff6d00",
    boxShadow: "0 0 0 3px rgba(255, 109, 0, 0.1)",
    outline: "none",
  },
});

// Add keyframes for spinner
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default Marks;