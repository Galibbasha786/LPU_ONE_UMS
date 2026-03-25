import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SystemSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    academicYear: "2024-25",
    semester: "Even",
    examGrading: "Absolute",
    attendanceThreshold: 75,
    lateFeeAmount: 500,
    libraryFinePerDay: 10
  });
  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "Admin") {
    return (
      <div style={styles.accessDenied}>
        <h2>⛔ Access Denied</h2>
        <p>Only Administrators can access system settings.</p>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          ← Go Back
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setMessage("✅ Settings saved successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate("/admin-dashboard")} style={styles.backBtn}>
              ← Back to Dashboard
            </button>
            <h1 style={styles.title}>⚙️ System Settings</h1>
            <p style={styles.subtitle}>Configure system-wide settings and preferences</p>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        {message && (
          <div style={styles.message}>{message}</div>
        )}

        <div style={styles.settingsGrid}>
          {/* Academic Settings */}
          <div style={styles.settingCard}>
            <h3>📚 Academic Settings</h3>
            <div style={styles.settingItem}>
              <label>Academic Year</label>
              <select name="academicYear" value={settings.academicYear} onChange={handleChange} style={styles.select}>
                <option>2023-24</option>
                <option>2024-25</option>
                <option>2025-26</option>
              </select>
            </div>
            <div style={styles.settingItem}>
              <label>Current Semester</label>
              <select name="semester" value={settings.semester} onChange={handleChange} style={styles.select}>
                <option>Odd</option>
                <option>Even</option>
              </select>
            </div>
            <div style={styles.settingItem}>
              <label>Exam Grading System</label>
              <select name="examGrading" value={settings.examGrading} onChange={handleChange} style={styles.select}>
                <option>Absolute</option>
                <option>Relative</option>
              </select>
            </div>
            <div style={styles.settingItem}>
              <label>Attendance Threshold (%)</label>
              <input type="number" name="attendanceThreshold" value={settings.attendanceThreshold} onChange={handleChange} style={styles.input} />
            </div>
          </div>

          {/* Financial Settings */}
          <div style={styles.settingCard}>
            <h3>💰 Financial Settings</h3>
            <div style={styles.settingItem}>
              <label>Late Fee Amount (₹)</label>
              <input type="number" name="lateFeeAmount" value={settings.lateFeeAmount} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.settingItem}>
              <label>Library Fine per Day (₹)</label>
              <input type="number" name="libraryFinePerDay" value={settings.libraryFinePerDay} onChange={handleChange} style={styles.input} />
            </div>
          </div>

          {/* Email Settings */}
          <div style={styles.settingCard}>
            <h3>📧 Email Settings</h3>
            <div style={styles.settingItem}>
              <label>SMTP Server</label>
              <input type="text" placeholder="smtp.gmail.com" style={styles.input} />
            </div>
            <div style={styles.settingItem}>
              <label>SMTP Port</label>
              <input type="text" placeholder="587" style={styles.input} />
            </div>
            <div style={styles.settingItem}>
              <label>Sender Email</label>
              <input type="email" placeholder="noreply@lpu.edu.in" style={styles.input} />
            </div>
          </div>

          {/* Security Settings */}
          <div style={styles.settingCard}>
            <h3>🔐 Security Settings</h3>
            <div style={styles.settingItem}>
              <label>Session Timeout (minutes)</label>
              <input type="number" placeholder="30" style={styles.input} />
            </div>
            <div style={styles.settingItem}>
              <label>Max Login Attempts</label>
              <input type="number" placeholder="3" style={styles.input} />
            </div>
            <div style={styles.settingItem}>
              <label>
                <input type="checkbox" style={styles.checkbox} />
                Enable Two-Factor Authentication
              </label>
            </div>
          </div>
        </div>

        <div style={styles.actions}>
          <button onClick={handleSave} style={styles.saveBtn}>Save All Settings</button>
          <button onClick={() => setSettings({})} style={styles.resetBtn}>Reset to Default</button>
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
    maxWidth: "1200px",
    margin: "0 auto",
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
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px",
  },
  message: {
    background: "#d4edda",
    color: "#155724",
    padding: "12px 20px",
    borderRadius: "10px",
    marginBottom: "20px",
    textAlign: "center",
  },
  settingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  settingCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  settingItem: {
    marginBottom: "15px",
    "& label": {
      display: "block",
      marginBottom: "8px",
      fontWeight: "600",
      color: "#2d3748",
    },
  },
  select: {
    width: "100%",
    padding: "10px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
  },
  checkbox: {
    marginRight: "8px",
  },
  actions: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
  },
  saveBtn: {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  resetBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  accessDenied: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    textAlign: "center",
  },
};

export default SystemSettings;