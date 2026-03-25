import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "staff") {
    return (
      <div style={styles.accessDenied}>
        <h2>⛔ Access Denied</h2>
        <p>Only teachers can view their courses.</p>
        <button onClick={() => navigate("/")} style={styles.backBtn}>← Go Back</button>
      </div>
    );
  }

  useEffect(() => {
    // Load courses from user object (already stored in login)
    setCourses(user.coursesTeaching || []);
    setLoading(false);
  }, []);

  const getCourseStats = (course) => {
    return {
      students: Math.floor(Math.random() * 40) + 20,
      assignments: Math.floor(Math.random() * 5) + 1,
      attendance: Math.floor(Math.random() * 30) + 60
    };
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate("/teacher-dashboard")} style={styles.backBtn}>← Back to Dashboard</button>
            <h1 style={styles.title}>📚 My Courses</h1>
            <p style={styles.subtitle}>Manage your assigned courses and view student progress</p>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        {loading ? (
          <div style={styles.loading}><div style={styles.spinner}></div><p>Loading courses...</p></div>
        ) : courses.length === 0 ? (
          <div style={styles.noData}><div style={styles.noDataIcon}>📚</div><p>No courses assigned yet</p><p style={styles.noDataSub}>Courses will appear here once assigned by admin</p></div>
        ) : (
          <div style={styles.coursesGrid}>
            {courses.map((course, index) => {
              const stats = getCourseStats(course);
              return (
                <div key={index} style={styles.courseCard}>
                  <div style={styles.courseHeader}>
                    <div style={styles.courseCode}>{course.courseId}</div>
                    <div style={styles.courseSemester}>Sem {course.semester}</div>
                  </div>
                  <div style={styles.courseName}>{course.courseName}</div>
                  <div style={styles.courseSection}>Section: {course.section}</div>
                  <div style={styles.courseStats}>
                    <div style={styles.statItem}><span>👥</span><span>{stats.students} Students</span></div>
                    <div style={styles.statItem}><span>📝</span><span>{stats.assignments} Assignments</span></div>
                    <div style={styles.statItem}><span>📊</span><span>{stats.attendance}% Attendance</span></div>
                  </div>
                  <div style={styles.courseActions}>
                    <button onClick={() => navigate("/attendance")} style={styles.actionBtn}>📋 Attendance</button>
                    <button onClick={() => navigate("/marks")} style={styles.actionBtn}>📝 Marks</button>
                    <button style={styles.actionBtn}>📚 Materials</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", fontFamily: "'Inter', sans-serif" },
  header: { background: "rgba(255,255,255,0.95)", padding: "20px 30px", borderBottom: "1px solid rgba(0,0,0,0.1)" },
  headerContent: { maxWidth: "1200px", margin: "0 auto" },
  backBtn: { background: "rgba(0,0,0,0.1)", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", marginBottom: "10px" },
  title: { margin: "0 0 5px", fontSize: "2rem", fontWeight: "700", color: "#2d3748" },
  subtitle: { margin: 0, fontSize: "0.9rem", color: "#718096" },
  content: { maxWidth: "1200px", margin: "0 auto", padding: "30px" },
  loading: { textAlign: "center", padding: "60px", background: "white", borderRadius: "12px" },
  spinner: { width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #f58003", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" },
  noData: { background: "white", borderRadius: "12px", padding: "60px", textAlign: "center", color: "#718096" },
  noDataIcon: { fontSize: "3rem", marginBottom: "10px" },
  noDataSub: { fontSize: "0.8rem", marginTop: "5px" },
  coursesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" },
  courseCard: { background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  courseHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  courseCode: { background: "#f58003", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600" },
  courseSemester: { background: "#e2e8f0", color: "#4a5568", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem" },
  courseName: { fontSize: "1.2rem", fontWeight: "bold", color: "#2d3748", marginBottom: "8px" },
  courseSection: { color: "#718096", fontSize: "0.9rem", marginBottom: "15px" },
  courseStats: { display: "flex", justifyContent: "space-between", marginBottom: "20px", padding: "10px 0", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" },
  statItem: { display: "flex", alignItems: "center", gap: "5px", fontSize: "0.85rem", color: "#4a5568" },
  courseActions: { display: "flex", gap: "10px" },
  actionBtn: { flex: 1, background: "#f8f9fa", border: "1px solid #e2e8f0", padding: "8px", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "500" },
  accessDenied: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", textAlign: "center" }
};

export default MyCourses;