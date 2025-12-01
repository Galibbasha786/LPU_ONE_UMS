import React, { useEffect, useState } from "react";

function Attendance() {
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || user.role !== "Admin") {
    return <p style={{textAlign: "center", marginTop: "50px", color: "red"}}>Access Denied: Admins Only</p>;
  }

  // ✅ Fetch all students and their attendance records
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, attendanceRes] = await Promise.all([
          fetch("http://localhost:5001/api/users/students"),
          fetch("http://localhost:5001/api/users/attendance")
        ]);

        const studentsData = await studentsRes.json();
        const attendanceData = await attendanceRes.json();

        setStudents(studentsData.students || []);
        setAttendanceRecords(attendanceData.records || {});
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  // ✅ Calculate student statistics
  const calculateStudentStats = (studentEmail) => {
    const records = attendanceRecords[studentEmail] || {};
    const totalClasses = Object.keys(records).length;
    const presentCount = Object.values(records).filter(status => status === 'Present').length;
    const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
    
    return { totalClasses, presentCount, percentage };
  };

  // ✅ Get today's attendance status for a student
  const getTodayStatus = (studentEmail) => {
    return attendanceRecords[studentEmail]?.[selectedDate] || 'Not Marked';
  };

  // ✅ Mark attendance for a student
  const markAttendance = async (studentEmail, status) => {
    try {
      const res = await fetch("http://localhost:5001/api/users/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail,
          date: selectedDate,
          status
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Marked ${status} for ${studentEmail} on ${selectedDate}`);
        
        // Update local state
        setAttendanceRecords(prev => ({
          ...prev,
          [studentEmail]: {
            ...prev[studentEmail],
            [selectedDate]: status
          }
        }));
      } else {
        setMessage(`❌ Failed to mark attendance for ${studentEmail}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error while marking attendance.");
    }
  };

  // ✅ Bulk mark attendance for all students
  const bulkMarkAttendance = async (status) => {
    try {
      const res = await fetch("http://localhost:5001/api/users/attendance/bulk-mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          status,
          studentEmails: students.map(s => s.email)
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Marked all students as ${status} on ${selectedDate}`);
        
        // Update local state for all students
        const updatedRecords = { ...attendanceRecords };
        students.forEach(student => {
          updatedRecords[student.email] = {
            ...updatedRecords[student.email],
            [selectedDate]: status
          };
        });
        setAttendanceRecords(updatedRecords);
      } else {
        setMessage(`❌ Failed to bulk mark attendance`);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error while bulk marking attendance.");
    }
  };

  // ✅ Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return '#10b981';
      case 'Absent': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // ✅ Get percentage color
  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return "#10b981";
    if (percentage >= 75) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📊 Attendance Management</h2>
        <div style={styles.controls}>
          <div style={styles.datePicker}>
            <label style={styles.dateLabel}>Select Date: </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>
          <div style={styles.bulkActions}>
            <button
              onClick={() => bulkMarkAttendance('Present')}
              style={styles.bulkPresentBtn}
            >
              ✅ Mark All Present
            </button>
            <button
              onClick={() => bulkMarkAttendance('Absent')}
              style={styles.bulkAbsentBtn}
            >
              ❌ Mark All Absent
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div style={styles.message}>
          {message}
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Student</th>
              <th style={styles.th}>Section</th>
              <th style={styles.th}>Today's Status</th>
              <th style={styles.th}>Attendance Stats</th>
              <th style={styles.th}>Overall %</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const stats = calculateStudentStats(student.email);
              const todayStatus = getTodayStatus(student.email);
              
              return (
                <tr key={student.email} style={styles.tableRow}>
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
                        disabled={todayStatus === 'Present'}
                      >
                        ✅ Present
                      </button>
                      <button
                        onClick={() => markAttendance(student.email, "Absent")}
                        style={styles.absentBtn}
                        disabled={todayStatus === 'Absent'}
                      >
                        ❌ Absent
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #ee6e0cff 0%, #ed6e07ff 100%)",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "20px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  title: {
    color: "#2d3748",
    margin: "0 0 20px 0",
    fontSize: "2rem",
    fontWeight: "700",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  datePicker: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
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
  bulkActions: {
    display: "flex",
    gap: "10px",
  },
  bulkPresentBtn: {
    background: "linear-gradient(135deg, #f50b5dff, #e422aaff)",
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
  message: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "15px 25px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "1.1rem",
    color: "#ee780aff",
  },
  tableContainer: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    background: "linear-gradient(135deg, #ed780bff, #7c3aed)",
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
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f18406ff, #764ba2)",
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
    fontSize: "0.9rem",
  },
  sectionBadge: {
    background: "#e2e8f0",
    color: "#4a5568",
    padding: "8px 16px",
    borderRadius: "20px",
    fontWeight: "500",
    fontSize: "0.9rem",
  },
  statusBadge: {
    color: "white",
    padding: "8px 16px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  stats: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: "500",
  },
  percentage: {
    color: "white",
    padding: "8px 16px",
    borderRadius: "20px",
    fontWeight: "600",
    textAlign: "center",
    minWidth: "70px",
  },
  actionButtons: {
    display: "flex",
    gap: "10px",
  },
  presentBtn: {
    background: "#ed7d05ff",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    opacity: 1,
  },
  absentBtn: {
    background: "#f75d04ff",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    opacity: 1,
  },
};

export default Attendance;