import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Attendance() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [availableCourses, setAvailableCourses] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const abortControllerRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Role check - Admin or Staff can access
  if (!user || (user.role !== "Admin" && user.role !== "staff")) {
    return (
      <div style={styles.accessDenied}>
        <h2>⛔ Access Denied</h2>
        <p>Only Administrators and Teachers can access attendance management.</p>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          ← Go Back to Login
        </button>
      </div>
    );
  }

  const isAdmin = user.role === "Admin";
  const isStaff = user.role === "staff";

  // Fetch available courses for staff - runs only once
  useEffect(() => {
    if (isStaff && user.coursesTeaching && user.coursesTeaching.length > 0) {
      const courses = user.coursesTeaching.map(c => ({
        courseId: c.courseId,
        courseName: c.courseName,
        section: c.section
      }));
      setAvailableCourses(courses);
      if (courses.length > 0 && !courseFilter) {
        setCourseFilter(courses[0].courseId);
      }
    }
  }, [isStaff, user.coursesTeaching]); // Only depends on user.coursesTeaching

  // Fetch all students and their attendance records - runs only once on mount
  useEffect(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    // In the fetchData function, update the attendance records structure:
const fetchData = async () => {
  setLoading(true);
  setMessage("");
  try {
    // Fetch all students
    const studentsRes = await fetch("http://localhost:5001/api/users/students");
    const studentsData = await studentsRes.json();
    let allStudents = studentsData.students || [];
    
    // If staff, filter only assigned students based on section
    if (isStaff && user.coursesTeaching && user.coursesTeaching.length > 0) {
      const assignedSections = user.coursesTeaching
        .filter(course => course.section)
        .map(course => course.section);
      const uniqueSections = [...new Set(assignedSections)];
      allStudents = allStudents.filter(student => 
        uniqueSections.includes(student.section)
      );
    }
    
    setStudents(allStudents);
    setFilteredStudents(allStudents);
    
    // Fetch attendance records
    const attendanceRes = await fetch("http://localhost:5001/api/users/attendance");
    const attendanceData = await attendanceRes.json();
    
    // The backend returns records with structure: { [email]: { attendanceData: {...}, name, section } }
    setAttendanceRecords(attendanceData.records || {});
    
  } catch (err) {
    console.error("Error fetching data:", err);
    setMessageType("error");
    setMessage("⚠️ Error fetching data. Please refresh the page.");
  } finally {
    setLoading(false);
  }
};

    fetchData();
    
    // Cleanup function to abort fetch on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Empty dependency array - runs only once on mount

  // Filter students based on search and course - runs when dependencies change
  useEffect(() => {
    let filtered = [...students];
    
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.enrollmentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by course section if staff and course selected
    if (isStaff && courseFilter && availableCourses.length > 0) {
      const selectedCourse = availableCourses.find(c => c.courseId === courseFilter);
      if (selectedCourse && selectedCourse.section) {
        filtered = filtered.filter(student => 
          student.section === selectedCourse.section
        );
      }
    }
    
    setFilteredStudents(filtered);
  }, [searchTerm, students, isStaff, courseFilter, availableCourses]);

  // Calculate student statistics
  const calculateStudentStats = useCallback((studentEmail) => {
    const records = attendanceRecords[studentEmail]?.attendanceData || {};
    const totalClasses = Object.keys(records).length;
    const presentCount = Object.values(records).filter(status => status === 'Present').length;
    const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
    
    return { totalClasses, presentCount, percentage };
  }, [attendanceRecords]);

  // Get today's attendance status for a student
  const getTodayStatus = useCallback((studentEmail) => {
    const records = attendanceRecords[studentEmail]?.attendanceData || {};
    return records[selectedDate] || 'Not Marked';
  }, [attendanceRecords, selectedDate]);

  // Mark attendance for a student
 // ✅ Mark attendance for a student - UPDATED with better debugging
const markAttendance = async (studentEmail, status) => {
  setLoading(true);
  try {
    // Debug log to see what's being sent
    console.log("📤 Sending attendance mark request:", { 
      studentEmail, 
      date: selectedDate, 
      status,
      courseCode: isStaff ? courseFilter : null 
    });
    
    const res = await fetch("http://localhost:5001/api/users/attendance/mark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentEmail: studentEmail,  // ✅ Must be studentEmail (not email)
        date: selectedDate,
        status: status,
        courseCode: isStaff ? courseFilter : null
      }),
    });

    const data = await res.json();
    console.log("📥 Server response:", data);
    
    if (data.success) {
      setMessageType("success");
      setMessage(`✅ Marked ${status} for ${studentEmail} on ${selectedDate}`);
      
      // Update local state
      setAttendanceRecords(prev => {
        const updated = { ...prev };
        if (!updated[studentEmail]) {
          updated[studentEmail] = { attendanceData: {} };
        }
        updated[studentEmail].attendanceData = {
          ...updated[studentEmail].attendanceData,
          [selectedDate]: status
        };
        return updated;
      });
      
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    } else {
      setMessageType("error");
      setMessage(`❌ ${data.message || "Failed to mark attendance"}`);
    }
  } catch (err) {
    console.error("❌ Error marking attendance:", err);
    setMessageType("error");
    setMessage("⚠️ Server error while marking attendance.");
  } finally {
    setLoading(false);
  }
};
  // Bulk mark attendance for all filtered students
  // ✅ Bulk mark attendance for all filtered students - UPDATED
