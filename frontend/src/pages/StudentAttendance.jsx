import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentAttendance() {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [showCalendar, setShowCalendar] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || user.role !== "Student") {
    return (
      <div style={styles.accessDenied}>
        <h2>⛔ Access Denied</h2>
        <p>Only students can view attendance.</p>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          ← Go Back to Login
        </button>
      </div>
    );
  }

  // Fetch student's detailed attendance data
  useEffect(() => {
    fetchStudentAttendance();
    
    // Set up real-time updates (polling every 30 seconds)
    const interval = setInterval(fetchStudentAttendance, 30000);
    return () => clearInterval(interval);
  }, [user.email]);

  const fetchStudentAttendance = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/users/attendance/student/${user.email}`);
      const data = await res.json();
      
      if (data.success) {
        setAttendanceData(data.attendance);
      } else {
        console.error("Failed to fetch attendance data");
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from attendance records
  const calculateStats = () => {
    if (!attendanceData?.records) return { present: 0, absent: 0, total: 0, percentage: 0 };
    
    const records = attendanceData.records;
    const dates = Object.keys(records);
    const present = dates.filter(date => records[date] === 'Present').length;
    const total = dates.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { present, absent: total - present, total, percentage };
  };

  // Get recent attendance (last 7 days)
  const getRecentAttendance = () => {
    if (!attendanceData?.records) return [];
    
    const records = attendanceData.records;
    const dates = Object.keys(records).sort().reverse().slice(0, 7);
    
    return dates.map(date => ({
      date,
      status: records[date],
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  };

  // Get monthly breakdown
  const getMonthlyStats = () => {
    if (!attendanceData?.records) return [];
    
    const records = attendanceData.records;
    const monthlyData = {};
    
    Object.keys(records).forEach(date => {
      const month = new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { present: 0, total: 0 };
      }
      monthlyData[month].total++;
      if (records[date] === 'Present') {
        monthlyData[month].present++;
      }
    });
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        percentage: Math.round((data.present / data.total) * 100),
        present: data.present,
        total: data.total
      }))
      .sort((a, b) => new Date(b.month) - new Date(a.month))
      .slice(0, 6);
  };

  // Get filtered attendance by month
  const getFilteredAttendance = () => {
    if (!attendanceData?.records) return [];
    
    const records = attendanceData.records;
    let filteredDates = Object.keys(records);
    
    if (selectedMonth !== "all") {
      filteredDates = filteredDates.filter(date => {
        const month = new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        return month === selectedMonth;
      });
    }
    
    return filteredDates
      .sort()
      .reverse()
      .map(date => ({
        date,
        status: records[date],
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
        fullDate: new Date(date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      }));
  };

  // Get all attendance history
  const getAllAttendance = () => {
    if (!attendanceData?.records) return [];
    
    const records = attendanceData.records;
    return Object.keys(records)
      .sort()
      .reverse()
      .map(date => ({
        date,
        status: records[date],
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
        fullDate: new Date(date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      }));
  };

  // Generate calendar data
  const generateCalendarData = () => {
    if (!attendanceData?.records) return [];
    
    const records = attendanceData.records;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendar = [];
    let day = 1;
    
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startingDayOfWeek) {
          week.push(null);
        } else if (day > daysInMonth) {
          week.push(null);
        } else {
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const status = records[dateStr];
          week.push({ day, date: dateStr, status: status || 'Not Marked' });
          day++;
        }
      }
      calendar.push(week);
      if (day > daysInMonth) break;
    }
    
    return calendar;
  };

  const stats = calculateStats();
  const recentAttendance = getRecentAttendance();
  const monthlyStats = getMonthlyStats();
  const allAttendance = getAllAttendance();
  const filteredAttendance = getFilteredAttendance();
  const calendarData = generateCalendarData();
  const months = ["all", ...monthlyStats.map(m => m.month)];

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return "#10b981";
    if (percentage >= 75) return "#f59e0b";
    return "#ef4444";
  };

  const getStatusBadge = (status) => {
    return {
      background: status === "Present" ? "#10b981" : status === "Absent" ? "#ef4444" : "#6b7280",
      color: "white",
      padding: "8px 16px",
      borderRadius: "20px",
      fontSize: "0.85rem",
      fontWeight: "600",
      display: "inline-block",
      minWidth: "80px",
      textAlign: "center"
    };
  };

  const getAttendanceStatus = () => {
    if (stats.percentage >= 90) {
      return { 
        status: "Excellent", 
        emoji: "🎉", 
        message: "Outstanding attendance! Keep up the great work.",
        color: "#10b981" 
      };
    } else if (stats.percentage >= 75) {
      return { 
        status: "Good", 
        emoji: "👍", 
        message: "Good attendance. You're doing well!",
        color: "#f59e0b" 
      };
    } else {
      return { 
        status: "Needs Improvement", 
        emoji: "⚠️", 
        message: "Your attendance needs improvement. Try to attend more classes.",
        color: "#ef4444" 
      };
    }
  };

  const getRequiredAttendance = () => {
    const requiredFor75 = Math.ceil(0.75 * stats.total);
    const needed = requiredFor75 - stats.present;
    return needed > 0 ? needed : 0;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading your attendance data...</p>
        </div>
      </div>
    );
  }

  const attendanceStatus = getAttendanceStatus();

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate("/student-dashboard")} style={styles.backBtn}>
              ← Back to Dashboard
            </button>
            <h1 style={styles.title}>📊 Attendance Dashboard</h1>
            <p style={styles.subtitle}>Track your attendance performance in real-time</p>
          </div>
          <div style={styles.profileSection}>
            <div style={styles.avatar}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={styles.profileInfo}>
              <div style={styles.studentName}>{user.name}</div>
              <div style={styles.studentDetails}>
                {user.section && <span style={styles.section}>{user.section}</span>}
                <span style={styles.email}>{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div style={styles.tabContainer}>
        <button 
          style={{...styles.tab, ...(activeTab === "overview" ? styles.activeTab : {})}}
          onClick={() => setActiveTab("overview")}
        >
          📈 Overview
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === "history" ? styles.activeTab : {})}}
          onClick={() => setActiveTab("history")}
        >
          📅 Full History
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === "calendar" ? styles.activeTab : {})}}
          onClick={() => setActiveTab("calendar")}
        >
          📆 Calendar View
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === "analytics" ? styles.activeTab : {})}}
          onClick={() => setActiveTab("analytics")}
        >
          📊 Analytics
        </button>
      </div>

      <div style={styles.content}>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Status Card */}
            <div style={styles.statusCard}>
              <div style={styles.statusHeader}>
                <div style={styles.statusEmoji}>{attendanceStatus.emoji}</div>
                <div>
                  <h3 style={styles.statusTitle}>Attendance Status</h3>
                  <p style={styles.statusMessage}>{attendanceStatus.message}</p>
                </div>
              </div>
              <div style={styles.statusPercentage}>
                <span style={{...styles.percentageLarge, color: attendanceStatus.color}}>
                  {stats.percentage}%
                </span>
                <span style={styles.percentageLabel}>Overall Attendance</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>✅</div>
                <div style={styles.statContent}>
                  <h3 style={styles.statNumber}>{stats.present}</h3>
                  <p style={styles.statLabel}>Present Days</p>
                </div>
                <div style={styles.statTrend}>
                  +{Math.round((stats.present / stats.total) * 100)}%
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>❌</div>
                <div style={styles.statContent}>
                  <h3 style={styles.statNumber}>{stats.absent}</h3>
                  <p style={styles.statLabel}>Absent Days</p>
                </div>
                <div style={{...styles.statTrend, color: '#ef4444'}}>
                  {Math.round((stats.absent / stats.total) * 100)}%
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>📚</div>
                <div style={styles.statContent}>
                  <h3 style={styles.statNumber}>{stats.total}</h3>
                  <p style={styles.statLabel}>Total Classes</p>
                </div>
                <div style={styles.statTrend}>
                  All Time
                </div>
              </div>

              <div style={{
                ...styles.statCard,
                background: `linear-gradient(135deg, ${getPercentageColor(stats.percentage)}, ${getPercentageColor(stats.percentage)}dd)`,
                color: 'white'
              }}>
                <div style={styles.statIcon}>🎯</div>
                <div style={styles.statContent}>
                  <h3 style={{...styles.statNumber, color: "white"}}>
                    {getRequiredAttendance()}
                  </h3>
                  <p style={{...styles.statLabel, color: "rgba(255,255,255,0.8)"}}>More to reach 75%</p>
                </div>
                <div style={{...styles.statTrend, color: 'rgba(255,255,255,0.8)'}}>
                  Target
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div style={styles.progressSection}>
              <div style={styles.progressHeader}>
                <h3 style={styles.progressTitle}>Attendance Progress</h3>
                <div style={styles.progressLabels}>
                  <span style={styles.progressLabel}>Goal: 75%</span>
                  <span style={styles.percentageText}>{stats.percentage}%</span>
                </div>
              </div>
              <div style={styles.progressBarContainer}>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${stats.percentage}%`,
                      background: getPercentageColor(stats.percentage)
                    }}
                  ></div>
                </div>
                <div style={styles.progressMarkers}>
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Recent Attendance */}
            <div style={styles.recentCard}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Recent Attendance</h3>
                <span style={styles.viewAll}>Last 7 days</span>
              </div>
              <div style={styles.historyList}>
                {recentAttendance.length > 0 ? (
                  recentAttendance.map((record, index) => (
                    <div key={index} style={styles.historyItem}>
                      <div style={styles.historyDate}>
                        <div style={styles.historyDay}>{record.day}</div>
                        <div style={styles.historyFullDate}>{record.fullDate}</div>
                      </div>
                      <div style={getStatusBadge(record.status)}>
                        {record.status}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={styles.noData}>
                    <div style={styles.noDataIcon}>📅</div>
                    <p>No attendance records found</p>
                    <p style={styles.noDataSub}>Attendance will appear here once marked by admin</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Full History Tab */}
        {activeTab === "history" && (
          <div style={styles.historyCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Complete Attendance History</h3>
              <span style={styles.viewAll}>{allAttendance.length} records</span>
            </div>
            <div style={styles.fullHistoryList}>
              {allAttendance.length > 0 ? (
                allAttendance.map((record, index) => (
                  <div key={index} style={styles.fullHistoryItem}>
                    <div style={styles.historyInfo}>
                      <div style={styles.historyDate}>
                        <div style={styles.historyDay}>{record.day}</div>
                        <div style={styles.historyFullDate}>{record.fullDate}</div>
                      </div>
                    </div>
                    <div style={getStatusBadge(record.status)}>
                      {record.status}
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.noData}>
                  <div style={styles.noDataIcon}>📊</div>
                  <p>No attendance history available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calendar View Tab */}
        {activeTab === "calendar" && (
          <div style={styles.calendarCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>📆 Attendance Calendar</h3>
              <span style={styles.viewAll}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
            <div style={styles.calendar}>
              <div style={styles.weekdays}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} style={styles.weekday}>{day}</div>
                ))}
              </div>
              {calendarData.map((week, weekIndex) => (
                <div key={weekIndex} style={styles.calendarWeek}>
                  {week.map((day, dayIndex) => (
                    <div key={dayIndex} style={styles.calendarDay}>
                      {day ? (
                        <div style={{
                          ...styles.dayContent,
                          ...(day.status === "Present" ? styles.dayPresent :
                             day.status === "Absent" ? styles.dayAbsent :
                             styles.dayNotMarked)
                        }}>
                          <span style={styles.dayNumber}>{day.day}</span>
                          <span style={styles.dayStatus}>
                            {day.status === "Present" ? "✓" : day.status === "Absent" ? "✗" : "?"}
                          </span>
                        </div>
                      ) : (
                        <div style={styles.emptyDay}></div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={styles.calendarLegend}>
              <div style={styles.legendItem}>
                <div style={{...styles.legendColor, backgroundColor: "#10b981"}}></div>
                <span>Present</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{...styles.legendColor, backgroundColor: "#ef4444"}}></div>
                <span>Absent</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{...styles.legendColor, backgroundColor: "#6b7280"}}></div>
                <span>Not Marked</span>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div style={styles.analyticsContainer}>
            <div style={styles.analyticsGrid}>
              <div style={styles.analyticsCard}>
                <h3 style={styles.analyticsTitle}>Monthly Performance</h3>
                <div style={styles.monthlyStats}>
                  {monthlyStats.length > 0 ? (
                    monthlyStats.map((month, index) => (
                      <div key={index} style={styles.monthlyItem}>
                        <div style={styles.monthInfo}>
                          <div style={styles.monthName}>{month.month}</div>
                          <div style={styles.monthNumbers}>
                            {month.present}/{month.total} days
                          </div>
                        </div>
                        <div style={styles.monthProgressContainer}>
                          <div style={styles.monthProgress}>
                            <div 
                              style={{
                                ...styles.monthProgressFill,
                                width: `${month.percentage}%`,
                                background: getPercentageColor(month.percentage)
                              }}
                            ></div>
                          </div>
                          <div style={styles.monthPercentage}>
                            {month.percentage}%
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={styles.noData}>
                      <p>No monthly data available</p>
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.analyticsCard}>
                <h3 style={styles.analyticsTitle}>Performance Insights</h3>
                <div style={styles.insights}>
                  <div style={styles.insightItem}>
                    <div style={styles.insightIcon}>🎯</div>
                    <div>
                      <div style={styles.insightTitle}>Current Streak</div>
                      <div style={styles.insightValue}>
                        {recentAttendance.filter(record => record.status === 'Present').length} days
                      </div>
                    </div>
                  </div>
                  <div style={styles.insightItem}>
                    <div style={styles.insightIcon}>📅</div>
                    <div>
                      <div style={styles.insightTitle}>Best Month</div>
                      <div style={styles.insightValue}>
                        {monthlyStats.length > 0 ? monthlyStats.reduce((best, current) => 
                          current.percentage > best.percentage ? current : best
                        ).month : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div style={styles.insightItem}>
                    <div style={styles.insightIcon}>⚡</div>
                    <div>
                      <div style={styles.insightTitle}>Consistency</div>
                      <div style={styles.insightValue}>
                        {stats.percentage >= 85 ? 'High' : stats.percentage >= 70 ? 'Medium' : 'Low'}
                      </div>
                    </div>
                  </div>
                  <div style={styles.insightItem}>
                    <div style={styles.insightIcon}>📈</div>
                    <div>
                      <div style={styles.insightTitle}>Target Progress</div>
                      <div style={styles.insightValue}>
                        {stats.percentage >= 75 ? 'Achieved! 🎉' : `${getRequiredAttendance()} more to 75%`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.lastUpdated}>
          <span style={styles.updateIcon}>🔄</span>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
        <div style={styles.footerNote}>
          Data updates automatically every 30 seconds
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #ff6d00 0%, #e65100 100%)",
    color: "white",
    textAlign: "center",
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
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    color: "white",
  },
  spinner: {
    width: "60px",
    height: "60px",
    border: "4px solid rgba(255, 255, 255, 0.3)",
    borderTop: "4px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  loadingText: {
    fontSize: "1.1rem",
    opacity: 0.9,
  },
  header: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
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
  title: {
    color: "white",
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 5px 0",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "0.9rem",
    margin: 0,
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    background: "rgba(255, 255, 255, 0.1)",
    padding: "12px 20px",
    borderRadius: "15px",
  },
  avatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
  profileInfo: {
    color: "white",
  },
  studentName: {
    fontSize: "1rem",
    fontWeight: "600",
    marginBottom: "2px",
  },
  studentDetails: {
    display: "flex",
    gap: "8px",
    fontSize: "0.75rem",
    opacity: 0.8,
  },
  section: {
    background: "rgba(255,255,255,0.2)",
    padding: "2px 6px",
    borderRadius: "10px",
  },
  email: {
    opacity: 0.7,
  },
  tabContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "15px 20px 0",
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  tab: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "0.9rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  activeTab: {
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  statusCard: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },
  statusHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flex: 1,
  },
  statusEmoji: {
    fontSize: "2.5rem",
  },
  statusTitle: {
    margin: "0 0 5px 0",
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#2d3748",
  },
  statusMessage: {
    margin: 0,
    color: "#718096",
    fontSize: "0.85rem",
  },
  statusPercentage: {
    textAlign: "center",
  },
  percentageLarge: {
    fontSize: "2.5rem",
    fontWeight: "700",
    display: "block",
  },
  percentageLabel: {
    color: "#718096",
    fontSize: "0.8rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    padding: "15px",
    position: "relative",
    transition: "transform 0.3s ease",
  },
  statIcon: {
    fontSize: "2rem",
    marginBottom: "8px",
  },
  statContent: {
    marginBottom: "5px",
  },
  statNumber: {
    margin: "0 0 3px 0",
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#2d3748",
  },
  statLabel: {
    margin: 0,
    color: "#718096",
    fontSize: "0.8rem",
  },
  statTrend: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "rgba(16, 185, 129, 0.1)",
    color: "#10b981",
    padding: "2px 6px",
    borderRadius: "10px",
    fontSize: "0.7rem",
  },
  progressSection: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  progressTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: "600",
    color: "#2d3748",
  },
  progressLabels: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  progressLabel: {
    color: "#718096",
    fontSize: "0.8rem",
  },
  percentageText: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#2d3748",
  },
  progressBarContainer: {
    marginBottom: "5px",
  },
  progressBar: {
    height: "8px",
    background: "#e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "10px",
    transition: "all 0.3s ease",
  },
  progressMarkers: {
    display: "flex",
    justifyContent: "space-between",
    color: "#718096",
    fontSize: "0.7rem",
    marginTop: "5px",
  },
  recentCard: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: "600",
    color: "#2d3748",
  },
  viewAll: {
    color: "#f58003",
    fontSize: "0.8rem",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "#f7fafc",
    borderRadius: "8px",
  },
  historyDate: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  historyDay: {
    fontWeight: "600",
    color: "#2d3748",
    fontSize: "0.85rem",
  },
  historyFullDate: {
    color: "#718096",
    fontSize: "0.7rem",
  },
  historyCard: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  },
  fullHistoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "500px",
    overflowY: "auto",
  },
  fullHistoryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "#f7fafc",
    borderRadius: "8px",
  },
  historyInfo: {
    flex: 1,
  },
  calendarCard: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  },
  calendar: {
    marginBottom: "15px",
  },
  weekdays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    textAlign: "center",
    marginBottom: "10px",
  },
  weekday: {
    padding: "8px",
    fontWeight: "600",
    color: "#2d3748",
    fontSize: "0.8rem",
  },
  calendarWeek: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "2px",
  },
  calendarDay: {
    aspectRatio: "1",
    padding: "4px",
  },
  dayContent: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    transition: "all 0.3s ease",
  },
  dayPresent: {
    backgroundColor: "#10b981",
    color: "white",
  },
  dayAbsent: {
    backgroundColor: "#ef4444",
    color: "white",
  },
  dayNotMarked: {
    backgroundColor: "#f3f4f6",
    color: "#9ca3af",
  },
  dayNumber: {
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  dayStatus: {
    fontSize: "0.7rem",
  },
  emptyDay: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
  calendarLegend: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "15px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.7rem",
    color: "#718096",
  },
  legendColor: {
    width: "12px",
    height: "12px",
    borderRadius: "3px",
  },
  analyticsContainer: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    padding: "20px",
  },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  analyticsCard: {
    background: "#f8f9fa",
    borderRadius: "12px",
    padding: "15px",
  },
  analyticsTitle: {
    margin: "0 0 15px 0",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#2d3748",
  },
  monthlyStats: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  monthlyItem: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  monthInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monthName: {
    fontWeight: "600",
    color: "#2d3748",
    fontSize: "0.85rem",
  },
  monthNumbers: {
    color: "#718096",
    fontSize: "0.75rem",
  },
  monthProgressContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  monthProgress: {
    flex: 1,
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  },
  monthProgressFill: {
    height: "100%",
    borderRadius: "10px",
    transition: "width 0.3s ease",
  },
  monthPercentage: {
    width: "40px",
    textAlign: "right",
    fontWeight: "600",
    color: "#2d3748",
    fontSize: "0.85rem",
  },
  insights: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  insightItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "white",
    borderRadius: "8px",
  },
  insightIcon: {
    fontSize: "1.5rem",
  },
  insightTitle: {
    color: "#718096",
    fontSize: "0.7rem",
    marginBottom: "2px",
  },
  insightValue: {
    color: "#2d3748",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  noData: {
    textAlign: "center",
    color: "#718096",
    padding: "30px",
  },
  noDataIcon: {
    fontSize: "2rem",
    marginBottom: "8px",
    opacity: 0.5,
  },
  noDataSub: {
    fontSize: "0.8rem",
    marginTop: "5px",
    opacity: 0.7,
  },
  footer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "15px 20px",
    textAlign: "center",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  lastUpdated: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.8rem",
    marginBottom: "5px",
  },
  updateIcon: {
    marginRight: "5px",
  },
  footerNote: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.7rem",
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

export default StudentAttendance;