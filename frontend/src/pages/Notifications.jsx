import React, { useState } from "react";

function Notifications() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "Admin") {
    return (
      <div style={styles.accessDenied}>
        <div style={styles.deniedContent}>
          <div style={styles.deniedIcon}>🚫</div>
          <h3 style={styles.deniedText}>Access Denied</h3>
          <p style={styles.deniedSubtext}>Admin privileges required</p>
        </div>
      </div>
    );
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch("http://localhost:5001/api/users/notify-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("✅ Notification sent to all students!");
        setMessage("");
        // Clear status after 3 seconds
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus("❌ Failed to send notification.");
      }
    } catch (err) {
      setStatus("⚠️ Server Error - Please try again");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>📢 Notifications</h1>
            <p style={styles.subtitle}>Send announcements to all students</p>
          </div>
          <div style={styles.adminBadge}>
            <span style={styles.adminIcon}>👨‍💼</span>
            <span>Admin Panel</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>✉️</div>
            <div>
              <h3 style={styles.cardTitle}>Compose Notification</h3>
              <p style={styles.cardDescription}>
                Your message will be delivered to all registered students instantly.
              </p>
            </div>
          </div>

          <form onSubmit={handleSend} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Message Content</label>
              <textarea
                placeholder="Enter your announcement, update, or important information for students..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={styles.textarea}
                required
                maxLength={500}
                disabled={isSending}
              />
              <div style={styles.charCount}>
                {message.length}/500 characters
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button 
                type="submit" 
                style={
                  isSending 
                    ? { ...styles.button, ...styles.buttonSending }
                    : message.trim() 
                    ? styles.button
                    : { ...styles.button, ...styles.buttonDisabled }
                }
                disabled={!message.trim() || isSending}
              >
                {isSending ? (
                  <>
                    <div style={styles.spinner}></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <span style={styles.buttonIcon}>🚀</span>
                    Send Notification
                  </>
                )}
              </button>
              
              {message && (
                <button 
                  type="button" 
                  onClick={() => setMessage("")}
                  style={styles.clearButton}
                  disabled={isSending}
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Tips Section */}
          <div style={styles.tipsCard}>
            <h4 style={styles.tipsTitle}>💡 Notification Tips</h4>
            <ul style={styles.tipsList}>
              <li>Keep messages clear and concise</li>
              <li>Include important dates and deadlines</li>
              <li>Use proper formatting for better readability</li>
              <li>Double-check information before sending</li>
            </ul>
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div style={styles.statusCard}>
            <div style={styles.statusContent}>
              <span style={styles.statusIcon}>
                {status.includes("✅") ? "✅" : status.includes("❌") ? "❌" : "⚠️"}
              </span>
              <span style={styles.statusText}>{status}</span>
            </div>
          </div>
        )}

        {/* Stats Card */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>All</div>
              <div style={styles.statLabel}>Students</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⚡</div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>Instant</div>
              <div style={styles.statLabel}>Delivery</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📱</div>
            <div style={styles.statContent}>
              <div style={styles.statNumber}>Real-time</div>
              <div style={styles.statLabel}>Updates</div>
            </div>
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
  accessDenied: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #ff6d00 0%, #e65100 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deniedContent: {
    textAlign: "center",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "50px",
    borderRadius: "20px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  deniedIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
  },
  deniedText: {
    color: "#2d3748",
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 10px 0",
  },
  deniedSubtext: {
    color: "#718096",
    fontSize: "1.1rem",
    margin: 0,
  },
  header: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "20px 0",
  },
  headerContent: {
    maxWidth: "800px",
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
  adminBadge: {
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    padding: "10px 20px",
    borderRadius: "25px",
    fontSize: "0.9rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backdropFilter: "blur(10px)",
  },
  adminIcon: {
    fontSize: "1.2rem",
  },
  content: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  card: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "40px",
    marginBottom: "30px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
  },
  cardIcon: {
    fontSize: "3rem",
    background: "linear-gradient(135deg, #ff6d00, #e65100)",
    padding: "15px",
    borderRadius: "15px",
  },
  cardTitle: {
    margin: "0 0 8px 0",
    color: "#2d3748",
    fontSize: "1.8rem",
    fontWeight: "600",
  },
  cardDescription: {
    margin: 0,
    color: "#718096",
    fontSize: "1rem",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    color: "#2d3748",
    fontSize: "1rem",
    fontWeight: "600",
    marginBottom: "5px",
  },
  textarea: {
    width: "100%",
    minHeight: "150px",
    padding: "20px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "1rem",
    fontFamily: "inherit",
    resize: "vertical",
    transition: "all 0.3s ease",
    background: "white",
  },
  textareaFocus: {
    borderColor: "#ff6d00",
    boxShadow: "0 0 0 3px rgba(255, 109, 0, 0.1)",
    outline: "none",
  },
  charCount: {
    textAlign: "right",
    color: "#718096",
    fontSize: "0.85rem",
    marginTop: "5px",
  },
  buttonGroup: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  button: {
    background: "linear-gradient(135deg, #ff6d00, #e65100)",
    color: "white",
    border: "none",
    padding: "15px 30px",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 4px 15px rgba(255, 109, 0, 0.3)",
  },
  buttonHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(255, 109, 0, 0.4)",
  },
  buttonDisabled: {
    background: "#cbd5e0",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  buttonSending: {
    background: "#a0aec0",
    cursor: "not-allowed",
  },
  buttonIcon: {
    fontSize: "1.2rem",
  },
  clearButton: {
    background: "transparent",
    color: "#718096",
    border: "2px solid #e2e8f0",
    padding: "13px 25px",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  clearButtonHover: {
    borderColor: "#ff6d00",
    color: "#ff6d00",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  tipsCard: {
    background: "#f7fafc",
    padding: "25px",
    borderRadius: "12px",
    marginTop: "20px",
    borderLeft: "4px solid #ff6d00",
  },
  tipsTitle: {
    margin: "0 0 15px 0",
    color: "#2d3748",
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  tipsList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#4a5568",
    lineHeight: "1.6",
  },
  statusCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "1px solid #e2e8f0",
  },
  statusContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  statusIcon: {
    fontSize: "1.5rem",
  },
  statusText: {
    color: "#2d3748",
    fontSize: "1rem",
    fontWeight: "500",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "25px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
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
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  statNumber: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#2d3748",
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#718096",
    fontWeight: "500",
  },
};

// Add hover effects
Object.assign(styles.button, {
  ':hover': {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(255, 109, 0, 0.4)",
  },
});

Object.assign(styles.clearButton, {
  ':hover': {
    borderColor: "#ff6d00",
    color: "#ff6d00",
  },
});

Object.assign(styles.statCard, {
  ':hover': {
    transform: "translateY(-5px)",
  },
});

Object.assign(styles.textarea, {
  ':focus': {
    borderColor: "#ff6d00",
    boxShadow: "0 0 0 3px rgba(255, 109, 0, 0.1)",
    outline: "none",
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

export default Notifications;