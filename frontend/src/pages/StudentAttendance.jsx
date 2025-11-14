import React, { useEffect, useState } from "react";

function StudentAttendance() {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || user.role !== "Student") {
    return <p style={{textAlign: "center", marginTop: "50px", color: "red"}}>Access Denied</p>;
  }

  // Fetch student's detailed attendance data
  useEffect(() => {
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

    fetchStudentAttendance();
    
    // Set up real-time updates (polling every 30 seconds)
    const interval = setInterval(fetchStudentAttendance, 30000);
    return () => clearInterval(interval);
  }, [user.email]);

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

  const stats = calculateStats();
  const recentAttendance = getRecentAttendance();
  const monthlyStats = getMonthlyStats();
  const allAttendance = getAllAttendance();

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return "#10b981";
    if (percentage >= 75) return "#f59e0b";
    return "#ef4444";
  };

  const getStatusBadge = (status) => {
    return {
      background: status === "Present" ? "#10b981" : "#ef4444",
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
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerText}>
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
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabContainer}>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === "overview" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("overview")}
        >
          📈 Overview
        </button>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === "history" ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab("history")}
        >
          📅 Full History
        </button>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === "analytics" ? styles.activeTab : {})
          }}
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
                <div style={styles.statIcon}>📈</div>
                <div style={styles.statContent}>
                  <h3 style={{...styles.statNumber, color: "white"}}>
                    {stats.percentage}%
                  </h3>
                  <p style={{...styles.statLabel, color: "rgba(255,255,255,0.8)"}}>Success Rate</p>
                </div>
                <div style={{...styles.statTrend, color: 'rgba(255,255,255,0.8)'}}>
                  Performance
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div style={styles.progressSection}>
              <div style={styles.progressHeader}>
                <h3 style={styles.progressTitle}>Attendance Progress</h3>
                <div style={styles.progressLabels}>
                  <span style={styles.progressLabel}>Goal: 90%</span>
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
                  <span>50%</span>
                  <span>75%</span>
                  <span>90%</span>
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
  background: "linear-gradient(135deg, #ff6d00 0%, #e65100 100%)", // Dark orange gradient
  fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
  headerText: {
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
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "1.1rem",
    margin: 0,
    fontWeight: "400",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    background: "rgba(255, 255, 255, 0.1)",
    padding: "15px 20px",
    borderRadius: "15px",
    backdropFilter: "blur(10px)",
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: "1.3rem",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  },
  profileInfo: {
    color: "white",
  },
  studentName: {
    fontSize: "1.2rem",
    fontWeight: "600",
    marginBottom: "4px",
  },
  studentDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  section: {
    fontSize: "0.9rem",
    opacity: 0.9,
    background: "rgba(255, 255, 255, 0.2)",
    padding: "2px 8px",
    borderRadius: "10px",
    display: "inline-block",
  },
  email: {
    fontSize: "0.85rem",
    opacity: 0.7,
  },
  tabContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    display: "flex",
    gap: "10px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  tab: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "0.95rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
  },
  activeTab: {
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  statusCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  statusHeader: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flex: 1,
  },
  statusEmoji: {
    fontSize: "3rem",
  },
  statusTitle: {
    margin: "0 0 8px 0",
    color: "#2d3748",
    fontSize: "1.5rem",
    fontWeight: "600",
  },
  statusMessage: {
    margin: 0,
    color: "#718096",
    fontSize: "1rem",
  },
  statusPercentage: {
    textAlign: "center",
  },
  percentageLarge: {
    fontSize: "3rem",
    fontWeight: "700",
    display: "block",
    lineHeight: 1,
  },
  percentageLabel: {
    color: "#718096",
    fontSize: "0.9rem",
    marginTop: "5px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    position: "relative",
    transition: "transform 0.3s ease",
  },
  statCardHover: {
    transform: "translateY(-5px)",
  },
  statIcon: {
    fontSize: "2.5rem",
    marginBottom: "15px",
  },
  statContent: {
    marginBottom: "10px",
  },
  statNumber: {
    margin: "0 0 5px 0",
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#2d3748",
  },
  statLabel: {
    margin: 0,
    color: "#718096",
    fontWeight: "500",
    fontSize: "0.95rem",
  },
  statTrend: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "rgba(16, 185, 129, 0.1)",
    color: "#10b981",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  progressSection: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  progressTitle: {
    margin: 0,
    color: "#2d3748",
    fontSize: "1.3rem",
    fontWeight: "600",
  },
  progressLabels: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  progressLabel: {
    color: "#718096",
    fontSize: "0.9rem",
  },
  percentageText: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#2d3748",
  },
  progressBarContainer: {
    marginBottom: "10px",
  },
  progressBar: {
    height: "12px",
    background: "#e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  progressFill: {
    height: "100%",
    borderRadius: "10px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  progressMarkers: {
    display: "flex",
    justifyContent: "space-between",
    color: "#718096",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  recentCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  cardTitle: {
    margin: 0,
    color: "#2d3748",
    fontSize: "1.3rem",
    fontWeight: "600",
  },
  viewAll: {
    color: "#667eea",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    background: "#f7fafc",
    borderRadius: "10px",
    transition: "all 0.3s ease",
  },
  historyItemHover: {
    background: "#edf2f7",
    transform: "translateX(5px)",
  },
  historyDate: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  historyDay: {
    fontWeight: "600",
    color: "#2d3748",
    fontSize: "0.95rem",
  },
  historyFullDate: {
    color: "#718096",
    fontSize: "0.85rem",
  },
  historyCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },
  fullHistoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxHeight: "600px",
    overflowY: "auto",
  },
  fullHistoryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    background: "#f7fafc",
    borderRadius: "10px",
    transition: "all 0.3s ease",
  },
  historyInfo: {
    flex: 1,
  },
  analyticsContainer: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "30px",
  },
  analyticsCard: {
    background: "#f7fafc",
    borderRadius: "12px",
    padding: "20px",
  },
  analyticsTitle: {
    margin: "0 0 20px 0",
    color: "#2d3748",
    fontSize: "1.2rem",
    fontWeight: "600",
  },
  monthlyStats: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  monthlyItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  monthInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monthName: {
    fontWeight: "600",
    color: "#2d3748",
    fontSize: "0.95rem",
  },
  monthNumbers: {
    color: "#718096",
    fontSize: "0.85rem",
  },
  monthProgressContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
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
    transition: "all 0.3s ease",
  },
  monthPercentage: {
    width: "40px",
    textAlign: "right",
    fontWeight: "600",
    color: "#2d3748",
    fontSize: "0.9rem",
  },
  insights: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  insightItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    background: "white",
    borderRadius: "10px",
  },
  insightIcon: {
    fontSize: "1.5rem",
  },
  insightTitle: {
    color: "#718096",
    fontSize: "0.9rem",
    marginBottom: "4px",
  },
  insightValue: {
    color: "#2d3748",
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  noData: {
    textAlign: "center",
    color: "#718096",
    padding: "40px 20px",
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
  footer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    textAlign: "center",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  lastUpdated: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "0.9rem",
    marginBottom: "8px",
  },
  updateIcon: {
    marginRight: "8px",
  },
  footerNote: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "0.8rem",
  },
};

// Add hover effects
Object.assign(styles.statCard, {
  ':hover': {
    transform: "translateY(-5px)",
  },
});

Object.assign(styles.historyItem, {
  ':hover': {
    background: "#edf2f7",
    transform: "translateX(5px)",
  },
});

Object.assign(styles.fullHistoryItem, {
  ':hover': {
    background: "#edf2f7",
    transform: "translateX(5px)",
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

export default StudentAttendance;