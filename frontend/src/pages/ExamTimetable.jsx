import React, { useState, useEffect } from "react";

function ExamTimetable() {
  const [exams, setExams] = useState([]);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch("http://localhost:5001/api/users/exams")
      .then((res) => res.json())
      .then((data) => setExams(data.exams || []))
      .catch((err) => console.error("Error fetching exams:", err));
  }, []);

  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!subject || !date || !time) return alert("All fields are required!");

    try {
      const res = await fetch("http://localhost:5001/api/users/add-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, date, time }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage("✅ Exam added successfully!");
        setExams([...exams, { subject, date, time }]);
        setSubject("");
        setDate("");
        setTime("");
      } else setMessage("❌ Failed to add exam.");
    } catch {
      setMessage("⚠️ Server error while adding exam.");
    }
  };

  const handleDeleteExam = async (subject) => {
    if (!window.confirm(`Delete exam for ${subject}?`)) return;

    try {
      const res = await fetch("http://localhost:5001/api/users/delete-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage(`🗑️ Deleted ${subject} exam.`);
        setExams(exams.filter((exam) => exam.subject !== subject));
      } else setMessage("❌ Failed to delete exam.");
    } catch {
      setMessage("⚠️ Server error while deleting exam.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>📅 Exam Timetable</h2>
      {message && <p style={styles.message}>{message}</p>}

      {/* Show form only for Admin */}
      {user?.role === "Admin" && (
        <form onSubmit={handleAddExam} style={styles.form}>
          <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} style={styles.input} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styles.input} />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={styles.input} />
          <button style={styles.button}>Add Exam</button>
        </form>
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Subject</th><th>Date</th><th>Time</th>
            {user?.role === "Admin" && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {exams.map((exam, index) => (
            <tr key={index}>
              <td>{exam.subject}</td>
              <td>{exam.date}</td>
              <td>{exam.time}</td>
              {user?.role === "Admin" && (
                <td>
                  <button onClick={() => handleDeleteExam(exam.subject)} style={styles.deleteBtn}>
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
  button: { background: "#007bff", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px" },
  table: { margin: "auto", borderCollapse: "collapse", width: "80%" },
  deleteBtn: { background: "#dc3545", color: "white", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer" },
  message: { color: "#007bff", fontWeight: "bold" },
};

export default ExamTimetable;
