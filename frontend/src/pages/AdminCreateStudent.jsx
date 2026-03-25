import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AdminCreateStudent() {
  const navigate = useNavigate();
  
  // Load saved data from localStorage on mount
  const loadSavedData = () => {
    const saved = localStorage.getItem("studentFormData");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  };
  
  const [formData, setFormData] = useState(() => {
    const saved = loadSavedData();
    return saved || {
      name: "",
      email: "",
      password: "",
      section: "",
      enrollmentId: "",
      department: "",
      semester: "1"
    };
  });
  
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Save form data to localStorage on every change
  useEffect(() => {
    localStorage.setItem("studentFormData", JSON.stringify(formData));
  }, [formData]);

  // Clear saved data after successful submission
  const clearSavedData = () => {
    localStorage.removeItem("studentFormData");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const res = await fetch("http://localhost:5001/api/users/create-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (data.success) {
        setMessageType("success");
        setMessage(`✅ Student created successfully! Password is: ${formData.password || formData.email}`);
        
        // Clear saved data after successful submission
        clearSavedData();
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          section: "",
          enrollmentId: "",
          department: "",
          semester: "1"
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessageType("error");
        setMessage(`❌ ${data.message || "Failed to create student"}`);
      }
    } catch (err) {
      console.error("Error creating student:", err);
      setMessageType("error");
      setMessage("⚠️ Server error, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      section: "",
      enrollmentId: "",
      department: "",
      semester: "1"
    });
    // Clear saved data when clearing form
    clearSavedData();
  };

  const handleBack = () => {
    navigate("/admin-dashboard");
  };

  // Generate enrollment ID automatically
  const generateEnrollmentId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000);
    const enrollmentId = `REG${year}${random}`;
    setFormData({ ...formData, enrollmentId });
  };

  // Validate email format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.titleSection}>
            <button onClick={handleBack} style={styles.backBtn}>
              ← Back to Dashboard
            </button>
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
              {/* Full Name Field */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>👤</span>
                  Full Name *
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
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="student@lpu.edu.in"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(formData.email && !isValidEmail(formData.email) ? styles.inputError : {})
                  }}
                  required
                  disabled={isSubmitting}
                />
                <div style={styles.hintText}>
                  Password will be set to this email by default
                </div>
              </div>

              {/* Password Field */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🔒</span>
                  Password
                </label>
                <div style={styles.passwordContainer}>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave blank to use email as password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{...styles.input, paddingRight: "40px"}}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <div style={styles.hintText}>
                  Optional - Default password will be student's email
                </div>
              </div>

              {/* Enrollment ID Field */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🆔</span>
                  Enrollment ID
                </label>
                <div style={styles.inputGroupFlex}>
                  <input
                    name="enrollmentId"
                    placeholder="Auto-generated if left blank"
                    value={formData.enrollmentId}
                    onChange={handleChange}
                    style={{...styles.input, flex: 1}}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={generateEnrollmentId}
                    style={styles.generateBtn}
                    disabled={isSubmitting}
                  >
                    Generate
                  </button>
                </div>
                <div style={styles.hintText}>
                  Unique identifier for the student
                </div>
              </div>

              {/* Department Field */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🏛️</span>
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  style={styles.select}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Management Studies">Management Studies</option>
                </select>
              </div>

              {/* Semester Field */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>📚</span>
                  Semester *
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  style={styles.select}
                  required
                  disabled={isSubmitting}
                >
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                  <option value="3">3rd Semester</option>
                  <option value="4">4th Semester</option>
                  <option value="5">5th Semester</option>
                  <option value="6">6th Semester</option>
                  <option value="7">7th Semester</option>
                  <option value="8">8th Semester</option>
                </select>
              </div>

              {/* Section Field */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🏫</span>
                  Section *
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
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="G">G</option>
                  <option value="H">H</option>
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
                disabled={isSubmitting || !formData.name || !formData.email || !formData.department || !formData.section}
              >
                {isSubmitting ? (
                  <>
                    <div style={styles.spinner}></div>
                    Creating Student...
                  </>
                ) : (
                  <>
                    <span>🎓</span>
                    Create Student Account
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                style={styles.clearButton}
                disabled={isSubmitting}
              >
                <span>🗑️</span>
                Clear Form
              </button>
            </div>
          </form>

          {/* Status Message */}
          {message && (
            <div style={
              messageType === "success" 
                ? styles.successMessage 
                : messageType === "error"
                ? styles.errorMessage 
                : styles.warningMessage
            }>
              <div style={styles.messageContent}>
                <span style={styles.messageIcon}>
                  {messageType === "success" ? "✅" : messageType === "error" ? "❌" : "⚠️"}
                </span>
                <span>{message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Information Card */}
        <div style={styles.infoCard}>
          <h4 style={styles.infoTitle}>📌 Quick Guidelines</h4>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>👤</div>
              <div>
                <div style={styles.infoItemTitle}>Full Name</div>
                <div style={styles.infoItemText}>Use proper capitalization</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>📧</div>
              <div>
                <div style={styles.infoItemTitle}>Email</div>
                <div style={styles.infoItemText}>Must be unique across system</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>🔒</div>
              <div>
                <div style={styles.infoItemTitle}>Password</div>
                <div style={styles.infoItemText}>Leave blank to use email</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>🆔</div>
              <div>
                <div style={styles.infoItemTitle}>Enrollment ID</div>
                <div style={styles.infoItemText}>Auto-generated if blank</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>🏛️</div>
              <div>
                <div style={styles.infoItemTitle}>Department</div>
                <div style={styles.infoItemText}>Select from available options</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>📚</div>
              <div>
                <div style={styles.infoItemTitle}>Semester</div>
                <div style={styles.infoItemText}>1st to 8th semester</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div style={styles.statsCard}>
          <h4 style={styles.statsTitle}>📊 Important Notes</h4>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statIcon}>⚡</div>
              <div style={styles.statContent}>
                <div style={styles.statNumber}>Instant</div>
                <div style={styles.statLabel}>Account Creation</div>
              </div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statIcon}>🔐</div>
              <div style={styles.statContent}>
                <div style={styles.statNumber}>Secure</div>
                <div style={styles.statLabel}>Password Hashing</div>
              </div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statIcon}>📱</div>
              <div style={styles.statContent}>
                <div style={styles.statNumber}>Real-time</div>
                <div style={styles.statLabel}>Portal Access</div>
              </div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statIcon}>📧</div>
              <div style={styles.statContent}>
                <div style={styles.statNumber}>Email as</div>
                <div style={styles.statLabel}>Default Password</div>
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
  backBtn: {
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    marginBottom: "10px",
    display: "inline-block",
    transition: "all 0.3s ease",
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
  inputGroupFlex: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
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
  inputError: {
    borderColor: "#e53e3e",
    backgroundColor: "#fff5f5",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordToggle: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1.2rem",
    padding: "0",
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
  generateBtn: {
    background: "linear-gradient(135deg, #ff6d00, #e65100)",
    color: "white",
    border: "none",
    padding: "0 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
    transition: "all 0.3s ease",
  },
  hintText: {
    color: "#718096",
    fontSize: "0.75rem",
    marginTop: "4px",
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
    padding: "16px 30px",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    boxShadow: "0 4px 15px rgba(255, 109, 0, 0.3)",
    flex: 1,
  },
  submitButtonLoading: {
    background: "#a0aec0",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  clearButton: {
    background: "transparent",
    color: "#718096",
    border: "2px solid #e2e8f0",
    padding: "14px 25px",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
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
    padding: "16px",
    marginTop: "20px",
  },
  errorMessage: {
    background: "#fff5f5",
    border: "1px solid #feb2b2",
    borderRadius: "12px",
    padding: "16px",
    marginTop: "20px",
  },
  warningMessage: {
    background: "#fffaf0",
    border: "1px solid #faf089",
    borderRadius: "12px",
    padding: "16px",
    marginTop: "20px",
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
    transform: translateY(0);
  }
  
  input:focus, select:focus {
    border-color: #ff6d00;
    box-shadow: 0 0 0 3px rgba(255, 109, 0, 0.1);
    outline: none;
  }
  
  .back-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;
document.head.appendChild(styleSheet);

export default AdminCreateStudent;