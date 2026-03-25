import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Schedule() {
  const navigate = useNavigate();
  const [type, setType] = useState("class");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [room, setRoom] = useState("");
  const [description, setDescription] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const isAdmin = user?.role === "Admin";
  const isStaff = user?.role === "staff";
  const isStudent = user?.role === "Student";

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/users/schedules");
      const data = await res.json();
      const schedulesList = data.schedules || [];
      setSchedules(schedulesList);
      setFilteredSchedules(schedulesList);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      showMessage("⚠️ Failed to load schedules", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    filterSchedules();
  }, [activeTab, schedules]);

  const filterSchedules = () => {
    if (activeTab === "all") {
      setFilteredSchedules(schedules);
    } else {
      setFilteredSchedules(schedules.filter(s => s.type === activeTab));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject || !date || !time) {
      showMessage("❌ Please fill all required fields!", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/users/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type, 
          subject, 
          date, 
          time,
          endTime,
          room,
          description
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        showMessage(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} scheduled successfully!`, "success");
        fetchSchedules();
        setSubject("");
        setDate("");
        setTime("");
        setEndTime("");
        setRoom("");
        setDescription("");
        setShowForm(false);
      } else {
        showMessage("❌ Failed to schedule: " + data.message, "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("⚠️ Server error while scheduling", "error");
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case "class": return "#10b981";
      case "exam": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "class": return "📚";
      case "exam": return "📝";
      default: return "📅";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isUpcoming = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const upcomingSchedules = schedules.filter(s => isUpcoming(s.date)).slice(0, 5);
  const pastSchedules = schedules.filter(s => !isUpcoming(s.date));

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
            <h1 style={styles.title}>📅 Schedule Manager</h1>
            <p style={styles.subtitle}>Schedule and manage classes and exams</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
              {showForm ? "− Cancel" : "+ Add Schedule"}
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

        {/* Upcoming Schedules Section */}
        <div style={styles.upcomingSection}>
          <h3>⏰ Upcoming Schedules</h3>
          <div style={styles.upcomingGrid}>
            {upcomingSchedules.length > 0 ? (
              upcomingSchedules.map((schedule, i) => (
                <div key={i} style={styles.upcomingCard}>
                  <div style={{...styles.upcomingType, backgroundColor: getTypeColor(schedule.type)}}>
                    {getTypeIcon(schedule.type)} {schedule.type.toUpperCase()}
                  </div>
                  <div style={styles.upcomingSubject}>{schedule.subject}</div>
                  <div style={styles.upcomingDateTime}>
                    <span>📅 {formatDate(schedule.date)}</span>
                    <span>⏰ {schedule.time}</span>
                  </div>
                  {schedule.room && <div style={styles.upcomingRoom}>📍 Room: {schedule.room}</div>}
                </div>
              ))
            ) : (
              <div style={styles.noUpcoming}>No upcoming schedules</div>
            )}
          </div>
        </div>

        {/* Add Schedule Form (Admin Only) */}
        {isAdmin && showForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.formTitle}>Add New Schedule</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Schedule Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={styles.select}
                >
                  <option value="class">📚 Class</option>
                  <option value="exam">📝 Exam</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Subject/Course *</label>
                <input
                  type="text"
                  placeholder="Enter subject name"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Start Time *</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Room/Location</label>
                <input
                  type="text"
                  placeholder="e.g., Room 101, Online"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  placeholder="Additional notes or instructions"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={styles.textarea}
                  rows="2"
                />
              </div>
            </div>
            <div style={styles.formActions}>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? "Scheduling..." : "➕ Add Schedule"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab("all")}
            style={{...styles.tab, ...(activeTab === "all" ? styles.tabActive : {})}}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("class")}
            style={{...styles.tab, ...(activeTab === "class" ? styles.tabActive : {})}}
          >
            📚 Classes
          </button>
          <button
            onClick={() => setActiveTab("exam")}
            style={{...styles.tab, ...(activeTab === "exam" ? styles.tabActive : {})}}
          >
            📝 Exams
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading schedules...</p>
          </div>
        )}

        {/* Schedule List */}
        {!loading && (
          <div style={styles.scheduleContainer}>
            {filteredSchedules.length === 0 ? (
              <div style={styles.noData}>
                <div style={styles.noDataIcon}>📅</div>
                <p>No schedules found</p>
                {isAdmin && <p style={styles.noDataSub}>Click "Add Schedule" to create a new schedule</p>}
              </div>
            ) : (
              filteredSchedules.map((schedule, index) => {
                const isUpcomingEvent = isUpcoming(schedule.date);
                return (
                  <div key={index} style={styles.scheduleCard}>
                    <div style={styles.scheduleHeader}>
                      <div style={{...styles.scheduleType, backgroundColor: getTypeColor(schedule.type)}}>
                        {getTypeIcon(schedule.type)} {schedule.type.toUpperCase()}
                      </div>
                      <div style={styles.scheduleStatus}>
                        {isUpcomingEvent ? (
                          <span style={styles.statusUpcoming}>Upcoming</span>
                        ) : (
                          <span style={styles.statusPast}>Past</span>
                        )}
                      </div>
                    </div>
                    <div style={styles.scheduleBody}>
                      <h3 style={styles.scheduleSubject}>{schedule.subject}</h3>
                      <div style={styles.scheduleDetails}>
                        <div style={styles.detailItem}>
                          <span style={styles.detailIcon}>📅</span>
                          <span>{formatDate(schedule.date)}</span>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailIcon}>⏰</span>
                          <span>{schedule.time} {schedule.endTime && `- ${schedule.endTime}`}</span>
                        </div>
                        {schedule.room && (
                          <div style={styles.detailItem}>
                            <span style={styles.detailIcon}>📍</span>
                            <span>{schedule.room}</span>
                          </div>
                        )}
                      </div>
                      {schedule.description && (
                        <div style={styles.scheduleDescription}>
                          📝 {schedule.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Statistics */}
        {schedules.length > 0 && (
          <div style={styles.statsSection}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📚</div>
              <div style={styles.statNumber}>{schedules.filter(s => s.type === "class").length}</div>
              <div style={styles.statLabel}>Total Classes</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📝</div>
              <div style={styles.statNumber}>{schedules.filter(s => s.type === "exam").length}</div>
              <div style={styles.statLabel}>Total Exams</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>⏰</div>
              <div style={styles.statNumber}>{upcomingSchedules.length}</div>
              <div style={styles.statLabel}>Upcoming</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📅</div>
              <div style={styles.statNumber}>{pastSchedules.length}</div>
              <div style={styles.statLabel}>Past Events</div>
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
    maxWidth: "1200px",
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
    maxWidth: "1200px",
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
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "15px",
  },
  upcomingCard: {
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "12px",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
  },
  upcomingType: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    color: "white",
    fontSize: "0.7rem",
    fontWeight: "600",
    marginBottom: "10px",
  },
  upcomingSubject: {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: "8px",
  },
  upcomingDateTime: {
    display: "flex",
    gap: "15px",
    fontSize: "0.8rem",
    color: "#718096",
    marginBottom: "5px",
  },
  upcomingRoom: {
    fontSize: "0.75rem",
    color: "#a0aec0",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: "600",
    color: "#2d3748",
    fontSize: "0.85rem",
  },
  input: {
    padding: "10px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
  },
  select: {
    padding: "10px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    background: "white",
  },
  textarea: {
    padding: "10px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    resize: "vertical",
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
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    borderBottom: "2px solid rgba(255,255,255,0.3)",
    paddingBottom: "10px",
  },
  tab: {
    background: "none",
    border: "none",
    padding: "10px 20px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    color: "white",
    borderRadius: "8px",
    transition: "all 0.3s ease",
  },
  tabActive: {
    background: "rgba(255,255,255,0.2)",
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
  scheduleContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "30px",
  },
  scheduleCard: {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  },
  scheduleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    background: "#f8f9fa",
    borderBottom: "1px solid #e2e8f0",
  },
  scheduleType: {
    padding: "4px 12px",
    borderRadius: "20px",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  scheduleStatus: {
    fontSize: "0.7rem",
    fontWeight: "500",
  },
  statusUpcoming: {
    color: "#10b981",
  },
  statusPast: {
    color: "#a0aec0",
  },
  scheduleBody: {
    padding: "20px",
  },
  scheduleSubject: {
    margin: "0 0 12px 0",
    fontSize: "1.1rem",
    color: "#2d3748",
  },
  scheduleDetails: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "12px",
  },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.85rem",
    color: "#718096",
  },
  detailIcon: {
    fontSize: "1rem",
  },
  scheduleDescription: {
    padding: "10px",
    background: "#f8f9fa",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "#4a5568",
    marginTop: "10px",
  },
  noData: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: "16px",
    padding: "40px",
    textAlign: "center",
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
    gap: "15px",
    marginTop: "20px",
  },
  statCard: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: "12px",
    padding: "15px",
    textAlign: "center",
    backdropFilter: "blur(10px)",
  },
  statIcon: {
    fontSize: "1.5rem",
    marginBottom: "8px",
  },
  statNumber: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#2d3748",
  },
  statLabel: {
    fontSize: "0.7rem",
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
  
  input:focus, select:focus, textarea:focus {
    border-color: #f58003;
    outline: none;
    box-shadow: 0 0 0 3px rgba(245, 128, 3, 0.1);
  }
`;
document.head.appendChild(styleSheet);

export default Schedule;