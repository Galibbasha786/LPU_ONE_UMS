import React, { useEffect, useState } from "react";

function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/users/notifications");
        const data = await res.json();
        if (data.success) {
          // Sort notifications by date, newest first
          const sortedNotifications = (data.notifications || [])
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          setNotifications(sortedNotifications);
        } else {
          setError("Failed to load notifications");
        }
      } catch (err) {
        setError("Unable to connect to server");
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>📢 Notifications</h1>
            <p style={styles.subtitle}>Stay updated with important announcements</p>
          </div>
          <div style={styles.notificationBadge}>
            <span style={styles.badgeNumber}>{notifications.length}</span>
            <span>Total Messages</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {error ? (
          <div style={styles.errorCard}>
            <div style={styles.errorIcon}>⚠️</div>
            <h3 style={styles.errorTitle}>Unable to Load Notifications</h3>
            <p style={styles.errorText}>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={styles.retryButton}
            >
              🔄 Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyTitle}>No Notifications Yet</h3>
            <p style={styles.emptyText}>
              You're all caught up! New announcements from administrators will appear here.
            </p>
            <div style={styles.emptyTips}>
              <h4>What to expect:</h4>
              <ul style={styles.tipsList}>
                <li>Important announcements</li>
                <li>Class schedule updates</li>
                <li>Exam notifications</li>
                <li>Event reminders</li>
              </ul>
            </div>
          </div>
        ) : (
          <div style={styles.notificationsContainer}>
            {/* Notifications List */}
            <div style={styles.notificationsList}>
              {notifications.map((notification, index) => (
                <div 
                  key={index} 
                  style={styles.notificationCard}
                  className="notification-item"
                >
                  <div style={styles.notificationHeader}>
                    <div style={styles.notificationIcon}></div>
                    <div style={styles.notificationMeta}>
                      <div style={styles.notificationTitle}>Admin Announcement</div>
                      <div style={styles.notificationTime}>
                        {formatDate(notification.date)}
                      </div>
                    </div>
                    {index === 0 && notifications.length > 0 && (
                      <div style={styles.newBadge}>New</div>
                    )}
                  </div>
                  <div style={styles.notificationMessage}>
                    {notification.message}
                  </div>
                  <div style={styles.notificationFooter}>
                    <div style={styles.messageIndicator}>
                      <span style={styles.indicatorDot}>●</span>
                      Important Message
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Statistics Card */}
            <div style={styles.statsCard}>
              <h3 style={styles.statsTitle}>📊 Notification Stats</h3>
              <div style={styles.statsGrid}>
                <div style={styles.statItem}>
                  <div style={styles.statNumber}>{notifications.length}</div>
                  <div style={styles.statLabel}>Total Messages</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statNumber}>
                    {notifications.filter(n => {
                      const notificationDate = new Date(n.date);
                      const today = new Date();
                      return notificationDate.toDateString() === today.toDateString();
                    }).length}
                  </div>
                  <div style={styles.statLabel}>Today</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statNumber}>
                    {notifications.filter(n => {
                      const notificationDate = new Date(n.date);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return notificationDate > weekAgo;
                    }).length}
                  </div>
                  <div style={styles.statLabel}>This Week</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auto-update Indicator */}
        <div style={styles.footer}>
          <div style={styles.updateIndicator}>
            <span style={styles.updateIcon}>🔄</span>
            Updates every 30 seconds • Last checked: {new Date().toLocaleTimeString()}
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
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
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
  loadingText: {
    fontSize: "1.1rem",
    opacity: 0.9,
  },
  header: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "20px 0",
  },
  headerContent: {
    maxWidth: "1000px",
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
    fontSize: "2.5rem",
    fontWeight: "700",
    margin: "0 0 8px 0",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "1.1rem",
    margin: 0,
    fontWeight: "400",
  },
  notificationBadge: {
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
  badgeNumber: {
    background: "#ff6d00",
    color: "white",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "700",
  },
  content: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  errorCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
  },
  errorIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
  },
  errorTitle: {
    color: "#2d3748",
    fontSize: "1.5rem",
    fontWeight: "600",
    margin: "0 0 10px 0",
  },
  errorText: {
    color: "#718096",
    fontSize: "1rem",
    margin: "0 0 20px 0",
  },
  retryButton: {
    background: "linear-gradient(135deg, #ff6d00, #e65100)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  emptyState: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "50px 40px",
    textAlign: "center",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
    opacity: 0.7,
  },
  emptyTitle: {
    color: "#2d3748",
    fontSize: "1.8rem",
    fontWeight: "600",
    margin: "0 0 15px 0",
  },
  emptyText: {
    color: "#718096",
    fontSize: "1.1rem",
    lineHeight: "1.6",
    margin: "0 0 30px 0",
    maxWidth: "500px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  emptyTips: {
    background: "#f7fafc",
    padding: "25px",
    borderRadius: "12px",
    textAlign: "left",
    maxWidth: "400px",
    margin: "0 auto",
  },
  tipsList: {
    margin: "15px 0 0 0",
    paddingLeft: "20px",
    color: "#4a5568",
    lineHeight: "1.6",
  },
  notificationsContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 300px",
    gap: "30px",
    alignItems: "start",
  },
  notificationsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  notificationCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    borderLeft: "4px solid #ff6d00",
  },
  notificationHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "15px",
  },
  notificationIcon: {
    fontSize: "1.5rem",
    background: "linear-gradient(135deg, #ff6d00, #e65100)",
    padding: "8px",
    borderRadius: "10px",
    color: "white",
  },
  notificationMeta: {
    flex: 1,
  },
  notificationTitle: {
    color: "#2d3748",
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "5px",
  },
  notificationTime: {
    color: "#718096",
    fontSize: "0.85rem",
  },
  newBadge: {
    background: "#ff6d00",
    color: "white",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  notificationMessage: {
    color: "#4a5568",
    fontSize: "1rem",
    lineHeight: "1.6",
    marginBottom: "15px",
  },
  notificationFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "15px",
    borderTop: "1px solid #e2e8f0",
  },
  messageIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#718096",
    fontSize: "0.85rem",
  },
  indicatorDot: {
    color: "#ff6d00",
    fontSize: "0.5rem",
  },
  statsCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    position: "sticky",
    top: "20px",
  },
  statsTitle: {
    color: "#2d3748",
    fontSize: "1.3rem",
    fontWeight: "600",
    margin: "0 0 20px 0",
    textAlign: "center",
  },
  statsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  statItem: {
    textAlign: "center",
    padding: "15px",
    background: "#f7fafc",
    borderRadius: "10px",
  },
  statNumber: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#718096",
    fontWeight: "500",
  },
  footer: {
    marginTop: "30px",
    textAlign: "center",
  },
  updateIndicator: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "0.9rem",
    background: "rgba(255, 255, 255, 0.1)",
    padding: "10px 20px",
    borderRadius: "20px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backdropFilter: "blur(10px)",
  },
  updateIcon: {
    fontSize: "0.8rem",
  },
};

// Add hover effects
Object.assign(styles.notificationCard, {
  ':hover': {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
  },
});

Object.assign(styles.retryButton, {
  ':hover': {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 15px rgba(255, 109, 0, 0.3)",
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

// Add media query for responsive design
styleSheet.insertRule(`
  @media (max-width: 768px) {
    .notifications-container {
      grid-template-columns: 1fr;
    }
    .stats-card {
      position: static;
      order: -1;
    }
  }
`, styleSheet.cssRules.length);

export default StudentNotifications;