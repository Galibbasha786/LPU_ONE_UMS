import React, { useState } from "react";

function Notifications() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "Admin") {
    return <h3 style={{ textAlign: "center", marginTop: "50px" }}>🚫 Access Denied</h3>;
  }

  const handleSend = async (e) => {
    e.preventDefault();
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
      } else {
        setStatus("❌ Failed to send notification.");
      }
    } catch (err) {
      setStatus("⚠️ Server Error");
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>📢 Send Notification to All Students</h2>
      <form onSubmit={handleSend} style={styles.form}>
        <textarea
          placeholder="Enter your announcement..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={styles.textarea}
          required
        />
        <button type="submit" style={styles.button}>Send Notification</button>
      </form>
      {status && <p style={styles.status}>{status}</p>}
    </div>
  );
}

const styles = {
  container: { textAlign: "center", marginTop: "50px" },
  form: { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
  textarea: { width: "300px", height: "100px", borderRadius: "8px", padding: "10px" },
  button: { background: "#007bff", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer" },
  status: { marginTop: "15px", fontWeight: "bold" },
};

export default Notifications;
