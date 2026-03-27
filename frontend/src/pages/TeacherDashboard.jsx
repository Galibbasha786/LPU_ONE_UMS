import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import lpuLogo from "../assets/logo.jpg";

function TeacherDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [students, setStudents] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Role guard
  useEffect(() => {
    if (!user || user.role !== "staff") {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch all data on load
  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch students
      const studentsRes = await fetch("http://localhost:5001/api/users/students");
      const studentsData = await studentsRes.json();
      const allStudents = studentsData.students || [];
      
      // Filter students assigned to this teacher based on section
      const teacherSections = user.coursesTeaching?.map(c => c.section) || [];
      const filteredStudents = allStudents.filter(s => teacherSections.includes(s.section));
      setStudents(filteredStudents);
      setAssignedStudents(filteredStudents);
      
      // Set my courses
      setMyCourses(user.coursesTeaching || []);
      
      // Calculate attendance summary
      const attendanceRes = await fetch("http://localhost:5001/api/users/attendance");
      const attendanceData = await attendanceRes.json();
      const records = attendanceData.records || {};
      
      const summary = {};
      filteredStudents.forEach(student => {
        const studentRecords = records[student.email]?.attendanceData || {};
        const total = Object.keys(studentRecords).length;
        const present = Object.values(studentRecords).filter(s => s === 'Present').length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        summary[student.email] = { total, present, percentage };
      });
      setAttendanceSummary(summary);
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/users/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications?.slice(0, 5) || []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const getTodaySchedule = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];
    // This would come from timetable API in production
    return [
      { time: "9:00-10:00", course: "Programming Fundamentals", room: "A101", section: "A" },
      { time: "10:00-11:00", course: "Data Structures", room: "A102", section: "B" },
    ];
  };

  const getAttendancePercentageColor = (percentage) => {
    if (percentage >= 90) return "#10b981";
    if (percentage >= 75) return "#f59e0b";
    return "#ef4444";
  };

  const filteredStudentsList = assignedStudents.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.section?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalStudents: assignedStudents.length,
    totalCourses: myCourses.length,
    averageAttendance: assignedStudents.length > 0 
      ? Math.round(assignedStudents.reduce((sum, s) => sum + (attendanceSummary[s.email]?.percentage || 0), 0) / assignedStudents.length)
      : 0,
    pendingMarks: myCourses.length * assignedStudents.length // Example calculation
  };

  if (!user || user.role !== "staff") return null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={lpuLogo} alt="LPU Logo" style={styles.logo} />
          <div style={styles.headerText}>
            <h1 style={styles.title}>Lovely Professional University</h1>
            <p style={styles.subtitle}>Staff Portal - {user.designation || "Teacher"}</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {user.name?.charAt(0) || "T"}
            </div>
            <div style={styles.userDetails}>
              <span style={styles.welcome}>Welcome, {user.name}</span>
              <span style={styles.userRole}>
                {user.designation || "Staff Member"} | {user.department || "Department"}
              </span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <div style={styles.mainContent}>
        {/* Sidebar */}
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
            <h3 style={styles.sidebarTitle}>📚 My Courses</h3>
            <button 
              style={activeSection === "courses" ? styles.sidebarBtnActive : styles.sidebarBtn}
              onClick={() => setActiveSection("courses")}
            >
              📖 View My Courses
            </button>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>✅ Attendance</h3>
            <button onClick={() => navigate("/attendance")} style={styles.sidebarBtn}>
              📋 Mark Attendance
            </button>
            <button onClick={() => navigate("/attendance-summary")} style={styles.sidebarBtn}>
              📊 View Attendance Summary
            </button>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>📝 Marks</h3>
            <button onClick={() => navigate("/marks")} style={styles.sidebarBtn}>
              ✏️ Enter Marks
            </button>
            <button onClick={() => navigate("/marks-summary")} style={styles.sidebarBtn}>
              📊 View Marks Summary
            </button>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>👨‍🎓 My Students</h3>
            <button 
              style={activeSection === "students" ? styles.sidebarBtnActive : styles.sidebarBtn}
              onClick={() => setActiveSection("students")}
            >
              📋 View Assigned Students
            </button>
          </div>

          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>🗓️ Schedule</h3>
            <button onClick={() => navigate("/class-timetable")} style={styles.sidebarBtn}>
              🏫 My Timetable
            </button>
            <button onClick={() => navigate("/exam-timetable")} style={styles.sidebarBtn}>
              📅 Exam Schedule
            </button>
          </div>
          <div className="sidebar-section">
  <h3 style={styles.sidebarTitle}>🏫 Campus Life</h3>
  <button 
    onClick={() => navigate("/campus-clubs")} 
    style={styles.sidebarBtn}
  >
    🏫 Campus Clubs
  </button>