const bulkMarkAttendance = async (status) => {
  if (filteredStudents.length === 0) {
    setMessageType("warning");
    setMessage("⚠️ No students to mark attendance for.");
    setTimeout(() => setMessage(""), 3000);
    return;
  }
  
  setLoading(true);
  try {
    const studentEmails = filteredStudents.map(s => s.email);
    
    console.log("📤 Sending bulk attendance request:", { 
      date: selectedDate, 
      status, 
      studentEmails,
      courseCode: isStaff ? courseFilter : null 
    });
    
    const res = await fetch("http://localhost:5001/api/users/attendance/bulk-mark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selectedDate,
        status,
        studentEmails: studentEmails,
        courseCode: isStaff ? courseFilter : null
      }),
    });

    const data = await res.json();
    console.log("📥 Server response:", data);
    
    if (data.success) {
      setMessageType("success");
      setMessage(`✅ Marked all ${filteredStudents.length} students as ${status} on ${selectedDate}`);
      
      // Update local state for all students
      setAttendanceRecords(prev => {
        const updated = { ...prev };
        filteredStudents.forEach(student => {
          if (!updated[student.email]) {
            updated[student.email] = { attendanceData: {} };
          }
          updated[student.email].attendanceData = {
            ...updated[student.email].attendanceData,
            [selectedDate]: status
          };
        });
        return updated;
      });
      
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessageType("error");
      setMessage(`❌ ${data.message || "Failed to bulk mark attendance"}`);
    }
  } catch (err) {
    console.error("❌ Error in bulk marking:", err);
    setMessageType("error");
    setMessage("⚠️ Server error while bulk marking attendance.");
  } finally {
    setLoading(false);
  }
};

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return '#10b981';
      case 'Absent': return '#ef4444';
      case 'Late': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  // Get percentage color
  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return "#10b981";
    if (percentage >= 75) return "#f59e0b";
    return "#ef4444";
  };

  // Get teacher's assigned sections display
  const getAssignedSections = () => {
    if (!isStaff || !user.coursesTeaching) return null;
    const sections = [...new Set(user.coursesTeaching.map(c => c.section).filter(s => s))];
    return sections.length > 0 ? sections.join(', ') : 'None';
  };

  // Get today's date for comparison
  const todayDate = new Date().toISOString().split('T')[0];
  const isFutureDate = selectedDate > todayDate;

  if (isInitialLoad && loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <button onClick={() => navigate(isAdmin ? "/admin-dashboard" : "/teacher-dashboard")} style={styles.backBtn}>
              ← Back to Dashboard
            </button>
            <h2 style={styles.title}>📊 Attendance Management</h2>
          </div>
          {isStaff && (
            <div style={styles.staffBadge}>
              👨‍🏫 Teacher: {user.name}
              <span style={styles.sectionsBadge}>
                Assigned Sections: {getAssignedSections()}
              </span>
            </div>
          )}
        </div>
        
        <div style={styles.controls}>
          <div style={styles.datePicker}>
            <label style={styles.dateLabel}>Select Date: </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={styles.dateInput}
              max={todayDate}
            />
            {isFutureDate && (
              <span style={styles.warningBadge}>⚠️ Cannot mark future dates</span>
            )}
          </div>
          
          {isStaff && availableCourses.length > 0 && (
            <div style={styles.courseSelector}>
              <label style={styles.dateLabel}>Course: </label>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                style={styles.courseSelect}
              >
                {availableCourses.map(course => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.courseId} - {course.courseName} (Sec {course.section})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {filteredStudents.length > 0 && !isFutureDate && (
            <div style={styles.bulkActions}>
              <button
                onClick={() => bulkMarkAttendance('Present')}
                style={styles.bulkPresentBtn}
                disabled={loading || isFutureDate}
              >
                ✅ Mark All Present
              </button>
              <button
                onClick={() => bulkMarkAttendance('Absent')}
                style={styles.bulkAbsentBtn}
                disabled={loading || isFutureDate}
              >
                ❌ Mark All Absent
              </button>
            </div>
          )}
        </div>
        
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="🔍 Search by name, email, enrollment ID, or section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <span style={styles.resultCount}>
            {filteredStudents.length} / {students.length} students
          </span>
        </div>
      </div>

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

      {isFutureDate && (
        <div style={styles.warningContainer}>
          ⚠️ You are viewing a future date ({selectedDate}). You cannot mark attendance for future dates.
        </div>
      )}

      {filteredStudents.length === 0 && !loading && !isInitialLoad ? (
        <div style={styles.noDataContainer}>
          <p>📭 No students found</p>
          {isStaff && (
            <p style={styles.noDataHint}>
              You haven't been assigned any sections yet. Please contact the administrator.
            </p>
          )}
          {searchTerm && (
            <p style={styles.noDataHint}>
              Try searching with a different term.
            </p>
          )}
        </div>
      ) : filteredStudents.length > 0 && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Student</th>
                <th style={styles.th}>Enrollment ID</th>
                <th style={styles.th}>Section</th>
                <th style={styles.th}>Today's Status</th>
                <th style={styles.th}>Attendance Stats</th>
                <th style={styles.th}>Overall %</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const stats = calculateStudentStats(student.email);
                const todayStatus = getTodayStatus(student.email);
                
                return (
                  <tr key={student._id || student.email} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.studentInfo}>
                        <div style={styles.avatar}>
                          {student.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={styles.name}>{student.name}</div>
                          <div style={styles.email}>{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.enrollmentBadge}>
                        {student.enrollmentId || "N/A"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.sectionBadge}>
                        {student.section || "Not Assigned"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(todayStatus)
                      }}>
                        {todayStatus}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.stats}>
                        <div style={styles.statItem}>
                          <span style={styles.statPresent}>✅</span>
                          <span>{stats.presentCount}</span>
                        </div>
                        <div style={styles.statItem}>
                          <span style={styles.statAbsent}>❌</span>
                          <span>{stats.totalClasses - stats.presentCount}</span>
                        </div>
                        <div style={styles.statItem}>
                          <span style={styles.statTotal}>📚</span>
                          <span>{stats.totalClasses}</span>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{
                        ...styles.percentage,
                        backgroundColor: getPercentageColor(stats.percentage)
                      }}>
                        {stats.percentage}%
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => markAttendance(student.email, "Present")}
                          style={styles.presentBtn}
                          disabled={loading || isFutureDate || todayStatus === 'Present'}
                        >
                          ✅ Present
                        </button>
                        <button
                          onClick={() => markAttendance(student.email, "Absent")}
                          style={styles.absentBtn}
                          disabled={loading || isFutureDate || todayStatus === 'Absent'}
                        >
                          ❌ Absent
                        </button>
                        <button
                          onClick={() => markAttendance(student.email, "Late")}
                          style={styles.lateBtn}
                          disabled={loading || isFutureDate || todayStatus === 'Late'}
                        >
                          ⏰ Late
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Styles remain the same as before...
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #ee6e0cff 0%, #ed6e07ff 100%)",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
    transition: "all 0.3s ease",
  },
  header: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "20px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "20px",
  },
  title: {
    color: "#2d3748",
    margin: "10px 0 0 0",
    fontSize: "2rem",
    fontWeight: "700",
  },
  staffBadge: {
    background: "#e2e8f0",
    padding: "10px 20px",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#2d3748",
  },
  sectionsBadge: {
    marginLeft: "10px",
    padding: "4px 8px",
    background: "#f58003",
    color: "white",
    borderRadius: "6px",
    fontSize: "0.8rem",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "20px",
  },
  datePicker: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  dateLabel: {
    fontWeight: "600",
    color: "#4b5563",
  },
  dateInput: {
    padding: "10px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "1rem",
  },
  warningBadge: {
    padding: "6px 12px",
    background: "#fef3c7",
    color: "#d97706",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  courseSelector: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  courseSelect: {
    padding: "10px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "0.9rem",
    background: "white",
    minWidth: "200px",
  },
  bulkActions: {
    display: "flex",
    gap: "10px",
  },
  bulkPresentBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  bulkAbsentBtn: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  searchBox: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    padding: "12px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "1rem",
    outline: "none",
  },
  resultCount: {
    padding: "8px 12px",
    background: "#f3f4f6",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#4b5563",
  },
  message: {
    borderRadius: "15px",
    padding: "15px 25px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "1rem",
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
  warningContainer: {
    background: "#fef3c7",
    color: "#d97706",
    padding: "15px 20px",
    borderRadius: "12px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "500",
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
  noDataContainer: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "20px",
    padding: "60px",
    textAlign: "center",
    color: "#4b5563",
  },
  noDataHint: {
    marginTop: "10px",
    fontSize: "0.9rem",
    color: "#f58003",
  },
  tableContainer: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },
  tableHeader: {
    background: "linear-gradient(135deg, #f58003, #f58003)",
  },
  th: {
    padding: "20px",
    textAlign: "left",
    color: "white",
    fontWeight: "600",
    fontSize: "1rem",
  },
  tableRow: {
    borderBottom: "1px solid #e2e8f0",
    transition: "background 0.3s ease",
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
  avatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f58003, #f58003)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
  name: {
    fontWeight: "600",
    color: "#2d3748",
  },
  email: {
    color: "#718096",
    fontSize: "0.85rem",
  },
  enrollmentBadge: {
    background: "#e3f2fd",
    color: "#1976d2",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontFamily: "monospace",
    fontWeight: "500",
  },
  sectionBadge: {
    background: "#e2e8f0",
    color: "#4a5568",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "500",
    fontSize: "0.85rem",
  },
  statusBadge: {
    color: "white",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "0.85rem",
    display: "inline-block",
  },
  stats: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: "500",
    fontSize: "0.9rem",
  },
  statPresent: {
    color: "#10b981",
  },
  statAbsent: {
    color: "#ef4444",
  },
  statTotal: {
    color: "#6b7280",
  },
  percentage: {
    color: "white",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "600",
    textAlign: "center",
    minWidth: "70px",
    display: "inline-block",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  presentBtn: {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
    transition: "all 0.3s ease",
  },
  absentBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
    transition: "all 0.3s ease",
  },
  lateBtn: {
    background: "#f59e0b",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
    transition: "all 0.3s ease",
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
  
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;
document.head.appendChild(styleSheet);

export default Attendance;