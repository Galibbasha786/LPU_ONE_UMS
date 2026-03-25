import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return (
      <div style={styles.accessDenied}>
        <h2>⛔ Access Denied</h2>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          ← Go Back
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage("❌ New passwords do not match");
      setMessageType("error");
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage("❌ Password must be at least 6 characters");
      setMessageType("error");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          currentPassword,
          newPassword
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Password changed successfully!");
        setMessageType("success");
        setTimeout(() => navigate(-1), 2000);
      } else {
        setMessage("❌ " + data.message);
        setMessageType("error");
      }
    } catch (err) {
      setMessage("⚠️ Server error. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate(-1)} style={styles.backBtn}>
              ← Go Back
            </button>
            <h1 style={styles.title}>🔒 Change Password</h1>
            <p style={styles.subtitle}>Update your account password</p>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.card}>
          {message && (
            <div style={{...styles.message, ...(messageType === "success" ? styles.messageSuccess : styles.messageError)}}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input}
                required
                minLength="6"
              />
              <small style={styles.hint}>Minimum 6 characters</small>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.actions}>
              <button type="submit" style={styles.submitBtn}>Update Password</button>
              <button type="button" onClick={() => navigate(-1)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </form>
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
    maxWidth: "500px",
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
    maxWidth: "500px",
    margin: "0 auto",
    padding: "30px",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  message: {
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
  },
  messageSuccess: {
    background: "#d4edda",
    color: "#155724",
  },
  messageError: {
    background: "#f8d7da",
    color: "#721c24",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: "600",
    color: "#2d3748",
  },
  input: {
    padding: "12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
  },
  hint: {
    fontSize: "0.7rem",
    color: "#718096",
  },
  actions: {
    display: "flex",
    gap: "15px",
    marginTop: "10px",
  },
  submitBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  cancelBtn: {
    flex: 1,
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  accessDenied: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
};

export default ChangePassword;