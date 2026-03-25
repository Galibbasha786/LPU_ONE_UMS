// src/pages/StaffManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  // Role guard
  if (!user || user.role !== "Admin") {
    return (
      <div style={styles.accessDenied}>
        <h2>⛔ Access Denied</h2>
        <p>Only Administrators can manage staff.</p>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          ← Go Back
        </button>
      </div>
    );
  }

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [searchTerm, departmentFilter, staff]);

  const fetchStaff = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/users/staff");
      const data = await res.json();
      if (data.success) {
        setStaff(data.staff);
        setFilteredStaff(data.staff);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      showMessage("❌ Failed to load staff data", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = [...staff];
    
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (departmentFilter !== "all") {
      filtered = filtered.filter(member => member.department === departmentFilter);
    }
    
    setFilteredStaff(filtered);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const res = await fetch(`http://localhost:5001/api/users/staff/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          showMessage(`✅ ${name} deleted successfully`, "success");
          fetchStaff();
        } else {
          showMessage(`❌ Failed to delete: ${data.message}`, "error");
        }
      } catch (error) {
        console.error("Error deleting staff:", error);
        showMessage("⚠️ Server error while deleting", "error");
      }
    }
  };

  const getDepartments = () => {
    const depts = [...new Set(staff.map(m => m.department).filter(d => d))];
    return depts;
  };

  const getStats = () => {
    const total = staff.length;
    const professors = staff.filter(m => m.designation?.includes("Professor")).length;
    const departments = getDepartments().length;
    return { total, professors, departments };
  };

  const stats = getStats();

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate("/admin-dashboard")} style={styles.backBtn}>
              ← Back to Dashboard
            </button>
            <h1 style={styles.title}>👨‍🏫 Staff Management</h1>
            <p style={styles.subtitle}>Manage teaching and non-teaching staff</p>
          </div>
          <button onClick={() => navigate("/create-staff")} style={styles.addBtn}>
            + Add New Staff
          </button>
        </div>
      </header>

      <div style={styles.content}>
        {/* Message */}
        {message && (
          <div style={{
            ...styles.message,
            ...(messageType === "success" ? styles.messageSuccess : styles.messageError)
          }}>
            {message}
          </div>
        )}

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>{stats.total}</div>
              <div style={styles.statLabel}>Total Staff</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👨‍🏫</div>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>{stats.professors}</div>
              <div style={styles.statLabel}>Professors</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🏛️</div>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>{stats.departments}</div>
              <div style={styles.statLabel}>Departments</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterSection}>
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="🔍 Search by name, email, employee ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Departments</option>
            {getDepartments().map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading staff data...</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Employee ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Designation</th>
                  <th style={styles.th}>Courses</th>
                  <th style={styles.th}>Actions</th>
                 </tr>
              </thead>
              <tbody>
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={styles.noData}>
                      <div style={styles.noDataIcon}>👨‍🏫</div>
                      <p>No staff members found</p>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => (
                    <tr key={member._id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <span style={styles.employeeBadge}>{member.employeeId}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.staffInfo}>
                          <div style={styles.staffAvatar}>
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <span>{member.name}</span>
                        </div>
                      </td>
                      <td style={styles.td}>{member.email}</td>
                      <td style={styles.td}>
                        <span style={styles.departmentBadge}>{member.department}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.designationBadge}>
                          {member.designation || "Assistant Professor"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.courseCount}>
                          {member.coursesTeaching?.length || 0}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => {
                              setSelectedStaff(member);
                              setShowDetailsModal(true);
                            }}
                            style={styles.viewBtn}
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => navigate(`/edit-staff/${member._id}`)}
                            style={styles.editBtn}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(member._id, member.name)}
                            style={styles.deleteBtn}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Results Summary */}
        {!loading && filteredStaff.length > 0 && (
          <div style={styles.summary}>
            Showing {filteredStaff.length} of {staff.length} staff members
          </div>
        )}
      </div>

      {/* Staff Details Modal */}
      {showDetailsModal && selectedStaff && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Staff Details</h3>
              <button style={styles.modalClose} onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalAvatar}>
                {selectedStaff.name?.charAt(0).toUpperCase()}
              </div>
              <div style={styles.modalInfo}>
                <p><strong>Name:</strong> {selectedStaff.name}</p>
                <p><strong>Employee ID:</strong> {selectedStaff.employeeId}</p>
                <p><strong>Email:</strong> {selectedStaff.email}</p>
                <p><strong>Department:</strong> {selectedStaff.department}</p>
                <p><strong>Designation:</strong> {selectedStaff.designation || "Assistant Professor"}</p>
                <p><strong>Qualification:</strong> {selectedStaff.qualification || "N/A"}</p>
                <p><strong>Experience:</strong> {selectedStaff.experience || "0"} years</p>
                <p><strong>Phone:</strong> {selectedStaff.phoneNumber || "N/A"}</p>
                <p><strong>Join Date:</strong> {selectedStaff.joinDate ? new Date(selectedStaff.joinDate).toLocaleDateString() : "N/A"}</p>
                <p><strong>Courses Teaching:</strong> {selectedStaff.coursesTeaching?.length || 0}</p>
                {selectedStaff.coursesTeaching?.length > 0 && (
                  <div style={styles.coursesList}>
                    <strong>Courses:</strong>
                    <ul>
                      {selectedStaff.coursesTeaching.map((course, idx) => (
                        <li key={idx}>{course.courseId} - {course.courseName} (Sem {course.semester}, Sec {course.section})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
  header: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "20px 30px",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
  },
  headerContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
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
  addBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
  },
  content: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "30px",
  },
  message: {
    padding: "12px 20px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontWeight: "500",
    textAlign: "center",
  },
  messageSuccess: {
    background: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
  },
  messageError: {
    background: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    transition: "transform 0.3s ease",
  },
  statIcon: {
    fontSize: "2rem",
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#2d3748",
  },
  statLabel: {
    fontSize: "0.8rem",
    color: "#718096",
  },
  filterSection: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  searchBox: {
    flex: 1,
  },
  searchInput: {
    width: "100%",
    padding: "12px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.9)",
    fontSize: "0.9rem",
  },
  filterSelect: {
    padding: "12px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.9)",
    fontSize: "0.9rem",
    cursor: "pointer",
    minWidth: "150px",
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
  tableContainer: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "16px",
    overflow: "auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },
  tableHeader: {
    background: "linear-gradient(135deg, #f58003, #e65100)",
  },
  th: {
    padding: "15px",
    textAlign: "left",
    color: "white",
    fontWeight: "600",
  },
  tableRow: {
    borderBottom: "1px solid #e2e8f0",
    "&:hover": {
      background: "#f8f9fa",
    },
  },
  td: {
    padding: "15px",
    verticalAlign: "middle",
  },
  employeeBadge: {
    background: "#e3f2fd",
    color: "#1976d2",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontFamily: "monospace",
  },
  staffInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  staffAvatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f58003, #e65100)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: "0.9rem",
  },
  departmentBadge: {
    background: "#f3e5f5",
    color: "#7b1fa2",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
  },
  designationBadge: {
    background: "#e8f5e8",
    color: "#2e7d32",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
  },
  courseCount: {
    background: "#fff3e0",
    color: "#f57c00",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
  },
  viewBtn: {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  editBtn: {
    background: "#f59e0b",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  deleteBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  noData: {
    textAlign: "center",
    padding: "40px",
    color: "#718096",
  },
  noDataIcon: {
    fontSize: "3rem",
    marginBottom: "10px",
  },
  summary: {
    marginTop: "15px",
    textAlign: "center",
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.85rem",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "white",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "550px",
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 20px",
    borderBottom: "1px solid #e2e8f0",
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    color: "#718096",
  },
  modalBody: {
    padding: "20px",
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  modalAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f58003, #e65100)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "2rem",
    fontWeight: "bold",
  },
  modalInfo: {
    flex: 1,
    "& p": {
      margin: "8px 0",
      fontSize: "0.9rem",
    },
  },
  coursesList: {
    marginTop: "10px",
    "& ul": {
      margin: "5px 0 0 20px",
      fontSize: "0.85rem",
    },
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  button:hover {
    transform: translateY(-2px);
  }
  
  button:active {
    transform: scale(0.98);
  }
  
  input:focus, select:focus {
    border-color: #f58003;
    outline: none;
    box-shadow: 0 0 0 3px rgba(245, 128, 3, 0.1);
  }
`;
document.head.appendChild(styleSheet);

export default StaffManagement;