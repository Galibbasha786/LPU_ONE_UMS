import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AllotSection() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [section, setSection] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [departments, setDepartments] = useState([]);
  
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Role guard
  if (!user || user.role !== "Admin") {
    return (
      <div style={styles.accessDenied}>
        <h2>⛔ Access Denied</h2>
        <p>Only Administrators can access this page.</p>
        <button onClick={() => navigate("/admin-dashboard")} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/users/students");
      const data = await res.json();
      const studentsList = data.students || [];
      setStudents(studentsList);
      setFilteredStudents(studentsList);
      
      // Extract unique departments
      const uniqueDepts = [...new Set(studentsList.map(s => s.department).filter(d => d))];
      setDepartments(uniqueDepts);
    } catch (err) {
      console.error("Error fetching students:", err);
      showMessage("❌ Failed to fetch students", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  const handleAllot = async (email) => {
    const value = section[email];
    if (!value) {
      showMessage("⚠️ Please enter a section before saving!", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/users/update-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, field: "section", value }),
      });
      const data = await res.json();
      
      if (data.success) {
        showMessage(`✅ Section updated to "${value}" for ${email}`, "success");
        setStudents((prev) =>
          prev.map((s) =>
            s.email === email ? { ...s, section: value } : s
          )
        );
        setFilteredStudents((prev) =>
          prev.map((s) =>
            s.email === email ? { ...s, section: value } : s
          )
        );
        setSection({ ...section, [email]: "" });
      } else {
        showMessage(`❌ Failed to update section: ${data.message}`, "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("⚠️ Server error while updating section.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAllot = async () => {
    const sectionsToUpdate = Object.entries(section).filter(([_, value]) => value);
    if (sectionsToUpdate.length === 0) {
      showMessage("⚠️ No sections entered to update!", "error");
      return;
    }

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const [email, sectionValue] of sectionsToUpdate) {
      try {
        const res = await fetch("http://localhost:5001/api/users/update-field", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, field: "section", value: sectionValue }),
        });
        const data = await res.json();
        
        if (data.success) {
          successCount++;
          setStudents(prev =>
            prev.map(s => s.email === email ? { ...s, section: sectionValue } : s)
          );
          setFilteredStudents(prev =>
            prev.map(s => s.email === email ? { ...s, section: sectionValue } : s)
          );
          setSection(prev => ({ ...prev, [email]: "" }));
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }

    showMessage(`✅ ${successCount} students updated, ❌ ${failCount} failed`, 
      successCount > 0 ? "success" : "error");
    setLoading(false);
  };

  // Filter students based on search and department
  useEffect(() => {
    let filtered = students;
    
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.enrollmentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterDepartment !== "all") {
      filtered = filtered.filter(s => s.department === filterDepartment);
    }
    
    setFilteredStudents(filtered);
  }, [searchTerm, filterDepartment, students]);

  const getSectionStats = () => {
    const sections = {};
    students.forEach(s => {
      const sec = s.section || "Not Assigned";
      sections[sec] = (sections[sec] || 0) + 1;
    });
    return sections;
  };

  const sectionStats = getSectionStats();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🏫 Section Allocation Management</h2>
        <button onClick={() => navigate("/admin-dashboard")} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
      </div>

      {message && (
        <div style={{
          ...styles.message,
          ...(messageType === "success" ? styles.successMessage : styles.errorMessage)
        }}>
          {message}
        </div>
      )}

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👨‍🎓</div>
          <div style={styles.statInfo}>
            <h3>{students.length}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statInfo}>
            <h3>{Object.keys(sectionStats).length}</h3>
            <p>Sections</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⚠️</div>
          <div style={styles.statInfo}>
            <h3>{sectionStats["Not Assigned"] || 0}</h3>
            <p>Unassigned</p>
          </div>
        </div>
      </div>

      {/* Section Distribution */}
      <div style={styles.distributionBox}>
        <h3>📊 Section Distribution</h3>
        <div style={styles.distributionGrid}>
          {Object.entries(sectionStats).map(([sec, count]) => (
            <div key={sec} style={styles.distributionItem}>
              <span style={styles.distributionLabel}>{sec}:</span>
              <span style={styles.distributionCount}>{count} students</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="🔍 Search by name, email, or enrollment ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <button onClick={handleBulkAllot} style={styles.bulkBtn} disabled={loading}>
          {loading ? "Processing..." : "📦 Bulk Allot"}
        </button>
      </div>

      {/* Students Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Enrollment ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Current Section</th>
              <th>Enter Section</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.loadingCell}>
                  <div style={styles.spinner}></div>
                  Loading students...
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.noDataCell}>
                  No students found
                </td>
              </tr>
            ) : (
              filteredStudents.map((s, index) => (
                <tr key={s._id || index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td style={styles.cell}>{index + 1}</td>
                  <td style={styles.cell}>
                    <span style={styles.enrollmentBadge}>
                      {s.enrollmentId || "N/A"}
                    </span>
                  </td>
                  <td style={styles.cell}>
                    <div style={styles.studentName}>
                      <div style={styles.avatar}>
                        {s.name?.charAt(0) || "S"}
                      </div>
                      <span>{s.name}</span>
                    </div>
                  </td>
                  <td style={styles.cell}>{s.email}</td>
                  <td style={styles.cell}>
                    <span style={styles.departmentBadge}>
                      {s.department || "N/A"}
                    </span>
                  </td>
                  <td style={styles.cell}>
                    <span style={{
                      ...styles.sectionBadge,
                      ...(!s.section ? styles.unassignedBadge : {})
                    }}>
                      {s.section || "Not Assigned"}
                    </span>
                  </td>
                  <td style={styles.cell}>
                    <input
                      type="text"
                      placeholder="e.g., CS-A, IT-B"
                      value={section[s.email] || ""}
                      onChange={(e) =>
                        setSection({ ...section, [s.email]: e.target.value })
                      }
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.cell}>
                    <button 
                      onClick={() => handleAllot(s.email)} 
                      style={styles.saveBtn}
                      disabled={loading}
                    >
                      💾 Save
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Section Suggestions */}
      <div style={styles.suggestions}>
        <h4>💡 Quick Section Suggestions:</h4>
        <div style={styles.suggestionButtons}>
          <button onClick={() => {
            filteredStudents.forEach(s => {
              if (!s.section) {
                setSection(prev => ({ ...prev, [s.email]: "CS-A" }));
              }
            });
          }} style={styles.suggestionBtn}>
            Set All Unassigned to CS-A
          </button>
          <button onClick={() => {
            filteredStudents.forEach(s => {
              if (!s.section) {
                setSection(prev => ({ ...prev, [s.email]: "IT-B" }));
              }
            });
          }} style={styles.suggestionBtn}>
            Set All Unassigned to IT-B
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "2rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: {
    color: "white",
    fontSize: "2rem",
    margin: 0,
  },
  backBtn: {
    background: "rgba(255,255,255,0.2)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  accessDenied: {
    textAlign: "center",
    marginTop: "100px",
    color: "red",
  },
  message: {
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    textAlign: "center",
    fontWeight: "500",
  },
  successMessage: {
    background: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
  },
  errorMessage: {
    background: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statCard: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  statIcon: {
    fontSize: "2.5rem",
  },
  statInfo: {
    "& h3": {
      margin: 0,
      fontSize: "1.8rem",
      fontWeight: "bold",
      color: "#2c3e50",
    },
    "& p": {
      margin: 0,
      color: "#7f8c8d",
      fontSize: "0.9rem",
    },
  },
  distributionBox: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "2rem",
    "& h3": {
      margin: "0 0 1rem 0",
      color: "#2c3e50",
    },
  },
  distributionGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
  },
  distributionItem: {
    background: "#f8f9fa",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    display: "flex",
    gap: "0.5rem",
  },
  distributionLabel: {
    fontWeight: "bold",
    color: "#2c3e50",
  },
  distributionCount: {
    color: "#7f8c8d",
  },
  filters: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    padding: "0.8rem",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    fontSize: "1rem",
    outline: "none",
  },
  filterSelect: {
    padding: "0.8rem",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    fontSize: "1rem",
    background: "white",
    cursor: "pointer",
  },
  bulkBtn: {
    background: "#27ae60",
    color: "white",
    border: "none",
    padding: "0.8rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  tableContainer: {
    background: "white",
    borderRadius: "12px",
    overflow: "auto",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },
  rowEven: {
    background: "#f8f9fa",
  },
  rowOdd: {
    background: "white",
  },
  cell: {
    padding: "1rem",
    textAlign: "left",
    borderBottom: "1px solid #e1e8ed",
  },
  loadingCell: {
    textAlign: "center",
    padding: "2rem",
    color: "#7f8c8d",
  },
  noDataCell: {
    textAlign: "center",
    padding: "2rem",
    color: "#7f8c8d",
  },
  studentName: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#3498db",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  enrollmentBadge: {
    background: "#e3f2fd",
    color: "#1976d2",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontFamily: "monospace",
  },
  departmentBadge: {
    background: "#f3e5f5",
    color: "#7b1fa2",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.8rem",
  },
  sectionBadge: {
    background: "#e8f5e8",
    color: "#2e7d32",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.8rem",
  },
  unassignedBadge: {
    background: "#ffebee",
    color: "#c62828",
  },
  input: {
    padding: "0.5rem",
    border: "1px solid #e1e8ed",
    borderRadius: "4px",
    width: "120px",
    fontSize: "0.9rem",
  },
  saveBtn: {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "0.4rem 0.8rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  spinner: {
    display: "inline-block",
    width: "20px",
    height: "20px",
    border: "2px solid #f3f3f3",
    borderTop: "2px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: "0.5rem",
  },
  suggestions: {
    marginTop: "2rem",
    background: "white",
    padding: "1rem",
    borderRadius: "12px",
    "& h4": {
      margin: "0 0 0.5rem 0",
      color: "#2c3e50",
    },
  },
  suggestionButtons: {
    display: "flex",
    gap: "1rem",
  },
  suggestionBtn: {
    background: "#ecf0f1",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
};

// Add CSS animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default AllotSection;