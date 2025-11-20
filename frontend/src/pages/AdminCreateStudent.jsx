import React, { useState } from "react";

function AdminCreateStudent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    section: "",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:5001/api/users/create-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Student created successfully!");
        setFormData({ name: "", email: "", password: "", section: "" });
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (err) {
      setMessage("⚠️ Server error, please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}> Create Student</h1>
            <p style={styles.subtitle}>Add new students to the system</p>
          </div>
          <div style={styles.adminBadge}>
            <span style={styles.adminIcon}>⚡</span>
            <span>Admin Panel</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIcon}>🎓</div>
            <div>
              <h3 style={styles.cardTitle}>Student Registration</h3>
              <p style={styles.cardDescription}>
                Fill in the details to create a new student account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              {/* Name Field */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>👤</span>
                  Full Name
                </label>
                <input
                  name="name"
                  placeholder="Enter student's full name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Email Field */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>📧</span>
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="student@lpu.in"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Password Field */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🔒</span>
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  disabled={isSubmitting}
                  minLength="6"
                />
                <div style={styles.passwordHint}>
                  Minimum 6 characters required
                </div>
              </div>

              {/* Section Field */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🏫</span>
                  Section
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  style={styles.select}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Section</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                  <option value="D1">D1</option>
                  <option value="D2">D2</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.buttonGroup}>
              <button
                type="submit"
                style={
                  isSubmitting
                    ? { ...styles.submitButton, ...styles.submitButtonLoading }
                    : styles.submitButton
                }
                disabled={isSubmitting || !formData.name || !formData.email || !formData.password || !formData.section}
              >
                {isSubmitting ? (
                  <>
                    <div style={styles.spinner}></div>
                    Creating Student...
                  </>
                ) : (
                  <>
                   
                    Create Student Account
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFormData({ name: "", email: "", password: "", section: "" })}
                style={styles.clearButton}
                disabled={isSubmitting}
              >
                <span style={styles.buttonIcon}>🗑️</span>
                Clear Form
              </button>
            </div>
          </form>

          {/* Status Message */}
          {message && (
            <div style={
              message.includes("✅") 
                ? styles.successMessage 
                : message.includes("❌") 
                ? styles.errorMessage 
                : styles.warningMessage
            }>
              <div style={styles.messageContent}>
                <span style={styles.messageIcon}>
                  {message.includes("✅") ? "✅" : message.includes("❌") ? "❌" : "⚠️"}
                </span>
                <span>{message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Information Card */}
        <div style={styles.infoCard}>
          <h4 style={styles.infoTitle}> Quick Guidelines</h4>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}></div>
              <div>
                <div style={styles.infoItemTitle}>Full Name</div>
                <div style={styles.infoItemText}>Use proper capitalization</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>📧</div>
              <div>
                <div style={styles.infoItemTitle}>Email</div>
                <div style={styles.infoItemText}>Must be unique</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>🔒</div>
              <div>
                <div style={styles.infoItemTitle}>Password</div>
                <div style={styles.infoItemText}>Min. 6 characters</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>🏫</div>
              <div>
                <div style={styles.infoItemTitle}>Section</div>
                <div style={styles.infoItemText}>Select from dropdown</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div style={styles.statsCard}>
          <h4 style={styles.statsTitle}>📊 System Information</h4>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statIcon}>⚡</div>
              <div style={styles.statContent}>
                <div style={styles.statNumber}>Instant</div>
                <div style={styles.statLabel}>Registration</div>
              </div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statIcon}>🔐</div>
              <div style={styles.statContent}>
                <div style={styles.statNumber}>Secure</div>
                <div style={styles.statLabel}>Data Storage</div>
              </div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statIcon}>📱</div>
              <div style={styles.statContent}>
                <div style={styles.statNumber}>Real-time</div>
                <div style={styles.statLabel}>Access</div>
              </div>
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
  adminBadge: {
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
  adminIcon: {
    fontSize: "1.2rem",
  },
  content: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  card: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "40px",
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
    color: "white",
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
    gap: "30px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    color: "#2d3748",
    fontSize: "1rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  labelIcon: {
    fontSize: "1.1rem",
  },
  input: {
    padding: "15px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "1rem",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    background: "white",
  },
  select: {
    padding: "15px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "1rem",
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    background: "white",
    cursor: "pointer",
  },
  passwordHint: {
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
  submitButton: {
    background: "linear-gradient(135deg, #ff6d00, #e65100)",
    color: "white",
    border: "none",
    padding: "18px 30px",
    borderRadius: "12px",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 4px 15px rgba(255, 109, 0, 0.3)",
    flex: 1,
  },
  submitButtonLoading: {
    background: "#a0aec0",
    cursor: "not-allowed",
  },
  clearButton: {
    background: "transparent",
    color: "#718096",
    border: "2px solid #e2e8f0",
    padding: "16px 25px",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  buttonIcon: {
    fontSize: "1.2rem",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid transparent",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  successMessage: {
    background: "#f0fff4",
    border: "1px solid #9ae6b4",
    borderRadius: "12px",
    padding: "20px",
  },
  errorMessage: {
    background: "#fff5f5",
    border: "1px solid #feb2b2",
    borderRadius: "12px",
    padding: "20px",
  },
  warningMessage: {
    background: "#fffaf0",
    border: "1px solid #faf089",
    borderRadius: "12px",
    padding: "20px",
  },
  messageContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontWeight: "500",
  },
  messageIcon: {
    fontSize: "1.2rem",
  },
  infoCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  infoTitle: {
    margin: "0 0 20px 0",
    color: "#2d3748",
    fontSize: "1.3rem",
    fontWeight: "600",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    background: "#f7fafc",
    borderRadius: "10px",
  },
  infoIcon: {
    fontSize: "1.5rem",
  },
  infoItemTitle: {
    color: "#2d3748",
    fontSize: "0.95rem",
    fontWeight: "600",
    marginBottom: "4px",
  },
  infoItemText: {
    color: "#718096",
    fontSize: "0.85rem",
  },
  statsCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  statsTitle: {
    margin: "0 0 20px 0",
    color: "#2d3748",
    fontSize: "1.3rem",
    fontWeight: "600",
    textAlign: "center",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
  },
  statItem: {
    textAlign: "center",
    padding: "20px",
    background: "#f7fafc",
    borderRadius: "12px",
  },
  statIcon: {
    fontSize: "2rem",
    marginBottom: "10px",
  },
  statContent: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  statNumber: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#2d3748",
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "#718096",
    fontWeight: "500",
  },
};

// Add hover effects
Object.assign(styles.submitButton, {
  ':hover': {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(255, 109, 0, 0.4)",
  },
});

Object.assign(styles.clearButton, {
  ':hover': {
    borderColor: "#ff6d00",
    color: "#ff6d00",
    transform: "translateY(-1px)",
  },
});

Object.assign(styles.input, {
  ':focus': {
    borderColor: "#ff6d00",
    boxShadow: "0 0 0 3px rgba(255, 109, 0, 0.1)",
    outline: "none",
  },
});

Object.assign(styles.select, {
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

export default AdminCreateStudent;