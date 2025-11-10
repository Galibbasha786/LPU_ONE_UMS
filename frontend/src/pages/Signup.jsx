import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !role) {
      setMessage("❌ Please fill all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (data.success) {
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (error) {
      setMessage("⚠️ Error connecting to server");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Signup Page</h2>

      <form onSubmit={handleSignup} style={styles.form}>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.input}
        >
          <option value="Student">Student</option>
          <option value="Admin">Admin</option>
        </select>

        <button type="submit" style={styles.button}>
          Sign Up
        </button>
      </form>

      {message && <p style={styles.message}>{message}</p>}

      <p>
        Already have an account?{" "}
        <span
          onClick={() => navigate("/")}
          style={{ color: "blue", cursor: "pointer" }}
        >
          Login
        </span>
      </p>
    </div>
  );
}

const styles = {
  container: { textAlign: "center", marginTop: "80px" },
  form: { display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" },
  input: { width: "250px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: { backgroundColor: "#007bff", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" },
  message: { marginTop: "20px", fontWeight: "bold" },
};

export default Signup;
