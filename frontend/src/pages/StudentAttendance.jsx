import React from "react";

function StudentAttendance() {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || user.role !== "Student") {
    return <p style={{textAlign: "center", marginTop: "50px", color: "red"}}>Access Denied</p>;
  }

  return (
    <div style={styles.container}>
      <h2>📋 My Attendance</h2>
      <div style={styles.card}>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Section:</strong> {user.section || "Not Assigned"}</p>
        <p><strong>Attendance:</strong> {user.attendance || "0%"}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
    padding: "20px",
  },
  card: {
    background: "#f8f9fa",
    padding: "30px",
    borderRadius: "10px",
    margin: "20px auto",
    maxWidth: "400px",
    textAlign: "left",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
};

export default StudentAttendance;