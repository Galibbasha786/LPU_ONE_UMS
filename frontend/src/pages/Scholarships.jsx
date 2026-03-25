import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Scholarships() {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "Admin";
  const isStudent = user?.role === "Student";

  // Mock scholarships data
  const mockScholarships = [
    { id: 1, name: "Merit Scholarship", amount: "₹50,000", criteria: "CGPA >= 8.5", deadline: "2024-04-30", category: "Academic", description: "For top-performing students" },
    { id: 2, name: "Sports Excellence", amount: "₹30,000", criteria: "State/National Level Player", deadline: "2024-05-15", category: "Sports", description: "For outstanding sports achievements" },
    { id: 3, name: "Need-Based Scholarship", amount: "₹25,000", criteria: "Family Income < ₹3 LPA", deadline: "2024-04-20", category: "Financial", description: "For students from economically weaker sections" }
  ];

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/scholarships");
      const data = await res.json();
      if (data.success && data.scholarships.length > 0) {
        setScholarships(data.scholarships);
      } else {
        setScholarships(mockScholarships);
      }
    } catch (err) {
      console.error("Error fetching scholarships:", err);
      setScholarships(mockScholarships);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (scholarship) => {
    if (applications.includes(scholarship.id)) {
      alert("Already applied for this scholarship");
      return;
    }
    setApplications([...applications, scholarship.id]);
    alert(`Successfully applied for ${scholarship.name}`);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate(isAdmin ? "/admin-dashboard" : "/student-dashboard")} style={styles.backBtn}>← Back to Dashboard</button>
            <h1 style={styles.title}>🎓 Scholarships</h1>
            <p style={styles.subtitle}>Explore scholarship opportunities and apply for financial aid</p>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.tabs}>
          <button onClick={() => setActiveTab("available")} style={{...styles.tab, ...(activeTab === "available" ? styles.activeTab : {})}}>Available Scholarships</button>
          {isStudent && <button onClick={() => setActiveTab("applied")} style={{...styles.tab, ...(activeTab === "applied" ? styles.activeTab : {})}}>My Applications ({applications.length})</button>}
        </div>

        {loading ? (
          <div style={styles.loading}><div style={styles.spinner}></div><p>Loading scholarships...</p></div>
        ) : activeTab === "available" ? (
          <div style={styles.scholarshipsGrid}>
            {scholarships.map(scholarship => (
              <div key={scholarship.id || scholarship._id} style={styles.scholarshipCard}>
                <div style={styles.cardHeader}><div style={styles.cardIcon}>🎓</div><div style={styles.cardTitle}>{scholarship.name}</div></div>
                <div style={styles.cardAmount}>{scholarship.amount}</div>
                <div style={styles.cardDetails}>
                  <div><strong>Category:</strong> {scholarship.category}</div>
                  <div><strong>Criteria:</strong> {scholarship.criteria}</div>
                  <div><strong>Deadline:</strong> {new Date(scholarship.deadline).toLocaleDateString()}</div>
                  <div><strong>Description:</strong> {scholarship.description}</div>
                </div>
                {isStudent && (
                  <button onClick={() => handleApply(scholarship)} disabled={applications.includes(scholarship.id || scholarship._id)} style={{...styles.applyBtn, ...(applications.includes(scholarship.id || scholarship._id) ? styles.disabledBtn : {})}}>
                    {applications.includes(scholarship.id || scholarship._id) ? "✓ Applied" : "Apply Now"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.applicationsCard}>
            {applications.length === 0 ? (
              <div style={styles.noData}><div style={styles.noDataIcon}>📝</div><p>No applications yet</p><p style={styles.noDataSub}>Browse available scholarships and apply now!</p></div>
            ) : (
              applications.map(appId => {
                const scholarship = scholarships.find(s => (s.id || s._id) === appId);
                return scholarship ? (
                  <div key={appId} style={styles.applicationItem}>
                    <div style={styles.applicationHeader}><div style={styles.applicationTitle}>{scholarship.name}</div><div style={styles.applicationStatus}>Pending Review</div></div>
                    <div><strong>Amount:</strong> {scholarship.amount}</div>
                    <div><strong>Applied on:</strong> {new Date().toLocaleDateString()}</div>
                    <div><strong>Status:</strong> Under Review</div>
                  </div>
                ) : null;
              })
            )}
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
  tabs: { display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "2px solid rgba(255,255,255,0.3)", paddingBottom: "10px" },
  tab: { background: "none", border: "none", padding: "10px 20px", fontSize: "1rem", fontWeight: "500", cursor: "pointer", color: "white", borderRadius: "8px" },
  activeTab: { background: "rgba(255,255,255,0.2)", color: "white" },
  loading: { textAlign: "center", padding: "60px", background: "white", borderRadius: "12px" },
  spinner: { width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #f58003", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" },
  scholarshipsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" },
  scholarshipCard: { background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  cardHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" },
  cardIcon: { fontSize: "2rem" },
  cardTitle: { fontSize: "1.2rem", fontWeight: "bold", color: "#2d3748" },
  cardAmount: { fontSize: "1.5rem", fontWeight: "bold", color: "#f58003", marginBottom: "15px" },
  cardDetails: { marginBottom: "20px", "& div": { marginBottom: "8px", fontSize: "0.9rem", color: "#4a5568" } },
  applyBtn: { width: "100%", background: "#10b981", color: "white", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  disabledBtn: { background: "#9ca3af", cursor: "not-allowed" },
  applicationsCard: { background: "white", borderRadius: "16px", padding: "20px" },
  applicationItem: { border: "1px solid #e2e8f0", borderRadius: "12px", padding: "15px", marginBottom: "15px" },
  applicationHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  applicationTitle: { fontSize: "1.1rem", fontWeight: "bold", color: "#2d3748" },
  applicationStatus: { background: "#fef3c7", color: "#d97706", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem" },
  noData: { textAlign: "center", padding: "40px", color: "#718096" },
  noDataIcon: { fontSize: "3rem", marginBottom: "10px" },
  noDataSub: { fontSize: "0.8rem", marginTop: "5px" },
  accessDenied: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", textAlign: "center" }
};

export default Scholarships;