import React, { useState, useEffect } from "react";

function ClassTimetable() {
  const [classes, setClasses] = useState([]);
  const [subject, setSubject] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Fetch all scheduled classes
  useEffect(() => {
    fetch("http://localhost:5001/api/users/classes")
      .then((res) => res.json())
      .then((data) => setClasses(data.classes || []))
      .catch(() => console.error("Error loading classes"));
  }, []);

  // ✅ Add new class (Admin only)
  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!subject || !day || !time) return alert("All fields required!");

    try {
      const res = await fetch("http://localhost:5001/api/users/add-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, day, time }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Class added successfully!");
        setClasses([...classes, { subject, day, time }]);
        setSubject("");
        setDay("");
        setTime("");
      } else {
        setMessage("❌ Failed to add class.");
      }
    } catch {
      setMessage("⚠️ Server error while adding class.");
    }
  };

  // ✅ Delete class (Admin only)
  const handleDeleteClass = async (subject) => {
    if (!window.confirm(`Delete class: ${subject}?`)) return;
    try {
      const res = await fetch("http://localhost:5001/api/users/delete-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage(`🗑️ Deleted class: ${subject}`);
        setClasses(classes.filter((c) => c.subject !== subject));
      } else {
        setMessage("❌ Failed to delete class.");
      }
    } catch {
      setMessage("⚠️ Server error while deleting class.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>🏫 Class Timetable</h2>
      {message && <p style={styles.message}>{message}</p>}

      {/* Show add class form only for Admin */}
      {user?.role === "Admin" && (
        <form onSubmit={handleAddClass} style={styles.form}>
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={styles.input}
          />
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            style={styles.input}
          >
            <option value="">Select Day</option>
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
            <option>Friday</option>
            <option>Saturday</option>
          </select>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={styles.input}
          />
          <button style={styles.button}>Add Class</button>
        </form>
      )}

      {/* Show timetable */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Day</th>
            <th>Time</th>
            {user?.role === "Admin" && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {classes.map((c, index) => (
            <tr key={index}>
              <td>{c.subject}</td>
              <td>{c.day}</td>
              <td>{c.time}</td>
              {user?.role === "Admin" && (
                <td>
                  <button
                    onClick={() => handleDeleteClass(c.subject)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { textAlign: "center", marginTop: "50px", background: "#fff", minHeight: "100vh", padding: "20px" },
  form: { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: { background: "#28a745", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px" },
  table: { margin: "auto", borderCollapse: "collapse", width: "80%" },
  deleteBtn: { background: "#dc3545", color: "white", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer" },
  message: { color: "#007bff", fontWeight: "bold" },
};

export default ClassTimetable;
