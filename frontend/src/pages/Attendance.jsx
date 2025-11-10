import React, { useEffect, useState } from "react";

function Attendance() {
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || user.role !== "Admin") {
    return <p style={{textAlign: "center", marginTop: "50px", color: "red"}}>Access Denied: Admins Only</p>;
  }

  // ✅ Fetch all students on page load
  useEffect(() => {
    fetch("http://localhost:5001/api/users/students")
      .then((res) => res.json())
      .then((data) => setStudents(data.students || []))
      .catch((err) => console.error("Error fetching students:", err));
  }, []);

  // ✅ Update attendance for a student
  const handleAttendance = async (email, value) => {
    try {
      const res = await fetch("http://localhost:5001/api/users/update-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, field: "attendance", value }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Attendance updated for ${email}`);
        setStudents((prev) =>
          prev.map((s) =>
            s.email === email ? { ...s, attendance: value } : s
          )
        );
      } else {
        setMessage(`❌ Failed to update for ${email}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error while updating attendance.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>📋 Mark Attendance</h2>
      {message && <p style={styles.msg}>{message}</p>}
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Section</th>
            <th>Current Attendance</th>
            <th>Mark</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={i}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.section || "Not Assigned"}</td>
              <td>{s.attendance || "Not Marked"}</td>
              <td>
                <button
                  onClick={() => handleAttendance(s.email, "Present")}
                  style={styles.presentBtn}
                >
                  ✅ Present
                </button>
                <button
                  onClick={() => handleAttendance(s.email, "Absent")}
                  style={styles.absentBtn}
                >
                  ❌ Absent
                </button>
                <button
                  onClick={() => handleAttendance(s.email, "85%")}
                  style={styles.percentageBtn}
                >
                  85%
                </button>
                <button
                  onClick={() => handleAttendance(s.email, "90%")}
                  style={styles.percentageBtn}
                >
                  90%
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "40px",
    background: "#fefefe",
    padding: "20px",
    minHeight: "100vh",
  },
  table: {
    margin: "auto",
    marginTop: "20px",
    borderCollapse: "collapse",
    width: "90%",
  },
  msg: { color: "#007bff", fontWeight: "bold" },
  presentBtn: {
    background: "green",
    color: "white",
    border: "none",
    padding: "5px 10px",
    marginRight: "5px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  absentBtn: {
    background: "red",
    color: "white",
    border: "none",
    padding: "5px 10px",
    marginRight: "5px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  percentageBtn: {
    background: "#007bff",
    color: "white",
    border: "none",
    padding: "5px 10px",
    marginRight: "5px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Attendance;