</div>
          <div style={styles.sidebarSection}>
            <h3 style={styles.sidebarTitle}>🔔 Communication</h3>
            <button onClick={() => navigate("/notifications")} style={styles.sidebarBtn}>
              📢 Send Notifications
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
            <button onClick={() => navigate("/settings")} style={styles.sidebarBtn}>
              ⚙️ Settings
            </button>
          </div>
        </nav>

        {/* Content */}
        <main style={styles.content}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading dashboard...</p>
            </div>
          ) : (
            <>
              {activeSection === "overview" && (
                <div style={styles.overview}>
                  <h2 style={styles.sectionTitle}>📊 Staff Dashboard</h2>
                  
                  {/* Staff Info Card */}
                  <div style={styles.staffInfoCard}>
                    <div style={styles.staffInfoContent}>
                      <h3>{user.name}</h3>
                      <div style={styles.staffInfoGrid}>
                        <p><strong>Employee ID:</strong> {user.employeeId || "N/A"}</p>
                        <p><strong>Department:</strong> {user.department || "N/A"}</p>
                        <p><strong>Designation:</strong> {user.designation || "Assistant Professor"}</p>
                        <p><strong>Qualification:</strong> {user.qualification || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Statistics Cards */}
                  <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>👨‍🎓</div>
                      <div style={styles.statInfo}>
                        <h3 style={styles.statNumber}>{stats.totalStudents}</h3>
                        <p style={styles.statLabel}>My Students</p>
                      </div>
                    </div>
                    
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>📚</div>
                      <div style={styles.statInfo}>
                        <h3 style={styles.statNumber}>{stats.totalCourses}</h3>
                        <p style={styles.statLabel}>My Courses</p>
                      </div>
                    </div>
                    
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>📊</div>
                      <div style={styles.statInfo}>
                        <h3 style={styles.statNumber}>{stats.averageAttendance}%</h3>
                        <p style={styles.statLabel}>Avg Attendance</p>
                      </div>
                    </div>
                    
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>📝</div>
                      <div style={styles.statInfo}>
                        <h3 style={styles.statNumber}>{stats.pendingMarks}</h3>
                        <p style={styles.statLabel}>Pending Marks</p>
                      </div>
                    </div>
                  </div>

                  {/* Today's Schedule */}
                  <div style={styles.scheduleCard}>
                    <h3 style={styles.cardTitle}>📅 Today's Schedule</h3>
                    <div style={styles.scheduleList}>
                      {getTodaySchedule().map((class_item, index) => (
                        <div key={index} style={styles.scheduleItem}>
                          <div style={styles.scheduleTime}>{class_item.time}</div>
                          <div style={styles.scheduleDetails}>
                            <div style={styles.scheduleCourse}>{class_item.course}</div>
                            <div style={styles.scheduleMeta}>Room: {class_item.room} | Section: {class_item.section}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* My Courses */}
                  <div style={styles.coursesCard}>
                    <h3 style={styles.cardTitle}>📖 My Courses</h3>
                    <div style={styles.coursesGrid}>
                      {myCourses.map((course, index) => (
                        <div key={index} style={styles.courseCard}>
                          <div style={styles.courseCode}>{course.courseId}</div>
                          <div style={styles.courseName}>{course.courseName}</div>
                          <div style={styles.courseMeta}>Semester {course.semester} | Section {course.section}</div>
                          <button 
                            onClick={() => navigate("/attendance")}
                            style={styles.courseBtn}
                          >
                            Mark Attendance
                          </button>
                        </div>
                      ))}
                      {myCourses.length === 0 && (
                        <p style={styles.noDataText}>No courses assigned yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div style={styles.quickActions}>
                    <h3 style={styles.cardTitle}>🚀 Quick Actions</h3>
                    <div style={styles.actionGrid}>
                      <button onClick={() => navigate("/attendance")} style={styles.actionBtn}>
                        <span style={styles.actionIcon}>✅</span>
                        <span>Mark Attendance</span>
                      </button>
                      <button onClick={() => navigate("/marks")} style={styles.actionBtn}>
                        <span style={styles.actionIcon}>📝</span>
                        <span>Enter Marks</span>
                      </button>
                      <button onClick={() => navigate("/notifications")} style={styles.actionBtn}>
                        <span style={styles.actionIcon}>📢</span>
                        <span>Send Notification</span>
                      </button>
                      <button onClick={() => navigate("/class-timetable")} style={styles.actionBtn}>
                        <span style={styles.actionIcon}>🏫</span>
                        <span>My Schedule</span>
                      </button>
                    </div>
                  </div>

                  {/* Recent Notifications */}
                  <div style={styles.notificationsCard}>
                    <h3 style={styles.cardTitle}>🔔 Recent Notifications</h3>
                    <div style={styles.notificationsList}>
                      {notifications.length > 0 ? (
                        notifications.map((note, index) => (
                          <div key={index} style={styles.notificationItem}>
                            <div style={styles.notificationIcon}>📢</div>
                            <div style={styles.notificationContent}>
                              <div style={styles.notificationTitle}>{note.title || "Announcement"}</div>
                              <div style={styles.notificationMessage}>{note.message}</div>
                              <div style={styles.notificationDate}>
                                {new Date(note.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={styles.noDataText}>No recent notifications</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "courses" && (
                <div style={styles.coursesSection}>
                  <h2 style={styles.sectionTitle}>📚 My Courses</h2>
                  <div style={styles.coursesGridLarge}>
                    {myCourses.map((course, index) => (
                      <div key={index} style={styles.courseCardLarge}>
                        <div style={styles.courseHeaderLarge}>
                          <div style={styles.courseCodeLarge}>{course.courseId}</div>
                          <div style={styles.courseCredit}>3 Credits</div>
                        </div>
                        <div style={styles.courseNameLarge}>{course.courseName}</div>
                        <div style={styles.courseMetaLarge}>
                          <span>Semester: {course.semester}</span>
                          <span>Section: {course.section}</span>
                        </div>
                        <div style={styles.courseActions}>
                          <button onClick={() => navigate("/attendance")} style={styles.courseActionBtn}>
                            📋 Attendance
                          </button>
                          <button onClick={() => navigate("/marks")} style={styles.courseActionBtn}>
                            📝 Marks
                          </button>
                          <button onClick={() => navigate("/materials")} style={styles.courseActionBtn}>
                            📚 Materials
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === "students" && (
                <div style={styles.studentsSection}>
                  <h2 style={styles.sectionTitle}>👨‍🎓 My Students</h2>
                  <div style={styles.searchBox}>
                    <input
                      type="text"
                      placeholder="🔍 Search by name, email, or section..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={styles.searchInput}
                    />
                    <span style={styles.resultCount}>
                      {filteredStudentsList.length} / {assignedStudents.length} students
                    </span>
                  </div>
                  <div style={styles.studentsGrid}>
                    {filteredStudentsList.map((student) => {
                      const attendance = attendanceSummary[student.email] || { total: 0, present: 0, percentage: 0 };
                      return (
                        <div key={student._id || student.email} style={styles.studentCard}>
                          <div style={styles.studentAvatarLarge}>
                            {student.name?.charAt(0).toUpperCase()}
                          </div>
                          <div style={styles.studentInfo}>
                            <div style={styles.studentNameLarge}>{student.name}</div>
                            <div style={styles.studentEmailLarge}>{student.email}</div>
                            <div style={styles.studentDetailsLarge}>
                              <span>Enrollment: {student.enrollmentId || "N/A"}</span>
                              <span>Section: {student.section || "N/A"}</span>
                            </div>
                            <div style={styles.attendanceBar}>
                              <div style={{
                                ...styles.attendanceFill,
                                width: `${attendance.percentage}%`,
                                backgroundColor: getAttendancePercentageColor(attendance.percentage)
                              }}></div>
                              <span style={styles.attendanceText}>{attendance.percentage}%</span>
                            </div>
                            <div style={styles.studentActions}>
                              <button 
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setShowProfileModal(true);
                                }}
                                style={styles.viewBtn}
                              >
                                View Profile
                              </button>
                              <button 
                                onClick={() => navigate("/attendance")}
                                style={styles.markBtn}
                              >
                                Mark Attendance
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Student Profile Modal */}
      {showProfileModal && selectedStudent && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Student Profile</h3>
              <button onClick={() => setShowProfileModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalAvatar}>
                {selectedStudent.name?.charAt(0).toUpperCase()}
              </div>
              <div style={styles.modalInfo}>
                <p><strong>Name:</strong> {selectedStudent.name}</p>
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>Enrollment ID:</strong> {selectedStudent.enrollmentId || "N/A"}</p>
                <p><strong>Department:</strong> {selectedStudent.department || "N/A"}</p>
                <p><strong>Semester:</strong> {selectedStudent.semester || "N/A"}</p>
                <p><strong>Section:</strong> {selectedStudent.section || "N/A"}</p>
                <p><strong>CGPA:</strong> {selectedStudent.cgpa || "N/A"}</p>
                <p><strong>Phone:</strong> {selectedStudent.phoneNumber || "N/A"}</p>
              </div>
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
    background: "rgba(240, 125, 1, 1)",
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
    width: "300px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "1.5rem",
    borderRight: "1px solid #e1e8ed",
    overflowY: "auto",
    maxHeight: "calc(100vh - 100px)",
  },
  sidebarSection: {
    marginBottom: "1.5rem",
  },
  sidebarTitle: {
    fontSize: "0.85rem",
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
    padding: "0.7rem 1rem",
    textAlign: "left",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "0.3rem",
    fontSize: "0.9rem",
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
    padding: "0.7rem 1rem",
    textAlign: "left",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "0.3rem",
    fontSize: "0.9rem",
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
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #f58003",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "1.5rem",
  },
  staffInfoCard: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    borderLeft: "4px solid #f58003",
  },
  staffInfoContent: {
    "& h3": {
      margin: "0 0 0.5rem 0",
      color: "#2c3e50",
    }
  },
  staffInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statCard: {
    background: "white",
    padding: "1.2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  statIcon: {
    fontSize: "2rem",
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    margin: 0,
    color: "#2c3e50",
  },
  statLabel: {
    margin: 0,
    color: "#7f8c8d",
    fontSize: "0.85rem",
  },
  scheduleCard: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  cardTitle: {
    margin: "0 0 1rem 0",
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#2c3e50",
  },
  scheduleList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  scheduleItem: {
    display: "flex",
    gap: "1rem",
    padding: "0.8rem",
    background: "#f8f9fa",
    borderRadius: "8px",
  },
  scheduleTime: {
    fontWeight: "600",
    color: "#f58003",
    minWidth: "100px",
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleCourse: {
    fontWeight: "500",
    color: "#2c3e50",
  },
  scheduleMeta: {
    fontSize: "0.8rem",
    color: "#7f8c8d",
  },
  coursesCard: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  coursesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1rem",
  },
  courseCard: {
    background: "#f8f9fa",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #e1e8ed",
  },
  courseCode: {
    fontWeight: "bold",
    color: "#f58003",
    fontSize: "0.9rem",
    marginBottom: "0.3rem",
  },
  courseName: {
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "0.3rem",
  },
  courseMeta: {
    fontSize: "0.8rem",
    color: "#7f8c8d",
    marginBottom: "0.5rem",
  },
  courseBtn: {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  quickActions: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
  },
  actionBtn: {
    background: "white",
    border: "2px solid #e1e8ed",
    padding: "1rem",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#2c3e50",
  },
  actionIcon: {
    fontSize: "1.5rem",
  },
  notificationsCard: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  notificationsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  notificationItem: {
    display: "flex",
    gap: "1rem",
    padding: "0.8rem",
    background: "#f8f9fa",
    borderRadius: "8px",
  },
  notificationIcon: {
    fontSize: "1.2rem",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "0.2rem",
  },
  notificationMessage: {
    fontSize: "0.9rem",
    color: "#7f8c8d",
  },
  notificationDate: {
    fontSize: "0.7rem",
    color: "#bdc3c7",
    marginTop: "0.2rem",
  },
  noDataText: {
    textAlign: "center",
    color: "#7f8c8d",
    padding: "1rem",
  },
  // Courses Section Styles
  coursesSection: {
    width: "100%",
  },
  coursesGridLarge: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  courseCardLarge: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  courseHeaderLarge: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  courseCodeLarge: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#f58003",
  },
  courseCredit: {
    fontSize: "0.8rem",
    color: "#7f8c8d",
  },
  courseNameLarge: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "0.5rem",
  },
  courseMetaLarge: {
    display: "flex",
    gap: "1rem",
    fontSize: "0.8rem",
    color: "#7f8c8d",
    marginBottom: "1rem",
  },
  courseActions: {
    display: "flex",
    gap: "0.5rem",
  },
  courseActionBtn: {
    flex: 1,
    background: "#ecf0f1",
    border: "none",
    padding: "0.5rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  // Students Section Styles
  studentsSection: {
    width: "100%",
  },
  searchBox: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    padding: "0.8rem",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    fontSize: "0.9rem",
    outline: "none",
  },
  resultCount: {
    padding: "0.5rem 1rem",
    background: "#f8f9fa",
    borderRadius: "20px",
    fontSize: "0.85rem",
    color: "#7f8c8d",
  },
  studentsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "1rem",
  },
  studentCard: {
    background: "white",
    padding: "1rem",
    borderRadius: "12px",
    display: "flex",
    gap: "1rem",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  studentAvatarLarge: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f58003, #f58003)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  studentInfo: {
    flex: 1,
  },
  studentNameLarge: {
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "0.2rem",
  },
  studentEmailLarge: {
    fontSize: "0.8rem",
    color: "#7f8c8d",
    marginBottom: "0.2rem",
  },
  studentDetailsLarge: {
    display: "flex",
    gap: "1rem",
    fontSize: "0.75rem",
    color: "#7f8c8d",
    marginBottom: "0.5rem",
  },
  attendanceBar: {
    position: "relative",
    height: "6px",
    background: "#e1e8ed",
    borderRadius: "3px",
    marginBottom: "0.5rem",
    overflow: "hidden",
  },
  attendanceFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },
  attendanceText: {
    position: "absolute",
    right: "0",
    top: "-1.2rem",
    fontSize: "0.7rem",
    fontWeight: "600",
  },
  studentActions: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  viewBtn: {
    background: "#ecf0f1",
    border: "none",
    padding: "0.3rem 0.8rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.75rem",
  },
  markBtn: {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "0.3rem 0.8rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.75rem",
  },
  // Modal Styles
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "white",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "80vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #e1e8ed",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#7f8c8d",
  },
  modalBody: {
    padding: "1.5rem",
    display: "flex",
    gap: "1rem",
  },
  modalAvatar: {
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
  modalInfo: {
    flex: 1,
    "& p": {
      margin: "0.3rem 0",
      fontSize: "0.9rem",
    },
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
`;
document.head.appendChild(styleSheet);

export default TeacherDashboard;