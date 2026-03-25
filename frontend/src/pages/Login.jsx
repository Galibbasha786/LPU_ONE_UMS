import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background.jpeg";
import logo from "../assets/logo.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      console.log("Attempting login with:", email);
      
      const res = await fetch("http://localhost:5001/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);
      
      if (res.ok && data.success) {
        const userRole = data.user?.role || "Student";
        
        // Store user data
        const userObject = {
          id: data.user?.id,
          name: data.user?.name || email.split('@')[0],
          email: email,
          role: userRole,
        };

        // Add role-specific fields
        if (userRole === "Admin") {
          userObject.name = "Admin";
        } 
        else if (userRole === "staff" || userRole === "Staff") {
          userObject.employeeId = data.user?.employeeId || "";
          userObject.department = data.user?.department || "";
          userObject.designation = data.user?.designation || "";
          userObject.coursesTeaching = data.user?.coursesTeaching || [];
          
        } 
        else {
          // Student
          userObject.section = data.user?.section || "";
          userObject.enrollmentId = data.user?.enrollmentId || "";
          userObject.attendance = data.user?.attendance || "0%";
          userObject.marks = data.user?.marks || "0";
          userObject.fees = data.user?.fees || "Unpaid";
        }

        localStorage.setItem("user", JSON.stringify(userObject));
        setMessage(`✅ ${userRole} login successful! Redirecting...`);
        
        // Redirect based on role
        setTimeout(() => {
          if (userRole === "Admin") {
            navigate("/admin-dashboard");
          } else if (userRole === "staff" || userRole === "Staff") {
            navigate("/teacher-dashboard");
          } else {
            navigate("/student-dashboard");
          }
        }, 1000);
        
      } else {
        setMessage("❌ " + (data.message || "Invalid credentials. Please check your email and password."));
      }
    } catch (error) {
      console.error("Login Error:", error);
      setMessage("❌ Error connecting to server. Please check if backend is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <img src={logo} alt="LPU Logo" style={styles.logo} />
        <h1 style={styles.title}>ONE LPU</h1>
        <p style={styles.subtitle}>Unified University Portal</p>
        
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        {message && (
          <p style={{
            ...styles.message,
            ...(message.includes("✅") ? styles.successMessage : styles.errorMessage)
          }}>
            {message}
          </p>
        )}
        
        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            <strong>📌 Demo Credentials:</strong><br/>
            👑 Admin: syedsunnygalibbasha@gmail.com / lpulpu<br/>
            👨‍🏫 Staff: bharath@lpu.in / bharath@lpu.in<br/>
            👨‍🎓 Student: (Create a student first)
          </p>
          <p style={styles.infoText}>
            <strong>💡 Note:</strong> Password is same as email for new accounts
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    padding: 0,
  },
  content: {
    background: "linear-gradient(135deg, rgba(99, 95, 92, 0.95), rgba(212, 180, 144, 0.95), rgba(224, 207, 180, 0.95), rgba(118, 96, 64, 0.95))",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 8px 32px rgba(24, 166, 237, 0.3)",
    textAlign: "center",
    minWidth: "400px",
    backdropFilter: "blur(10px)",
  },
  logo: {
    width: "120px",
    height: "120px",
    marginBottom: "20px",
    borderRadius: "60px",
    objectFit: "cover",
    border: "3px solid #f58003",
  },
  title: { 
    color: "#fff", 
    marginBottom: "10px",
    fontSize: "42px",
    fontWeight: "bold",
  },
  subtitle: {
    color: "#f0f0f0",
    marginBottom: "30px",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    alignItems: "center",
  },
  input: {
    padding: "14px 18px",
    width: "300px",
    borderRadius: "10px",
    border: "2px solid #f58003",
    fontSize: "15px",
    outline: "none",
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  button: {
    padding: "14px 30px",
    background: "linear-gradient(135deg, #0c1dd7, #1e2ed8)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    width: "300px",
    marginTop: "10px",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
    },
    "&:disabled": {
      opacity: 0.6,
      cursor: "not-allowed",
    }
  },
  message: { 
    marginTop: "20px", 
    padding: "10px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "center",
  },
  successMessage: {
    backgroundColor: "rgba(39, 174, 96, 0.9)",
    color: "white",
  },
  errorMessage: {
    backgroundColor: "rgba(231, 76, 60, 0.9)",
    color: "white",
  },
  infoBox: {
    marginTop: "25px",
    padding: "12px",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: "10px",
    borderLeft: "3px solid #f58003",
  },
  infoText: {
    margin: "5px 0",
    fontSize: "11px",
    color: "#f0f0f0",
    lineHeight: "1.5",
    textAlign: "left",
  },
};

export default Login;