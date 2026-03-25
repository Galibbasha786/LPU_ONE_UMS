import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Internships() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const isStudent = user?.role === "Student";
  const isAdmin = user?.role === "Admin";

  const internships = [
    {
      id: 1,
      title: "Software Development Intern",
      company: "Tech Corp",
      duration: "3 months",
      stipend: "₹25,000/month",
      location: "Remote",
      deadline: "2024-05-15",
      skills: ["React", "Node.js", "MongoDB"]
    },
    {
      id: 2,
      title: "Data Science Intern",
      company: "Data Analytics Inc",
      duration: "6 months",
      stipend: "₹30,000/month",
      location: "Bangalore",
      deadline: "2024-05-20",
      skills: ["Python", "Machine Learning", "SQL"]
    },
    {
      id: 3,
      title: "Marketing Intern",
      company: "Digital Solutions",
      duration: "2 months",
      stipend: "₹15,000/month",
      location: "Mumbai",
      deadline: "2024-05-10",
      skills: ["Digital Marketing", "Social Media", "Content Writing"]
    }
  ];

  const handleApply = (internship) => {
    if (applications.includes(internship.id)) {
      alert("Already applied for this internship");
      return;
    }
    setApplications([...applications, internship.id]);
    alert(`Successfully applied for ${internship.title} at ${internship.company}`);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate(isStudent ? "/student-dashboard" : "/admin-dashboard")} style={styles.backBtn}>
              ← Back to Dashboard
            </button>
            <h1 style={styles.title}>💼 Internships</h1>
            <p style={styles.subtitle}>Explore internship opportunities and kickstart your career</p>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.internshipsGrid}>
          {internships.map(internship => (
            <div key={internship.id} style={styles.internshipCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>{internship.title}</div>
                <div style={styles.cardCompany}>{internship.company}</div>
              </div>
              <div style={styles.cardDetails}>
                <div style={styles.detailItem}>
                  <span>📅 Duration:</span>
                  <span>{internship.duration}</span>
                </div>
                <div style={styles.detailItem}>
                  <span>💰 Stipend:</span>
                  <span style={styles.stipend}>{internship.stipend}</span>
                </div>
                <div style={styles.detailItem}>
                  <span>📍 Location:</span>
                  <span>{internship.location}</span>
                </div>
                <div style={styles.detailItem}>
                  <span>⏰ Deadline:</span>
                  <span style={styles.deadline}>{new Date(internship.deadline).toLocaleDateString()}</span>
                </div>
                <div style={styles.skills}>
                  <strong>Skills Required:</strong>
                  <div style={styles.skillsList}>
                    {internship.skills.map((skill, idx) => (
                      <span key={idx} style={styles.skillBadge}>{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
              {isStudent && (
                <button
                  onClick={() => handleApply(internship)}
                  disabled={applications.includes(internship.id)}
                  style={{
                    ...styles.applyBtn,
                    ...(applications.includes(internship.id) ? styles.disabledBtn : {})
                  }}
                >
                  {applications.includes(internship.id) ? "✓ Applied" : "Apply Now"}
                </button>
              )}
            </div>
          ))}
        </div>
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
  internshipsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "20px",
  },
  internshipCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease",
  },
  cardHeader: {
    marginBottom: "15px",
  },
  cardTitle: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: "4px",
  },
  cardCompany: {
    color: "#f58003",
    fontWeight: "600",
  },
  cardDetails: {
    marginBottom: "20px",
  },
  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontSize: "0.9rem",
  },
  stipend: {
    color: "#10b981",
    fontWeight: "600",
  },
  deadline: {
    color: "#ef4444",
  },
  skills: {
    marginTop: "10px",
  },
  skillsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
  },
  skillBadge: {
    background: "#e2e8f0",
    color: "#4a5568",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.75rem",
  },
  applyBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  disabledBtn: {
    background: "#9ca3af",
    cursor: "not-allowed",
  },
};

export default Internships;