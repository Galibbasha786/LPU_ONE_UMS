import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import lpuLogo from "../assets/logo.jpg";

function StudentMarks() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [marksData, setMarksData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState("current");
  const [allReports, setAllReports] = useState([]);

  // Role guard
  if (!user || user.role !== "Student") {
    return (
      <div style={styles.accessDenied}>
        <h2>⛔ Access Denied</h2>
        <p>Only students can view marks.</p>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          ← Go Back to Login
        </button>
      </div>
    );
  }

  useEffect(() => {
    fetchMarksData();
    fetchReportCards();
  }, []);

  const fetchMarksData = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/users/student/${user.email}`);
      const data = await res.json();
      if (data.success) {
        setMarksData(data.student);
      }
    } catch (err) {
      console.error("Error fetching marks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportCards = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/users/reportcards/${user.email}`);
      const data = await res.json();
      if (data.success) {
        setAllReports(data.reports || []);
      }
    } catch (err) {
      console.error("Error fetching report cards:", err);
    }
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: "A+", gradePoint: 10, color: "#10b981" };
    if (percentage >= 80) return { grade: "A", gradePoint: 9, color: "#10b981" };
    if (percentage >= 70) return { grade: "B+", gradePoint: 8, color: "#f59e0b" };
    if (percentage >= 60) return { grade: "B", gradePoint: 7, color: "#f59e0b" };
    if (percentage >= 50) return { grade: "C", gradePoint: 6, color: "#ef4444" };
    if (percentage >= 40) return { grade: "D", gradePoint: 5, color: "#ef4444" };
    return { grade: "F", gradePoint: 0, color: "#ef4444" };
  };

  const getPerformanceStatus = (marks) => {
    const marksNum = parseInt(marks) || 0;
    if (marksNum >= 80) return "Excellent";
    if (marksNum >= 60) return "Good";
    if (marksNum >= 40) return "Average";
    return "Needs Improvement";
  };

  const getPerformanceColor = (marks) => {
    const marksNum = parseInt(marks) || 0;
    if (marksNum >= 80) return "#10b981";
    if (marksNum >= 60) return "#f59e0b";
    if (marksNum >= 40) return "#f97316";
    return "#ef4444";
  };

  // Sample subjects data - in real app, this would come from backend
  const subjects = [
    { name: "Programming Fundamentals", code: "CS101", marks: 85, maxMarks: 100, credits: 4 },
    { name: "Data Structures", code: "CS202", marks: 78, maxMarks: 100, credits: 4 },
    { name: "Database Management", code: "CS303", marks: 92, maxMarks: 100, credits: 3 },
    { name: "Operating Systems", code: "CS404", marks: 68, maxMarks: 100, credits: 3 },
    { name: "Computer Networks", code: "CS505", marks: 72, maxMarks: 100, credits: 3 },
    { name: "Software Engineering", code: "CS606", marks: 88, maxMarks: 100, credits: 3 }
  ];

  const calculateSGPA = (subjectsList) => {
    let totalCredits = 0;
    let totalGradePoints = 0;
    subjectsList.forEach(sub => {
      const percentage = (sub.marks / sub.maxMarks) * 100;
      const gradeInfo = getGrade(percentage);
      totalCredits += sub.credits;
      totalGradePoints += gradeInfo.gradePoint * sub.credits;
    });
    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : "0.00";
  };

  const sgpa = calculateSGPA(subjects);
  const cgpa = marksData?.cgpa || sgpa;
  const currentMarks = marksData?.marks || "0";

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={lpuLogo} alt="LPU Logo" style={styles.logo} />
          <div style={styles.headerText}>
            <h1 style={styles.title}>Lovely Professional University</h1>
            <p style={styles.subtitle}>Student Marks & Grade Card</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userDetails}>
              <span style={styles.welcome}>{user.name}</span>
              <span style={styles.userRole}>Student</span>
            </div>
            <button onClick={() => navigate("/student-dashboard")} style={styles.backBtn}>
              ← Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.content}>
          <h2 style={styles.sectionTitle}>📊 My Academic Performance</h2>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading marks data...</p>
            </div>
          ) : (
            <>
              {/* Quick Stats Cards */}
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>📝</div>
                  <div style={styles.statInfo}>
                    <h3 style={styles.statNumber}>{currentMarks}</h3>
                    <p style={styles.statLabel}>Overall Marks</p>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>🎓</div>
                  <div style={styles.statInfo}>
                    <h3 style={styles.statNumber}>{cgpa}</h3>
                    <p style={styles.statLabel}>CGPA</p>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>📊</div>
                  <div style={styles.statInfo}>
                    <h3 style={styles.statNumber}>{sgpa}</h3>
                    <p style={styles.statLabel}>Current SGPA</p>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>⭐</div>
                  <div style={styles.statInfo}>
                    <h3 style={{
                      ...styles.statNumber,
                      color: getPerformanceColor(currentMarks)
                    }}>
                      {getPerformanceStatus(currentMarks)}
                    </h3>
                    <p style={styles.statLabel}>Performance</p>
                  </div>
                </div>
              </div>

              {/* Student Info Card */}
              <div style={styles.infoCard}>
                <div style={styles.studentInfoHeader}>
                  <div style={styles.studentAvatarLarge}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.studentInfoDetails}>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                    <div style={styles.studentMeta}>
                      <span>Enrollment: {marksData?.enrollmentId || user.email?.split('@')[0] || "N/A"}</span>
                      <span>Section: {marksData?.section || user.section || "Not Assigned"}</span>
                      <span>Semester: {marksData?.semester || "Current"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grade Card Section */}
              <div style={styles.gradeCard}>
                <div style={styles.gradeCardHeader}>
                  <h3>🎓 Grade Card - Semester {marksData?.semester || "Current"}</h3>
                  <div style={styles.semesterSelector}>
                    <button 
                      onClick={() => setSelectedSemester("current")}
                      style={{
                        ...styles.semesterBtn,
                        ...(selectedSemester === "current" ? styles.semesterBtnActive : {})
                      }}
                    >
                      Current Semester
                    </button>
                    <button 
                      onClick={() => setSelectedSemester("previous")}
                      style={{
                        ...styles.semesterBtn,
                        ...(selectedSemester === "previous" ? styles.semesterBtnActive : {})
                      }}
                    >
                      Previous Semesters
                    </button>
                  </div>
                </div>

                {selectedSemester === "current" ? (
                  <div>
                    <div style={styles.tableContainer}>
                      <table style={styles.table}>
                        <thead>
                          <tr style={styles.tableHeader}>
                            <th style={styles.th}>Course Code</th>
                            <th style={styles.th}>Course Name</th>
                            <th style={styles.th}>Credits</th>
                            <th style={styles.th}>Marks Obtained</th>
                            <th style={styles.th}>Max Marks</th>
                            <th style={styles.th}>Percentage</th>
                            <th style={styles.th}>Grade</th>
                            <th style={styles.th}>Grade Point</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjects.map((subject, index) => {
                            const percentage = (subject.marks / subject.maxMarks) * 100;
                            const gradeInfo = getGrade(percentage);
                            return (
                              <tr key={index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                                <td style={styles.td}>{subject.code}</td>
                                <td style={styles.td}>{subject.name}</td>
                                <td style={styles.td}>{subject.credits}</td>
                                <td style={styles.td}>{subject.marks}</td>
                                <td style={styles.td}>{subject.maxMarks}</td>
                                <td style={styles.td}>
                                  <span style={{
                                    ...styles.percentageBadge,
                                    backgroundColor: gradeInfo.color + "20",
                                    color: gradeInfo.color
                                  }}>
                                    {percentage.toFixed(1)}%
                                  </span>
                                </td>
                                <td style={styles.td}>
                                  <span style={{
                                    ...styles.gradeBadge,
                                    backgroundColor: gradeInfo.color,
                                  }}>
                                    {gradeInfo.grade}
                                  </span>
                                </td>
                                <td style={styles.td}>{gradeInfo.gradePoint}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr style={styles.tableFooter}>
                            <td colSpan="2" style={styles.tdFooter}><strong>Total</strong></td>
                            <td style={styles.tdFooter}><strong>20</strong></td>
                            <td colSpan="2" style={styles.tdFooter}></td>
                            <td style={styles.tdFooter}></td>
                            <td style={styles.tdFooter}><strong>SGPA</strong></td>
                            <td style={styles.tdFooter}><strong>{sgpa}</strong></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div style={styles.resultSummary}>
                      <div style={styles.summaryCard}>
                        <div style={styles.summaryIcon}>🎯</div>
                        <div>
                          <div style={styles.summaryLabel}>Result Status</div>
                          <div style={styles.summaryValue}>
                            <span className="status-success">PASS</span>
                          </div>
                        </div>
                      </div>
                      <div style={styles.summaryCard}>
                        <div style={styles.summaryIcon}>📊</div>
                        <div>
                          <div style={styles.summaryLabel}>SGPA</div>
                          <div style={styles.summaryValue}>{sgpa}</div>
                        </div>
                      </div>
                      <div style={styles.summaryCard}>
                        <div style={styles.summaryIcon}>🎓</div>
                        <div>
                          <div style={styles.summaryLabel}>CGPA</div>
                          <div style={styles.summaryValue}>{cgpa}</div>
                        </div>
                      </div>
                      <div style={styles.summaryCard}>
                        <div style={styles.summaryIcon}>⭐</div>
                        <div>
                          <div style={styles.summaryLabel}>Performance</div>
                          <div style={{
                            ...styles.summaryValue,
                            color: getPerformanceColor(currentMarks)
                          }}>
                            {getPerformanceStatus(currentMarks)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={styles.previousSemesters}>
                    {allReports.length > 0 ? (
                      allReports.map((report, index) => (
                        <div key={index} style={styles.semesterCard}>
                          <div style={styles.semesterCardHeader}>
                            <h4>Semester {report.semester || index + 1}</h4>
                            <span style={styles.semesterCgpa}>CGPA: {report.cgpa || "N/A"}</span>
                          </div>
                          <div style={styles.semesterSubjects}>
                            {report.subjects && report.subjects.map((subject, idx) => (
                              <div key={idx} style={styles.semesterSubject}>
                                <span>{subject.name}</span>
                                <span>{subject.marks}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={styles.noData}>No previous semester data available</p>
                    )}
                  </div>
                )}
              </div>

              {/* Performance Chart Section */}
              <div style={styles.performanceCard}>
                <h3>📈 Subject-wise Performance</h3>
                <div style={styles.performanceBars}>
                  {subjects.map((subject, index) => {
                    const percentage = (subject.marks / subject.maxMarks) * 100;
                    const gradeInfo = getGrade(percentage);
                    return (
                      <div key={index} style={styles.performanceItem}>
                        <div style={styles.performanceLabel}>
                          <span>{subject.code}</span>
                          <span>{percentage.toFixed(0)}%</span>
                        </div>
                        <div style={styles.performanceBarContainer}>
                          <div style={{
                            ...styles.performanceBar,
                            width: `${percentage}%`,
                            backgroundColor: gradeInfo.color
                          }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Download Options */}
              <div style={styles.downloadCard}>
                <h3>📄 Download Reports</h3>
                <div style={styles.downloadButtons}>
                  <button style={styles.downloadBtn}>
                    📥 Download Grade Card (PDF)
                  </button>
                  <button style={styles.downloadBtn}>
                    📥 Download Detailed Marksheet
                  </button>
                  <button style={styles.downloadBtn}>
                    📥 Download Transcript
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
    fontSize: "0.75rem",
    color: "#7f8c8d",
  },
  backBtn: {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  mainContent: {
    padding: "2rem",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionTitle: {
    color: "white",
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  loadingContainer: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "20px",
    padding: "60px",
    textAlign: "center",
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
    gap: "1rem",
    marginBottom: "2rem",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "1.5rem",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
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
    margin: 0,
    color: "#2c3e50",
  },
  statLabel: {
    margin: 0,
    color: "#7f8c8d",
    fontSize: "0.85rem",
  },
  infoCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  studentInfoHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  studentAvatarLarge: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f58003, #f58003)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "2rem",
    fontWeight: "bold",
  },
  studentInfoDetails: {
    flex: 1,
    "& h3": {
      margin: "0 0 0.3rem 0",
      color: "#2c3e50",
    },
    "& p": {
      margin: "0 0 0.5rem 0",
      color: "#7f8c8d",
    },
  },
  studentMeta: {
    display: "flex",
    gap: "1rem",
    fontSize: "0.85rem",
    color: "#7f8c8d",
  },
  gradeCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  gradeCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
    "& h3": {
      margin: 0,
      color: "#2c3e50",
    },
  },
  semesterSelector: {
    display: "flex",
    gap: "0.5rem",
  },
  semesterBtn: {
    padding: "0.5rem 1rem",
    border: "2px solid #e1e8ed",
    background: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  semesterBtnActive: {
    background: "#f58003",
    color: "white",
    borderColor: "#f58003",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    background: "#f58003",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    color: "white",
    fontWeight: "600",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e1e8ed",
  },
  rowEven: {
    background: "#f8f9fa",
  },
  rowOdd: {
    background: "white",
  },
  percentageBadge: {
    padding: "4px 8px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
  gradeBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    color: "white",
    fontWeight: "600",
    fontSize: "0.85rem",
  },
  tableFooter: {
    background: "#f8f9fa",
    fontWeight: "bold",
  },
  tdFooter: {
    padding: "12px",
    borderTop: "2px solid #e1e8ed",
    fontWeight: "bold",
  },
  resultSummary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
    marginTop: "1.5rem",
  },
  summaryCard: {
    background: "#f8f9fa",
    padding: "1rem",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
  },
  summaryIcon: {
    fontSize: "1.8rem",
  },
  summaryLabel: {
    fontSize: "0.75rem",
    color: "#7f8c8d",
  },
  summaryValue: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  previousSemesters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1rem",
  },
  semesterCard: {
    background: "#f8f9fa",
    padding: "1rem",
    borderRadius: "8px",
  },
  semesterCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
    "& h4": {
      margin: 0,
      color: "#2c3e50",
    },
  },
  semesterCgpa: {
    fontWeight: "bold",
    color: "#f58003",
  },
  semesterSubjects: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },
  semesterSubject: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
  },
  performanceCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    "& h3": {
      margin: "0 0 1rem 0",
      color: "#2c3e50",
    },
  },
  performanceBars: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  performanceItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },
  performanceLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
    fontWeight: "500",
    color: "#2c3e50",
  },
  performanceBarContainer: {
    height: "8px",
    background: "#e1e8ed",
    borderRadius: "4px",
    overflow: "hidden",
  },
  performanceBar: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  downloadCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    "& h3": {
      margin: "0 0 1rem 0",
      color: "#2c3e50",
    },
  },
  downloadButtons: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  downloadBtn: {
    background: "#ecf0f1",
    border: "none",
    padding: "0.8rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "#f58003",
      color: "white",
      transform: "translateY(-2px)",
    },
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
  noData: {
    textAlign: "center",
    color: "#7f8c8d",
    padding: "2rem",
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  button:hover {
    transform: translateY(-2px);
  }
  
  button:active {
    transform: scale(0.98);
  }
  
  .status-success {
    color: #10b981;
    font-weight: bold;
  }
  
  .status-warning {
    color: #f59e0b;
    font-weight: bold;
  }
  
  .status-danger {
    color: #ef4444;
    font-weight: bold;
  }
`;
document.head.appendChild(styleSheet);

export default StudentMarks;