import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ClassTimetable() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [subject, setSubject] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [teacher, setTeacher] = useState("");
  const [selectedDay, setSelectedDay] = useState("all");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const isAdmin = user?.role === "Admin";
  const isStaff = user?.role === "staff";
  const isStudent = user?.role === "Student";

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  // Fetch all scheduled classes
  useEffect(() => {
    fetchClasses();
  }, []);

  // Filter classes based on selected day
  useEffect(() => {
    if (selectedDay === "all") {
      setFilteredClasses(classes);
    } else {
      setFilteredClasses(classes.filter(c => c.day === selectedDay));
    }
  }, [selectedDay, classes]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/users/classes");
      const data = await res.json();
      setClasses(data.classes || []);
      setFilteredClasses(data.classes || []);
    } catch (err) {
      console.error("Error loading classes:", err);
      showMessage("⚠️ Failed to load timetable", "error");
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

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!subject || !day || !time) {
      showMessage("❌ Please fill all required fields!", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/users/add-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subject, 
          day, 
          time,
          endTime,
          room,
          teacher: teacher || user?.name
        }),
      });

      const data = await res.json();
      if (data.success) {
        showMessage("✅ Class added successfully!", "success");
        fetchClasses();
        setSubject("");
        setDay("");
        setTime("");
        setEndTime("");
        setRoom("");
        setTeacher("");
        setShowForm(false);
      } else {
        showMessage("❌ Failed to add class: " + data.message, "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("⚠️ Server error while adding class.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (subjectToDelete, dayToDelete) => {
    if (!window.confirm(`Delete class: ${subjectToDelete} on ${dayToDelete}?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/users/delete-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subjectToDelete }),
      });
      const data = await res.json();

      if (data.success) {
        showMessage(`🗑️ Deleted class: ${subjectToDelete}`, "success");
        fetchClasses();
      } else {
        showMessage("❌ Failed to delete class.", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("⚠️ Server error while deleting class.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getTodayClasses = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return classes.filter(c => c.day === today);
  };

  const getDayColor = (day) => {
    const colors = {
      Monday: "#fef3c7",
      Tuesday: "#e0e7ff",
      Wednesday: "#dcfce7",
      Thursday: "#ffe4e6",
      Friday: "#cffafe",
      Saturday: "#f3e8ff",
      Sunday: "#ffedd5"
    };
    return colors[day] || "#f8f9fa";
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate(isAdmin ? "/admin-dashboard" : isStaff ? "/teacher-dashboard" : "/student-dashboard")} style={styles.backBtn}>
              ← Back to Dashboard
            </button>
            <h1 style={styles.title}>🏫 Class Timetable</h1>
            <p style={styles.subtitle}>View and manage your class schedule</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
              {showForm ? "− Cancel" : "+ Add Class"}
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

        {/* Today's Classes Section */}
        <div style={styles.todaySection}>
          <h3>📅 Today's Classes</h3>
          <div style={styles.todayClasses}>
            {getTodayClasses().length > 0 ? (
              getTodayClasses().map((c, i) => (
                <div key={i} style={styles.todayCard}>
                  <div style={styles.todayTime}>{c.time} {c.endTime && `- ${c.endTime}`}</div>
                  <div style={styles.todaySubject}>{c.subject}</div>
                  {c.room && <div style={styles.todayRoom}>📍 Room: {c.room}</div>}
                </div>
              ))
            ) : (
              <div style={styles.noToday}>No classes scheduled for today</div>
            )}
          </div>
        </div>

        {/* Add Class Form (Admin Only) */}
        {isAdmin && showForm && (
          <form onSubmit={handleAddClass} style={styles.form}>
            <h3 style={styles.formTitle}>Add New Class</h3>
            <div style={styles.formGrid}>
              <input
                type="text"
                placeholder="Subject Name *"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={styles.input}
                required
              />
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                style={styles.select}
                required
              >
                <option value="">Select Day *</option>
                {daysOfWeek.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={styles.input}
                required
                placeholder="Start Time"
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={styles.input}
                placeholder="End Time (Optional)"
              />
              <input
                type="text"
                placeholder="Room Number"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Teacher Name"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formActions}>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? "Adding..." : "➕ Add Class"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Day Filter */}
        <div style={styles.filterSection}>
          <div style={styles.filterButtons}>
            <button
              onClick={() => setSelectedDay("all")}
              style={{...styles.filterBtn, ...(selectedDay === "all" ? styles.filterBtnActive : {})}}
            >
              All Days
            </button>
            {daysOfWeek.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{...styles.filterBtn, ...(selectedDay === day ? styles.filterBtnActive : {})}}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading timetable...</p>
          </div>
        )}

        {/* Timetable - Week View */}
        {!loading && (
          <div style={styles.timetableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Time / Day</th>
                  {daysOfWeek.map(day => (
                    <th key={day} style={styles.th}>{day}</th>
                  ))}
                  {isAdmin && <th style={styles.thAction}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot}>
                    <td style={styles.tdTime}>{slot}</td>
                    {daysOfWeek.map(day => {
                      const classAtSlot = classes.find(c => 
                        c.day === day && c.time === slot
                      );
                      return (
                        <td key={day} style={{...styles.td, backgroundColor: getDayColor(day)}}>
                          {classAtSlot ? (
                            <div style={styles.classCard}>
                              <div style={styles.classSubject}>{classAtSlot.subject}</div>
                              {classAtSlot.room && <div style={styles.classRoom}>{classAtSlot.room}</div>}
                              {classAtSlot.teacher && <div style={styles.classTeacher}>{classAtSlot.teacher}</div>}
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteClass(classAtSlot.subject, classAtSlot.day)}
                                  style={styles.deleteBtnSmall}
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          ) : (
                            <div style={styles.emptySlot}>—</div>
                          )}
                        </td>
                      );
                    })}
                    {isAdmin && <td style={styles.tdAction}></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* List View for Mobile */}
        <div style={styles.listView}>
          <h3>📋 Class List</h3>
          {filteredClasses.length === 0 ? (
            <div style={styles.noData}>No classes scheduled</div>
          ) : (
            filteredClasses.map((c, index) => (
              <div key={index} style={styles.classListItem}>
                <div style={styles.listItemHeader}>
                  <span style={styles.listSubject}>{c.subject}</span>
                  <span style={styles.listDay}>{c.day}</span>
                </div>
                <div style={styles.listItemDetails}>
                  <span>🕐 {c.time}</span>
                  {c.room && <span>📍 {c.room}</span>}
                  {c.teacher && <span>👨‍🏫 {c.teacher}</span>}
                </div>
                {isAdmin && (
                  <button onClick={() => handleDeleteClass(c.subject, c.day)} style={styles.deleteBtnSmall}>
                    Delete
                  </button>
                )}
              </div>
            ))
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
  todaySection: {
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
  todayClasses: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },
  todayCard: {
    background: "linear-gradient(135deg, #f58003, #e65100)",
    color: "white",
    padding: "15px 20px",
    borderRadius: "12px",
    minWidth: "150px",
  },
  todayTime: {
    fontSize: "0.8rem",
    opacity: 0.9,
    marginBottom: "5px",
  },
  todaySubject: {
    fontSize: "1rem",
    fontWeight: "bold",
    marginBottom: "5px",
  },
  todayRoom: {
    fontSize: "0.75rem",
    opacity: 0.8,
  },
  noToday: {
    color: "#718096",
    padding: "20px",
    textAlign: "center",
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
    marginBottom: "20px",
  },
  filterButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  filterBtn: {
    background: "rgba(255,255,255,0.9)",
    border: "none",
    padding: "8px 16px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  filterBtnActive: {
    background: "#f58003",
    color: "white",
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
  timetableContainer: {
    background: "white",
    borderRadius: "16px",
    overflow: "auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    display: "block",
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
    textAlign: "center",
    color: "white",
    fontWeight: "600",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  thAction: {
    padding: "15px",
    textAlign: "center",
    color: "white",
    fontWeight: "600",
    width: "80px",
  },
  td: {
    padding: "12px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
    verticalAlign: "top",
    minHeight: "80px",
  },
  tdTime: {
    padding: "12px",
    textAlign: "center",
    backgroundColor: "#f8f9fa",
    fontWeight: "600",
    border: "1px solid #e2e8f0",
    position: "sticky",
    left: 0,
    background: "#f8f9fa",
  },
  tdAction: {
    padding: "12px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
    width: "80px",
  },
  classCard: {
    position: "relative",
    padding: "8px",
    borderRadius: "8px",
    background: "rgba(245, 128, 3, 0.1)",
    textAlign: "center",
  },
  classSubject: {
    fontWeight: "bold",
    color: "#f58003",
    marginBottom: "4px",
    fontSize: "0.85rem",
  },
  classRoom: {
    fontSize: "0.7rem",
    color: "#718096",
  },
  classTeacher: {
    fontSize: "0.7rem",
    color: "#4a5568",
  },
  emptySlot: {
    color: "#cbd5e0",
    fontSize: "0.8rem",
  },
  deleteBtnSmall: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.7rem",
    marginTop: "5px",
    width: "100%",
  },
  listView: {
    display: "none",
    marginTop: "30px",
    "& h3": {
      marginBottom: "15px",
      color: "white",
    },
  },
  noData: {
    background: "rgba(255,255,255,0.95)",
    padding: "40px",
    textAlign: "center",
    borderRadius: "12px",
    color: "#718096",
  },
  classListItem: {
    background: "white",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  listItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  listSubject: {
    fontWeight: "bold",
    color: "#f58003",
  },
  listDay: {
    color: "#718096",
    fontSize: "0.85rem",
  },
  listItemDetails: {
    display: "flex",
    gap: "15px",
    fontSize: "0.85rem",
    color: "#4a5568",
    marginBottom: "10px",
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
  
  @media (max-width: 768px) {
    .timetable-container {
      display: none;
    }
    .list-view {
      display: block;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ClassTimetable;