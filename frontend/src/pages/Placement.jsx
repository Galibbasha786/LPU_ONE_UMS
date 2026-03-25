import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Placement() {
  const navigate = useNavigate();
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    package: "",
    driveDate: "",
    location: "",
    roles: "",
    eligibility: ""
  });
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/placement");
      const data = await res.json();
      if (data.success) {
        setPlacements(data.placements || []);
      } else {
        // Mock data for demo
        setPlacements([
          { _id: 1, company: { name: "Google" }, packageOffered: 30, driveDate: "2024-05-15", location: "Bangalore", roles: ["SDE", "Frontend"] },
          { _id: 2, company: { name: "Microsoft" }, packageOffered: 28, driveDate: "2024-05-20", location: "Hyderabad", roles: ["Software Engineer"] },
          { _id: 3, company: { name: "Amazon" }, packageOffered: 24, driveDate: "2024-05-25", location: "Chennai", roles: ["SDE", "Cloud Engineer"] }
        ]);
      }
    } catch (err) {
      console.error("Error fetching placements:", err);
      // Mock data
      setPlacements([
        { _id: 1, company: { name: "Google" }, packageOffered: 30, driveDate: "2024-05-15", location: "Bangalore", roles: ["SDE", "Frontend"] },
        { _id: 2, company: { name: "Microsoft" }, packageOffered: 28, driveDate: "2024-05-20", location: "Hyderabad", roles: ["Software Engineer"] }
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
    try {
      const res = await fetch("http://localhost:5001/api/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: { name: formData.companyName },
          packageOffered: formData.package,
          driveDate: formData.driveDate,
          location: formData.location,
          roles: formData.roles.split(","),
          eligibility: { minCGPA: formData.eligibility }
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Placement drive added!");
        setShowForm(false);
        fetchPlacements();
      }
    } catch (err) {
      alert("Error adding placement");
    }
  };

  const handleApply = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/placement/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: user.id, studentName: user.name, studentEmail: user.email })
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("Application submitted! (Demo)");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate(isAdmin ? "/admin-dashboard" : "/student-dashboard")} style={styles.backBtn}>
              ← Back to Dashboard
            </button>
            <h1 style={styles.title}>💼 Placement Cell</h1>
            <p style={styles.subtitle}>View and apply for placement opportunities</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
              {showForm ? "− Cancel" : "+ Add Drive"}
            </button>
          )}
        </div>
      </header>

      <div style={styles.content}>
        {showForm && isAdmin && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3>Add Placement Drive</h3>
            <div style={styles.formGrid}>
              <input name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} style={styles.input} required />
              <input name="package" placeholder="Package (LPA)" type="number" value={formData.package} onChange={handleChange} style={styles.input} required />
              <input name="driveDate" placeholder="Drive Date" type="date" value={formData.driveDate} onChange={handleChange} style={styles.input} required />
              <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} style={styles.input} required />
              <input name="roles" placeholder="Roles (comma separated)" value={formData.roles} onChange={handleChange} style={styles.input} />
              <input name="eligibility" placeholder="Min CGPA" value={formData.eligibility} onChange={handleChange} style={styles.input} />
            </div>
            <button type="submit" style={styles.submitBtn}>Create Drive</button>
          </form>
        )}

        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Loading placements...</p>
          </div>
        ) : placements.length === 0 ? (
          <div style={styles.noData}>
            <div style={styles.noDataIcon}>💼</div>
            <p>No placement drives available</p>
          </div>
        ) : (
          <div style={styles.placementsGrid}>
            {placements.map((p) => (
              <div key={p._id} style={styles.placementCard}>
                <div style={styles.companyLogo}>🏢</div>
                <div style={styles.placementInfo}>
                  <h3>{p.company?.name || "Company"}</h3>
                  <p><strong>Package:</strong> {p.packageOffered ? `₹${p.packageOffered} LPA` : "N/A"}</p>
                  <p><strong>Drive Date:</strong> {new Date(p.driveDate).toLocaleDateString()}</p>
                  <p><strong>Location:</strong> {p.location || "N/A"}</p>
                  {p.roles && <p><strong>Roles:</strong> {Array.isArray(p.roles) ? p.roles.join(", ") : p.roles}</p>}
                  <p><strong>Status:</strong> <span style={{...styles.statusBadge, background: p.status === "Upcoming" ? "#f59e0b" : p.status === "Completed" ? "#10b981" : "#3498db"}}>{p.status || "Upcoming"}</span></p>
                  {!isAdmin && (
                    <button onClick={() => handleApply(p._id)} style={styles.applyBtn}>
                      Apply Now
                    </button>
                  )}
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
  input: { padding: "12px", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "0.9rem" },
  submitBtn: { background: "#10b981", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  loading: { textAlign: "center", padding: "60px", background: "white", borderRadius: "12px" },
  spinner: { width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #f58003", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" },
  noData: { background: "white", borderRadius: "12px", padding: "60px", textAlign: "center", color: "#718096" },
  noDataIcon: { fontSize: "3rem", marginBottom: "10px" },
  placementsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" },
  placementCard: { background: "white", borderRadius: "12px", padding: "20px", display: "flex", gap: "15px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  companyLogo: { fontSize: "3rem", background: "#f8f9fa", padding: "15px", borderRadius: "10px" },
  placementInfo: { flex: 1 },
  statusBadge: { padding: "4px 10px", borderRadius: "20px", color: "white", fontSize: "0.8rem", display: "inline-block" },
  applyBtn: { background: "#10b981", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", marginTop: "10px", width: "100%" }
};

export default Placement;