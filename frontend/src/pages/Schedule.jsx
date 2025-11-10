import React, { useState, useEffect } from "react";

function Schedule() {
  const [type, setType] = useState("class");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [schedules, setSchedules] = useState([]);

  const fetchSchedules = async () => {
    const res = await fetch("http://localhost:5001/api/users/schedules");
    const data = await res.json();
    setSchedules(data.schedules);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5001/api/users/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, subject, date, time }),
    });
    alert("✅ Scheduled successfully!");
    fetchSchedules();
  };

  useEffect(() => { fetchSchedules(); }, []);

  return (
    <div style={styles.container}>
      <h2>📅 Schedule a Class or Exam</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="class">Class</option>
          <option value="exam">Exam</option>
        </select>
        <input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <button type="submit">Add Schedule</button>
      </form>

      <h3>📋 Upcoming Schedules</h3>
      <ul>
        {schedules.map((s, i) => (
          <li key={i}>{s.type.toUpperCase()} - {s.subject} on {s.date} at {s.time}</li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: { textAlign: "center", marginTop: "50px" },
  form: { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" },
};

export default Schedule;
