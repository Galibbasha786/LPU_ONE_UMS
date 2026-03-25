import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    department: "",
    credits: "",
    semester: "",
    theoryPractical: "Theory"
  });
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "Admin") {
    return (
      <div style={styles.accessDenied}>
        <h2>⛔ Access Denied</h2>
        <p>Only Administrators can manage courses.</p>
        <button onClick={() => navigate("/")} style={styles.backBtn}>← Go Back</button>
      </div>
    );
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/courses");
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses || []);
      } else {
        setCourses([
          { _id: 1, courseCode: "CS101", courseName: "Programming Fundamentals", department: "CSE", credits: 4, semester: 1, theoryPractical: "Theory" },
          { _id: 2, courseCode: "CS202", courseName: "Data Structures", department: "CSE", credits: 4, semester: 2, theoryPractical: "Theory" }
        ]);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([
        { _id: 1, courseCode: "CS101", courseName: "Programming Fundamentals", department: "CSE", credits: 4, semester: 1 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseCode || !formData.courseName || !formData.department || !formData.credits) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert("Course created successfully!");
        setFormData({ courseCode: "", courseName: "", department: "", credits: "", semester: "", theoryPractical: "Theory" });
        setShowForm(false);
        fetchCourses();
      } else {
        alert("Failed: " + data.message);
      }
    } catch (err) {
      alert("Server error");
    }
  };

  const handleDelete = async (courseCode) => {
    if (!window.confirm(`Delete course ${courseCode}?`)) return;
    try {
      const res = await fetch(`http://localhost:5001/api/courses/${courseCode}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Course deleted");
        fetchCourses();
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate("/admin-dashboard")} style={styles.backBtn}>← Back to Dashboard</button>
            <h1 style={styles.title}>📖 Course Management</h1>
            <p style={styles.subtitle}>Manage all courses offered by the university</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>{showForm ? "− Cancel" : "+ Add Course"}</button>
        </div>
      </header>

      <div style={styles.content}>
        {showForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3>Add New Course</h3>
            <div style={styles.formGrid}>
              <input name="courseCode" placeholder="Course Code *" value={formData.courseCode} onChange={handleChange} style={styles.input} required />
              <input name="courseName" placeholder="Course Name *" value={formData.courseName} onChange={handleChange} style={styles.input} required />
              <select name="department" value={formData.department} onChange={handleChange} style={styles.select} required>
                <option value="">Select Department *</option>
                <option value="CSE">Computer Science</option>
                <option value="ECE">Electronics</option>
                <option value="ME">Mechanical</option>
                <option value="CE">Civil</option>
                <option value="IT">Information Technology</option>
              </select>
              <input name="credits" type="number" placeholder="Credits *" value={formData.credits} onChange={handleChange} style={styles.input} required />
              <select name="semester" value={formData.semester} onChange={handleChange} style={styles.select}>
                <option value="">Select Semester</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
              <select name="theoryPractical" value={formData.theoryPractical} onChange={handleChange} style={styles.select}>
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
                <option value="Theory+Practical">Theory + Practical</option>
              </select>
            </div>
            <button type="submit" style={styles.submitBtn}>Create Course</button>
          </form>
        )}

        {loading ? (
          <div style={styles.loading}><div style={styles.spinner}></div><p>Loading courses...</p></div>
        ) : courses.length === 0 ? (
          <div style={styles.noData}><div style={styles.noDataIcon}>📚</div><p>No courses found</p></div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead><tr><th>Code</th><th>Course Name</th><th>Department</th><th>Credits</th><th>Semester</th><th>Type</th><th>Action</th></tr></thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c._id}>
                    <td><span style={styles.courseCode}>{c.courseCode}</span></td>
                    <td>{c.courseName}</td>
                    <td>{c.department}</td>
                    <td>{c.credits}</td>
                    <td>{c.semester || "N/A"}</td>
                    <td>{c.theoryPractical}</td>
                    <td><button onClick={() => handleDelete(c.courseCode)} style={styles.deleteBtn}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", fontFamily: "'Inter', sans-serif" },
  header: { background: "rgba(255,255,255,0.95)", padding: "20px 30px", borderBottom: "1px solid rgba(0,0,0,0.1)" },
  headerContent: { maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" },
  backBtn: { background: "rgba(0,0,0,0.1)", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", marginBottom: "10px" },
  title: { margin: "0 0 5px", fontSize: "2rem", fontWeight: "700", color: "#2d3748" },
  subtitle: { margin: 0, fontSize: "0.9rem", color: "#718096" },
  addBtn: { background: "#10b981", color: "white", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  content: { maxWidth: "1200px", margin: "0 auto", padding: "30px" },
  form: { background: "white", borderRadius: "12px", padding: "20px", marginBottom: "20px" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" },
  input: { padding: "12px", border: "2px solid #e2e8f0", borderRadius: "8px" },
  select: { padding: "12px", border: "2px solid #e2e8f0", borderRadius: "8px", background: "white" },
  submitBtn: { background: "#10b981", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  loading: { textAlign: "center", padding: "60px", background: "white", borderRadius: "12px" },
  spinner: { width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #f58003", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" },
  noData: { background: "white", borderRadius: "12px", padding: "60px", textAlign: "center", color: "#718096" },
  noDataIcon: { fontSize: "3rem", marginBottom: "10px" },
  tableContainer: { background: "white", borderRadius: "12px", overflow: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  table: { width: "100%", borderCollapse: "collapse" },
  courseCode: { background: "#e3f2fd", color: "#1976d2", padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem" },
  deleteBtn: { background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" },
  accessDenied: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", textAlign: "center" }
};

export default Courses;