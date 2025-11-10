import React, { useEffect, useState } from "react";

function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/api/users/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>📢 Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {notifications.map((n, i) => (
            <li key={i} style={styles.noteBox}>
              <p>{n.message}</p>
              <small>{new Date(n.date).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  noteBox: {
    background: "#f5f5f5",
    margin: "10px auto",
    padding: "10px 20px",
    borderRadius: "8px",
    width: "60%",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
};

export default StudentNotifications;
