import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MySubjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "Student") {
    return (
      <div style={styles.accessDenied}>
        <h2>⛔ Access Denied</h2>
        <p>Only students can view their subjects.</p>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          ← Go Back
        </button>
      </div>
    );
  }

  useEffect(() => {
    // Mock subjects - in real app, fetch from backend
    setSubjects([
      { code: "CS101", name: "Programming Fundamentals", credits: 4, teacher: "Dr. Sarah Johnson", schedule: "Mon 9:00-10:00", room: "A101" },
      { code: "CS202", name: "Data Structures", credits: 4, teacher: "Dr. Sarah Johnson", schedule: "Tue 10:00-11:00", room: "A102" },
      { code: "CS303", name: "Database Management", credits: 3, teacher: "Dr. Priya Sharma", schedule: "Wed 11:00-12:00", room: "B201" },
      { code: "CS404", name: "Operating Systems", credits: 3, teacher: "Dr. Priya Sharma", schedule: "Thu 2:00-3:00", room: "B202" },
      { code: "CS505", name: "Computer Networks", credits: 3, teacher: "Prof. Michael Chen", schedule: "Fri 9:00-10:00", room: "C301" },
    ]);
    setLoading(false);
  }, []);

  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate("/student-dashboard")} style={styles.backBtn}>
              ← Back to Dashboard
            </button>
            <h1 style={styles.title}>📚 My Subjects</h1>
            <p style={styles.subtitle}>Current semester subjects and course details</p>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.statsCard}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{subjects.length}</div>
            <div style={styles.statLabel}>Total Subjects</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{totalCredits}</div>
            <div style={styles.statLabel}>Total Credits</div>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading subjects...</p>
          </div>
        ) : (
          <div style={styles.subjectsGrid}>
            {subjects.map((subject, index) => (
              <div key={index} style={styles.subjectCard}>
                <div style={styles.subjectHeader}>
                  <div style={styles.subjectCode}>{subject.code}</div>
                  <div style={styles.subjectCredits}>{subject.credits} Credits</div>
                </div>
                <div style={styles.subjectName}>{subject.name}</div>
                <div style={styles.subjectDetails}>
                  <div style={styles.detailRow}>
                    <span>👨‍🏫 Teacher:</span>
                    <span>{subject.teacher}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>📅 Schedule:</span>
                    <span>{subject.schedule}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span>📍 Room:</span>
                    <span>{subject.room}</span>
                  </div>
                </div>
                <div style={styles.subjectActions}>
                  <button style={styles.actionBtn}>View Materials</button>
                  <button style={styles.actionBtn}>View Attendance</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "20px 30px",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  backBtn: {
    background: "rgba(255, 255, 255, 0.2)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    marginBottom: "10px",
  },
  title: {
    margin: "0 0 5px 0",
    fontSize: "2rem",
    fontWeight: "700",
    color: "#2d3748",
  },
  subtitle: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#718096",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px",
  },
  statsCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  statItem: {
    textAlign: "center",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#f58003",
  },
  statLabel: {
    fontSize: "0.8rem",
    color: "#718096",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px",
    background: "rgba(255,255,255,0.95)",
    borderRadius: "16px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #f58003",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  subjectsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "20px",
  },
  subjectCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease",
  },
  subjectHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  subjectCode: {
    background: "#f58003",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  subjectCredits: {
    background: "#e2e8f0",
    color: "#4a5568",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
  },
  subjectName: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: "15px",
  },
  subjectDetails: {
    marginBottom: "20px",
    padding: "10px 0",
    borderTop: "1px solid #e2e8f0",
    borderBottom: "1px solid #e2e8f0",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "0.85rem",
    color: "#4a5568",
  },
  subjectActions: {
    display: "flex",
    gap: "10px",
  },
  actionBtn: {
    flex: 1,
    background: "#f8f9fa",
    border: "1px solid #e2e8f0",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
  accessDenied: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    textAlign: "center",
  },
};

export default MySubjects;