import React, { useEffect, useState } from "react";

function StudentAttendance() {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
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
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
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
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      percentage: Math.round((data.present / data.total) * 100),
      present: data.present,
      total: data.total
    })).slice(0, 6); // Last 6 months
  };

  const stats = calculateStats();
  const recentAttendance = getRecentAttendance();
  const monthlyStats = getMonthlyStats();

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return "#10b981";
    if (percentage >= 75) return "#f59e0b";
    return "#ef4444";
  };

  const getStatusBadge = (status) => {
    return {
      background: status === "Present" ? "#10b981" : "#ef4444",
      color: "white",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "0.8rem",
      fontWeight: "600",
    };
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading your attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📊 My Attendance Dashboard</h2>
        <p style={styles.subtitle}>Real-time attendance updates</p>
      </div>

      <div style={styles.content}>
        {/* Student Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <div style={styles.avatar}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={styles.profileInfo}>
              <h3 style={styles.studentName}>{user.name}</h3>
              <p style={styles.studentEmail}>{user.email}</p>
              <div style={styles.sectionBadge}>
                {user.section || "Not Assigned"}
              </div>
            </div>
          </div>
        </div>

        {/* Main Attendance Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{stats.present}</h3>
              <p style={styles.statLabel}>Present Days</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>❌</div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{stats.absent}</h3>
              <p style={styles.statLabel}>Absent Days</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📚</div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{stats.total}</h3>
              <p style={styles.statLabel}>Total Classes</p>
            </div>
          </div>

          <div style={{
            ...styles.statCard,
            background: `linear-gradient(135deg, ${getPercentageColor(stats.percentage)}, ${getPercentageColor(stats.percentage)}dd)`
          }}>
            <div style={styles.statIcon}>📈</div>
            <div style={styles.statContent}>
              <h3 style={{...styles.statNumber, color: "white"}}>
                {stats.percentage}%
              </h3>
              <p style={{...styles.statLabel, color: "white"}}>Overall Percentage</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <h3>Attendance Progress</h3>
            <span style={styles.percentageText}>{stats.percentage}%</span>
          </div>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${stats.percentage}%`,
                background: getPercentageColor(stats.percentage)
              }}
            ></div>
          </div>
          <div style={styles.progressStats}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Recent Attendance History */}
        <div style={styles.historyCard}>
          <h3 style={styles.historyTitle}>Recent Attendance</h3>
          <div style={styles.historyList}>
            {recentAttendance.length > 0 ? (
              recentAttendance.map((record, index) => (
                <div key={index} style={styles.historyItem}>
                  <div style={styles.historyDate}>
                    <div style={styles.historyDay}>{record.day}</div>
                    <div>{new Date(record.date).toLocaleDateString()}</div>
                  </div>
                  <div style={getStatusBadge(record.status)}>
                    {record.status}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.noData}>
                No attendance records found
              </div>
            )}
          </div>
        </div>

        {/* Monthly Performance */}
        <div style={styles.monthlyCard}>
          <h3 style={styles.monthlyTitle}>Monthly Performance</h3>
          <div style={styles.monthlyStats}>
            {monthlyStats.length > 0 ? (
              monthlyStats.map((month, index) => (
                <div key={index} style={styles.monthlyItem}>
                  <div style={styles.monthName}>{month.month}</div>
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
              ))
            ) : (
              <div style={styles.noData}>
                No monthly data available
              </div>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <div style={styles.lastUpdated}>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

// ... (keep the same styles as previous StudentAttendance component, just add lastUpdated style)

const styles = {
  // ... (all the previous styles remain the same)
  lastUpdated: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "0.9rem",
    marginTop: "20px",
  },
  noData: {
    textAlign: "center",
    color: "#718096",
    padding: "20px",
    fontStyle: "italic",
  },
};

// Add keyframes for spinner
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default StudentAttendance;