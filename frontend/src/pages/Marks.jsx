import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Marks() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  // Role check
  if (!user || (user.role !== "Admin" && user.role !== "staff")) {
    return (
      <div style={styles.accessDenied}>
        <div style={styles.deniedContent}>
          <div style={styles.deniedIcon}>🔒</div>
          <h3>Access Denied</h3>
          <p>Only Administrators and Teachers can access marks management</p>
          <button onClick={() => navigate("/")} style={styles.backBtn}>
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "Admin";
  const isStaff = user.role === "staff";

  // Fetch students and subjects
  useEffect(() => {
    fetchStudents();
    fetchSubjects();
  }, []);

  // Filter students
  useEffect(() => {
    let filtered = [...students];
    
    if (selectedSemester !== "all") {
      filtered = filtered.filter(s => s.semester === parseInt(selectedSemester));
    }
    
    if (selectedSection !== "all") {
      filtered = filtered.filter(s => s.section === selectedSection);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.enrollmentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // If staff, filter only assigned students
    if (isStaff && user.coursesTeaching) {
      const assignedSections = user.coursesTeaching.map(c => c.section);
      filtered = filtered.filter(s => assignedSections.includes(s.section));
    }
    
    setFilteredStudents(filtered);
  }, [students, selectedSemester, selectedSection, searchTerm, isStaff, user]);

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/users/students");
      const data = await res.json();
      const studentsList = data.students || [];
      setStudents(studentsList);
      setFilteredStudents(studentsList);
    } catch (err) {
      console.error("Error fetching students:", err);
      showMessage("⚠️ Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      // Mock subjects - in real app, fetch from backend
      const mockSubjects = [
        { id: 1, code: "CS101", name: "Programming Fundamentals", semester: 1, credits: 4 },
        { id: 2, code: "CS202", name: "Data Structures", semester: 2, credits: 4 },
        { id: 3, code: "CS303", name: "Database Management", semester: 3, credits: 3 },
        { id: 4, code: "CS404", name: "Operating Systems", semester: 4, credits: 3 },
        { id: 5, code: "CS505", name: "Computer Networks", semester: 5, credits: 3 },
        { id: 6, code: "CS606", name: "Software Engineering", semester: 6, credits: 3 },
      ];
      setSubjects(mockSubjects);
      if (mockSubjects.length > 0) {
        setSelectedSubject(mockSubjects[0].code);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  const handleUpdateMarks = async (studentEmail, studentName, subjectCode) => {
    const markKey = `${studentEmail}_${subjectCode}`;
    const value = marks[markKey]?.trim();
    
    if (!value) {
      showMessage("❌ Please enter marks before submitting!", "error");
      return;
    }

    if (value < 0 || value > 100) {
      showMessage("❌ Marks must be between 0 and 100!", "error");
      return;
    }

    setUpdatingId(markKey);
    try {
      const res = await fetch("http://localhost:5001/api/users/update-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: studentEmail, 
          field: "marks", 
          value: value,
          subjectCode: subjectCode
        }),
      });
      const data = await res.json();

      if (data.success) {
        showMessage(`✅ Marks updated for ${studentName} - ${getSubjectName(subjectCode)}`, "success");
        setMarks({ ...marks, [markKey]: "" });
        
        // Update local state
        setStudents(prev =>
          prev.map(s => {
            if (s.email === studentEmail) {
              const updatedMarks = s.marksData || {};
              updatedMarks[subjectCode] = value;
              return { ...s, marksData: updatedMarks };
            }
            return s;
          })
        );
      } else {
        showMessage(`❌ Failed to update marks: ${data.message}`, "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("⚠️ Server error while updating marks.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const getSubjectName = (code) => {
    const subject = subjects.find(s => s.code === code);
    return subject ? subject.name : code;
  };

  const getMarksForStudent = (student, subjectCode) => {
    if (student.marksData && student.marksData[subjectCode]) {
      return student.marksData[subjectCode];
    }
    return "";
  };

  const getGrade = (marks) => {
    const numericMarks = parseInt(marks);
    if (numericMarks >= 90) return { grade: "A+", color: "#10b981" };
    if (numericMarks >= 80) return { grade: "A", color: "#10b981" };
    if (numericMarks >= 70) return { grade: "B+", color: "#f59e0b" };
    if (numericMarks >= 60) return { grade: "B", color: "#f59e0b" };
    if (numericMarks >= 50) return { grade: "C", color: "#3b82f6" };
    if (numericMarks >= 40) return { grade: "D", color: "#ef4444" };
    return { grade: "F", color: "#ef4444" };
  };

  const getSemesters = () => {
    const semesters = [...new Set(students.map(s => s.semester).filter(s => s))];
    return semesters.sort((a, b) => a - b);
  };

  const getSections = () => {
    const sections = [...new Set(students.map(s => s.section).filter(s => s))];
    return sections.sort();
  };

  const calculateAverage = () => {
    let total = 0;
    let count = 0;
    filteredStudents.forEach(student => {
      const marksValue = getMarksForStudent(student, selectedSubject);
      if (marksValue) {
        total += parseInt(marksValue);
        count++;
      }
    });
    return count > 0 ? (total / count).toFixed(1) : "0";
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading marks data...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.titleSection}>
            <button onClick={() => navigate(isAdmin ? "/admin-dashboard" : "/teacher-dashboard")} style={styles.backBtn}>
              ← Back to Dashboard
            </button>
            <h1 style={styles.title}>📊 Marks Management</h1>
            <p style={styles.subtitle}>Enter and manage student marks by subject</p>
          </div>
          <div style={styles.adminBadge}>
            <span style={styles.adminIcon}>{isAdmin ? "👨‍🏫" : "👨‍🏫"}</span>
            <span>{isAdmin ? "Academic Admin" : "Teacher Portal"}</span>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        {/* Message */}
        {message && (
          <div style={{
            ...styles.messageContainer,
            ...(messageType === "success" ? styles.messageSuccess :
               messageType === "error" ? styles.messageError :
               styles.messageWarning)
          }}>
            <div style={styles.message}>
              <span style={styles.messageIcon}>
                {messageType === "success" ? "✅" : messageType === "error" ? "❌" : "⚠️"}
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
              <div style={styles.statNumber}>{filteredStudents.length}</div>
              <div style={styles.statLabel}>Students</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>{calculateAverage()}%</div>
              <div style={styles.statLabel}>Avg. Marks</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎯</div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>
                {filteredStudents.filter(s => {
                  const marks = getMarksForStudent(s, selectedSubject);
                  return marks && parseInt(marks) >= 75;
                }).length}
              </div>
              <div style={styles.statLabel}>Above 75%</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⭐</div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>
                {filteredStudents.filter(s => {
                  const marks = getMarksForStudent(s, selectedSubject);
                  return marks && parseInt(marks) >= 90;
                }).length}
              </div>
              <div style={styles.statLabel}>Excellent (A+)</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filtersCard}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Subject:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={styles.filterSelect}
            >
              {subjects.map(subject => (
                <option key={subject.code} value={subject.code}>
                  {subject.code} - {subject.name} (Sem {subject.semester})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Semester:</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Semesters</option>
              {getSemesters().map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Section:</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Sections</option>
              {getSections().map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Search:</label>
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.filterInput}
            />
          </div>
        </div>

        {/* Marks Table */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h3 style={styles.tableTitle}>
              Marks Entry - {getSubjectName(selectedSubject)}
            </h3>
            <div style={styles.tableSubtitle}>
              {filteredStudents.filter(s => getMarksForStudent(s, selectedSubject)).length} of {filteredStudents.length} students have marks
            </div>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>Student Information</th>
                  <th style={styles.th}>Enrollment ID</th>
                  <th style={styles.th}>Semester</th>
                  <th style={styles.th}>Section</th>
                  <th style={styles.th}>Current Marks</th>
                  <th style={styles.th}>Grade</th>
                  <th style={styles.th}>Enter Marks (0-100)</th>
                  <th style={styles.th}>Action</th>
                 </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={styles.noData}>
                      <div style={styles.noDataIcon}>📊</div>
                      <p>No students found</p>
                      <p style={styles.noDataSub}>Try changing your filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const currentMarks = getMarksForStudent(student, selectedSubject);
                    const gradeInfo = currentMarks ? getGrade(currentMarks) : { grade: "N/A", color: "#718096" };
                    const markKey = `${student.email}_${selectedSubject}`;
                    const isUpdating = updatingId === markKey;
                    
                    return (
                      <tr key={student._id || student.email} style={styles.tableRow}>
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
                          <span style={styles.enrollmentBadge}>
                            {student.enrollmentId || "N/A"}
                          </span>
                        </td>
                        <td style={styles.td}>Semester {student.semester || "?"}</td>
                        <td style={styles.td}>
                          <span style={styles.sectionBadge}>
                            {student.section || "Not Assigned"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{
                            ...styles.marksBadge,
                            backgroundColor: gradeInfo.color,
                            color: "white"
                          }}>
                            {currentMarks || "Not Entered"}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.gradeBadge,
                            backgroundColor: gradeInfo.color
                          }}>
                            {gradeInfo.grade}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            placeholder="0-100"
                            value={marks[markKey] || currentMarks || ""}
                            onChange={(e) =>
                              setMarks({ ...marks, [markKey]: e.target.value })
                            }
                            style={styles.input}
                            disabled={isUpdating}
                          />
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => handleUpdateMarks(student.email, student.name, selectedSubject)}
                            style={isUpdating ? styles.saveBtnLoading : styles.saveBtn}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Entry Section */}
        {isAdmin && (
          <div style={styles.bulkCard}>
            <h3>📦 Bulk Marks Entry</h3>
            <p>Upload marks for multiple students using Excel/CSV file</p>
            <div style={styles.bulkActions}>
              <button style={styles.bulkBtn}>
                📤 Download Template
              </button>
              <button style={styles.bulkBtnPrimary}>
                📎 Upload Marksheet
              </button>
            </div>
          </div>
        )}

        {/* Guidelines */}
        <div style={styles.helpCard}>
          <div style={styles.helpIcon}>💡</div>
          <div style={styles.helpContent}>
            <h4>Marks Entry Guidelines</h4>
            <ul style={styles.helpList}>
              <li>Enter marks between 0 and 100</li>
              <li>Grades are automatically calculated: <span style={{color: '#10b981'}}>A+ (90+)</span>, <span style={{color: '#10b981'}}>A (80-89)</span>, <span style={{color: '#f59e0b'}}>B+ (70-79)</span>, <span style={{color: '#f59e0b'}}>B (60-69)</span>, <span style={{color: '#3b82f6'}}>C (50-59)</span>, <span style={{color: '#ef4444'}}>D (40-49)</span>, <span style={{color: '#ef4444'}}>F (Below 40)</span></li>
              <li>Select different subjects to enter marks for different courses</li>
              <li>Use filters to focus on specific semesters or sections</li>
              <li>Marks are saved immediately - no separate submit button needed per student</li>
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
  backBtn: {
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    marginBottom: "10px",
    display: "inline-block",
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
    maxWidth: "1400px",
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
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 5px 0",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "1rem",
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
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  messageContainer: {
    marginBottom: "20px",
    padding: "15px 20px",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
  },
  messageSuccess: {
    background: "rgba(46, 125, 50, 0.9)",
  },
  messageError: {
    background: "rgba(198, 40, 40, 0.9)",
  },
  messageWarning: {
    background: "rgba(245, 124, 0, 0.9)",
  },
  message: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "white",
    fontWeight: "500",
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
  },
  statIcon: {
    fontSize: "2rem",
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#2d3748",
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "#718096",
  },
  filtersCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "30px",
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    alignItems: "flex-end",
  },
  filterGroup: {
    flex: 1,
    minWidth: "150px",
  },
  filterLabel: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#2d3748",
    fontSize: "0.85rem",
  },
  filterSelect: {
    width: "100%",
    padding: "10px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    background: "white",
  },
  filterInput: {
    width: "100%",
    padding: "10px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
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
    marginBottom: "20px",
  },
  tableTitle: {
    margin: "0 0 5px 0",
    color: "#2d3748",
    fontSize: "1.3rem",
    fontWeight: "600",
  },
  tableSubtitle: {
    color: "#718096",
    fontSize: "0.85rem",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },
  tableHeadRow: {
    background: "linear-gradient(135deg, #f58003, #e65100)",
  },
  th: {
    padding: "15px",
    textAlign: "left",
    color: "white",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  tableRow: {
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "15px",
    verticalAlign: "middle",
  },
  studentInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  studentAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ff6d00, #e65100)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: "1rem",
  },
  studentName: {
    fontWeight: "600",
    color: "#2d3748",
    fontSize: "0.9rem",
  },
  studentEmail: {
    color: "#718096",
    fontSize: "0.75rem",
  },
  enrollmentBadge: {
    background: "#e3f2fd",
    color: "#1976d2",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontFamily: "monospace",
  },
  sectionBadge: {
    background: "#e2e8f0",
    color: "#4a5568",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "0.75rem",
  },
  marksBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
    display: "inline-block",
    minWidth: "70px",
    textAlign: "center",
  },
  gradeBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "600",
    display: "inline-block",
    minWidth: "50px",
    textAlign: "center",
    color: "white",
  },
  input: {
    padding: "8px",
    border: "2px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "0.85rem",
    width: "80px",
    textAlign: "center",
  },
  saveBtn: {
    background: "linear-gradient(135deg, #ff6d00, #e65100)",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  saveBtnLoading: {
    background: "#a0aec0",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "not-allowed",
    fontSize: "0.8rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    justifyContent: "center",
  },
  smallSpinner: {
    width: "12px",
    height: "12px",
    border: "2px solid transparent",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  noData: {
    textAlign: "center",
    padding: "40px",
    color: "#718096",
  },
  noDataIcon: {
    fontSize: "2rem",
    marginBottom: "10px",
  },
  noDataSub: {
    fontSize: "0.8rem",
    marginTop: "5px",
  },
  bulkCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "30px",
    textAlign: "center",
  },
  bulkActions: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    marginTop: "15px",
  },
  bulkBtn: {
    background: "#e2e8f0",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
  },
  bulkBtnPrimary: {
    background: "linear-gradient(135deg, #ff6d00, #e65100)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
  },
  helpCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "20px",
    display: "flex",
    gap: "20px",
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
    margin: "10px 0 0 20px",
    color: "#4a5568",
    fontSize: "0.85rem",
    lineHeight: "1.6",
  },
};

// Add animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  button:hover {
    transform: translateY(-1px);
  }
  
  button:active {
    transform: scale(0.98);
  }
  
  input:focus {
    border-color: #ff6d00;
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 109, 0, 0.2);
  }
`;
document.head.appendChild(styleSheet);

export default Marks;