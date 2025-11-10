import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background.jpeg";
import logo from "../assets/logo.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // 🔹 Admin fixed login credentials
    if (email === "galiblpu@lpu.in" && password === "lpulpu") {
      const adminUser = {
        name: "Admin",
        email: "galiblpu@lpu.in",
        role: "Admin",
      };
      localStorage.setItem("user", JSON.stringify(adminUser));
      setMessage("✅ Admin login successful!");
      setTimeout(() => navigate("/admin-dashboard"), 1000);
      return;
    }

    // 🔹 For Students — validate from backend
    try {
      const res = await fetch("http://localhost:5001/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (data.success) {
        const studentUser = {
          name: data.user?.name || "Student",
          email,
          role: "Student",
          section: data.user?.section || "",
          attendance: data.user?.attendance || "0%",
          marks: data.user?.marks || "0",
          fees: data.user?.fees || "Unpaid"
        };
        localStorage.setItem("user", JSON.stringify(studentUser));
        setTimeout(() => navigate("/student-dashboard"), 1000);
      }
    } catch (error) {
      console.error("Login Error:", error);
      setMessage("❌ Error connecting to server");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <img src={logo} alt="logo" style={styles.logo} />
        <h1 style={styles.title}>🎓 LPU Combined Portal Login</h1>
        
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
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
        {message && <p style={styles.message}>{message}</p>}
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
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: "40px",
    borderRadius: "15px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    minWidth: "400px",
  },
  logo: {
    width: "150px",
    marginBottom: "20px",
  },
  title: { 
    color: "#2e3b55", 
    marginBottom: "30px",
    fontSize: "24px",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    alignItems: "center",
  },
  input: {
    padding: "15px",
    width: "280px",
    borderRadius: "8px",
    border: "2px solid #f46d05ff",
    fontSize: "16px",
    outline: "none",
  },
  button: {
    padding: "15px 30px",
    background: "#0c1dd7ff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    width: "280px",
    marginTop: "10px",
  },
  message: { 
    marginTop: "20px", 
    color: "#333",
    fontSize: "14px",
    fontWeight: "bold",
  },
};

export default Login;