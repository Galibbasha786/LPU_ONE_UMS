import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ExamTimetable() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [room, setRoom] = useState("");
  const [examType, setExamType] = useState("Regular");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const isAdmin = user?.role === "Admin";
  const isStaff = user?.role === "staff";
  const isStudent = user?.role === "Student";

  const examTypes = ["Regular", "Mid Semester", "End Semester", "Practical", "Viva", "Quiz"];

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    filterExams();
  }, [selectedMonth, exams]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/users/exams");
      const data = await res.json();
      const examsList = data.exams || [];
      setExams(examsList);
      setFilteredExams(examsList);
    } catch (err) {
      console.error("Error fetching exams:", err);
      showMessage("⚠️ Failed to load exam timetable", "error");
    } finally {
      setLoading(false);
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

  const filterExams = () => {
    if (selectedMonth === "all") {
      setFilteredExams(exams);
    } else {
      const filtered = exams.filter(exam => {
        const examDate = new Date(exam.date);
        const examMonth = examDate.getMonth();
        return examMonth === parseInt(selectedMonth);
      });
      setFilteredExams(filtered);
    }
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!subject || !date || !time) {
      showMessage("❌ Please fill all required fields!", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/users/add-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subject, 
          date, 
          time,
          duration,
          room,
          examType
        }),
      });
      const data = await res.json();

      if (data.success) {
        showMessage("✅ Exam added successfully!", "success");
        fetchExams();
        setSubject("");
        setDate("");
        setTime("");
        setDuration("");
        setRoom("");
        setExamType("Regular");
        setShowForm(false);
      } else {
        showMessage("❌ Failed to add exam: " + data.message, "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("⚠️ Server error while adding exam.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId, examSubject) => {
    if (!window.confirm(`Delete exam for ${examSubject}?`)) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/users/delete-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: examSubject }),
      });
      const data = await res.json();

      if (data.success) {
        showMessage(`🗑️ Deleted ${examSubject} exam`, "success");
        fetchExams();
      } else {
        showMessage("❌ Failed to delete exam.", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("⚠️ Server error while deleting exam.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExam = (examDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (days) => {
    if (days < 0) return "#ef4444";
    if (days === 0) return "#f59e0b";
    if (days <= 3) return "#f59e0b";
    if (days <= 7) return "#10b981";
    return "#3b82f6";
  };

  const getStatusText = (days) => {
    if (days < 0) return "Expired";
    if (days === 0) return "Today!";
    if (days === 1) return "Tomorrow";
    return `${days} days left`;
  };

  const getExamTypeColor = (type) => {
    const colors = {
      "Regular": "#3b82f6",
      "Mid Semester": "#f59e0b",
      "End Semester": "#ef4444",
      "Practical": "#10b981",
      "Viva": "#8b5cf6",
      "Quiz": "#ec489a"
    };
    return colors[type] || "#6b7280";
  };

  const upcomingExams = exams
    .filter(exam => getDaysUntilExam(exam.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const months = [
    { value: "all", label: "All Months" },
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" }
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button 
              onClick={() => navigate(isAdmin ? "/admin-dashboard" : isStaff ? "/teacher-dashboard" : "/student-dashboard")} 
              style={styles.backBtn}
            >
              ← Back to Dashboard
            </button>
            <h1 style={styles.title}>📅 Exam Timetable</h1>
            <p style={styles.subtitle}>View and manage your exam schedule</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
              {showForm ? "− Cancel" : "+ Add Exam"}
            </button>
          )}
        </div>
      </header>

      <div style={styles.content}>
        {/* Message */}
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

        {/* Upcoming Exams Section */}
        <div style={styles.upcomingSection}>
          <h3>⏰ Upcoming Exams</h3>
          <div style={styles.upcomingGrid}>
            {upcomingExams.length > 0 ? (
              upcomingExams.map((exam, i) => {
                const daysLeft = getDaysUntilExam(exam.date);
                return (
                  <div key={i} style={styles.upcomingCard}>
                    <div style={styles.upcomingDate}>
                      <span style={styles.upcomingDay}>{new Date(exam.date).getDate()}</span>
                      <span style={styles.upcomingMonth}>{new Date(exam.date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div style={styles.upcomingInfo}>
                      <div style={styles.upcomingSubject}>{exam.subject}</div>
                      <div style={styles.upcomingTime}>{exam.time}</div>
                      <div style={styles.upcomingRoom}>{exam.room && `📍 ${exam.room}`}</div>
                    </div>
                    <div style={{...styles.upcomingCountdown, backgroundColor: getStatusColor(daysLeft)}}>
                      {getStatusText(daysLeft)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={styles.noUpcoming}>No upcoming exams scheduled</div>
            )}
          </div>
        </div>

        {/* Add Exam Form (Admin Only) */}
        {isAdmin && showForm && (
          <form onSubmit={handleAddExam} style={styles.form}>
            <h3 style={styles.formTitle}>Add New Exam</h3>
            <div style={styles.formGrid}>
              <input
                type="text"
                placeholder="Subject *"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={styles.input}
                required
              />
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                style={styles.select}
              >
                {examTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Duration (e.g., 2 hours)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Room Number"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formActions}>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? "Adding..." : "➕ Add Exam"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Filter Section */}
        <div style={styles.filterSection}>
          <label style={styles.filterLabel}>Filter by Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={styles.filterSelect}
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading exam timetable...</p>
          </div>
        )}

        {/* Exam Table */}
        {!loading && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Exam Type</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Day</th>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Duration</th>
                  <th style={styles.th}>Room</th>
                  <th style={styles.th}>Status</th>
                  {isAdmin && <th style={styles.thAction}>Action</th>}
                 </tr>
              </thead>
              <tbody>
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 9 : 8} style={styles.noData}>
                      <div style={styles.noDataIcon}>📅</div>
                      <p>No exams scheduled</p>
                      {isAdmin && <p style={styles.noDataSub}>Click "Add Exam" to create a new exam schedule</p>}
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((exam, index) => {
                    const daysLeft = getDaysUntilExam(exam.date);
                    const status = daysLeft < 0 ? "Completed" : daysLeft === 0 ? "Today" : "Upcoming";
                    return (
                      <tr key={index} style={styles.tableRow}>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.examTypeBadge,
                            backgroundColor: getExamTypeColor(exam.examType || "Regular")
                          }}>
                            {exam.examType || "Regular"}
                          </span>
                        </td>
                        <td style={styles.td}>{exam.subject}</td>
                        <td style={styles.td}>{new Date(exam.date).toLocaleDateString()}</td>
                        <td style={styles.td}>{new Date(exam.date).toLocaleDateString('en-US', { weekday: 'long' })}</td>
                        <td style={styles.td}>{exam.time}</td>
                        <td style={styles.td}>{exam.duration || "2 hours"}</td>
                        <td style={styles.td}>{exam.room || "TBD"}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: getStatusColor(daysLeft)
                          }}>
                            {status}
                          </span>
                        </td>
                        {isAdmin && (
                          <td style={styles.td}>
                            <button
                              onClick={() => handleDeleteExam(exam._id || exam.subject, exam.subject)}
                              style={styles.deleteBtn}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Statistics */}
        {exams.length > 0 && (
          <div style={styles.statsSection}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📚</div>
              <div style={styles.statNumber}>{exams.length}</div>
              <div style={styles.statLabel}>Total Exams</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>⏰</div>
              <div style={styles.statNumber}>
                {exams.filter(e => getDaysUntilExam(e.date) >= 0 && getDaysUntilExam(e.date) <= 7).length}
              </div>
              <div style={styles.statLabel}>This Week</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>✅</div>
              <div style={styles.statNumber}>
                {exams.filter(e => getDaysUntilExam(e.date) < 0).length}
              </div>
              <div style={styles.statLabel}>Completed</div>
            </div>
          </div>
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
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
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
  addBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
  },
  content: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "30px",
  },
  message: {
    padding: "12px 20px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontWeight: "500",
    textAlign: "center",
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
  upcomingSection: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    "& h3": {
      margin: "0 0 15px 0",
      color: "#2d3748",
    },
  },
  upcomingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "15px",
  },
  upcomingCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "12px",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
  },
  upcomingDate: {
    textAlign: "center",
    minWidth: "60px",
    padding: "10px",
    background: "linear-gradient(135deg, #f58003, #e65100)",
    borderRadius: "12px",
    color: "white",
  },
  upcomingDay: {
    display: "block",
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  upcomingMonth: {
    fontSize: "0.7rem",
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingSubject: {
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: "4px",
  },
  upcomingTime: {
    fontSize: "0.8rem",
    color: "#718096",
  },
  upcomingRoom: {
    fontSize: "0.75rem",
    color: "#a0aec0",
  },
  upcomingCountdown: {
    padding: "6px 12px",
    borderRadius: "20px",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  noUpcoming: {
    padding: "30px",
    textAlign: "center",
    color: "#718096",
  },
  form: {
    background: "white",
    borderRadius: "16px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  formTitle: {
    margin: "0 0 20px 0",
    color: "#2d3748",
    fontSize: "1.2rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },
  input: {
    padding: "12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
  },
  select: {
    padding: "12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    background: "white",
  },
  formActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  cancelBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  filterSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
    justifyContent: "flex-end",
  },
  filterLabel: {
    color: "white",
    fontWeight: "500",
  },
  filterSelect: {
    padding: "8px 15px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.9)",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "40px",
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
  tableContainer: {
    background: "white",
    borderRadius: "16px",
    overflow: "auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },
  tableHeader: {
    background: "linear-gradient(135deg, #f58003, #e65100)",
  },
  th: {
    padding: "15px",
    textAlign: "left",
    color: "white",
    fontWeight: "600",
  },
  thAction: {
    padding: "15px",
    textAlign: "center",
    color: "white",
    fontWeight: "600",
    width: "80px",
  },
  tableRow: {
    borderBottom: "1px solid #e2e8f0",
    "&:hover": {
      background: "#f8f9fa",
    },
  },
  td: {
    padding: "12px 15px",
    verticalAlign: "middle",
  },
  examTypeBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: "600",
    display: "inline-block",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "20px",
    color: "white",
    fontSize: "0.7rem",
    fontWeight: "600",
    display: "inline-block",
  },
  deleteBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  noData: {
    textAlign: "center",
    padding: "40px",
    color: "#718096",
  },
  noDataIcon: {
    fontSize: "3rem",
    marginBottom: "10px",
  },
  noDataSub: {
    fontSize: "0.8rem",
    marginTop: "5px",
    opacity: 0.7,
  },
  statsSection: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
    marginTop: "30px",
  },
  statCard: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: "16px",
    padding: "20px",
    textAlign: "center",
    backdropFilter: "blur(10px)",
  },
  statIcon: {
    fontSize: "2rem",
    marginBottom: "10px",
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
  
  input:focus, select:focus {
    border-color: #f58003;
    outline: none;
    box-shadow: 0 0 0 3px rgba(245, 128, 3, 0.1);
  }
`;
document.head.appendChild(styleSheet);

export default ExamTimetable;