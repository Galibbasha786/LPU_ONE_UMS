import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Fees() {
  const navigate = useNavigate();
  const [fees, setFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Online");
  const user = JSON.parse(localStorage.getItem("user"));

  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    fetchFees();
  }, []);

  useEffect(() => {
    filterFees();
  }, [searchTerm, statusFilter, fees]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/users/fees");
      const data = await res.json();
      setFees(data.fees || []);
      setFilteredFees(data.fees || []);
    } catch (err) {
      console.error("Error loading fees:", err);
      showMessage("⚠️ Failed to load fee records", "error");
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

  const filterFees = () => {
    let filtered = [...fees];
    
    if (searchTerm) {
      filtered = filtered.filter(fee =>
        fee.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(fee => fee.status === statusFilter);
    }
    
    setFilteredFees(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentId || !studentName || !totalAmount) {
      showMessage("❌ Please fill all required fields!", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/users/fees/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          studentName,
          totalAmount: parseFloat(totalAmount),
          amountPaid: parseFloat(amountPaid) || 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showMessage("✅ " + data.message, "success");
        setStudentId("");
        setStudentName("");
        setTotalAmount("");
        setAmountPaid("");
        setShowAddForm(false);
        fetchFees();
      } else {
        showMessage("❌ " + data.message, "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("⚠️ Server error while processing fee", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (student) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      showMessage("❌ Please enter a valid amount", "error");
      return;
    }

    const amount = parseFloat(paymentAmount);
    const pendingAmount = student.totalAmount - student.amountPaid;

    if (amount > pendingAmount) {
      showMessage(`❌ Amount cannot exceed pending amount: ₹${pendingAmount}`, "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/users/fees/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.studentId,
          studentName: student.studentName,
          totalAmount: student.totalAmount,
          amountPaid: student.amountPaid + amount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showMessage(`✅ Payment of ₹${amount} recorded for ${student.studentName}`, "success");
        fetchFees();
        setShowPaymentModal(false);
        setPaymentAmount("");
      } else {
        showMessage("❌ Payment failed: " + data.message, "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("⚠️ Server error while processing payment", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Paid": return "#10b981";
      case "Partial": return "#f59e0b";
      case "Pending": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Paid": return "✅";
      case "Partial": return "⚠️";
      case "Pending": return "❌";
      default: return "📊";
    }
  };

  const getProgressPercentage = (paid, total) => {
    if (!total || total === 0) return 0;
    return (paid / total) * 100;
  };

  const totalCollected = fees.reduce((sum, fee) => sum + (fee.amountPaid || 0), 0);
  const totalPending = fees.reduce((sum, fee) => sum + ((fee.totalAmount || 0) - (fee.amountPaid || 0)), 0);
  const totalStudents = fees.length;
  const paidStudents = fees.filter(f => f.status === "Paid").length;
  const pendingStudents = fees.filter(f => f.status === "Pending").length;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate("/admin-dashboard")} style={styles.backBtn}>
              ← Back to Dashboard
            </button>
            <h1 style={styles.title}>💰 Fee Management Portal</h1>
            <p style={styles.subtitle}>Manage student fees, track payments, and generate reports</p>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} style={styles.addBtn}>
            {showAddForm ? "− Cancel" : "+ Add Fee Record"}
          </button>
        </div>
      </header>

      <div style={styles.content}>
        {/* Message */}
        {message && (
          <div style={{
            ...styles.message,
            ...(messageType === "success" ? styles.messageSuccess :
               messageType === "error" ? styles.messageError :
               styles.messageWarning)
          }}>
            {message}
          </div>
        )}

        {/* Statistics Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>{totalStudents}</div>
              <div style={styles.statLabel}>Total Students</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>₹{totalCollected.toLocaleString()}</div>
              <div style={styles.statLabel}>Total Collected</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⏳</div>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>₹{totalPending.toLocaleString()}</div>
              <div style={styles.statLabel}>Pending Amount</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>{paidStudents}</div>
              <div style={styles.statLabel}>Paid Students</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⚠️</div>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>{pendingStudents}</div>
              <div style={styles.statLabel}>Pending Students</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statInfo}>
              <div style={styles.statNumber}>
                {totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0}%
              </div>
              <div style={styles.statLabel}>Collection Rate</div>
            </div>
          </div>
        </div>

        {/* Add Fee Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.formTitle}>Add/Update Fee Record</h3>
            <div style={styles.formGrid}>
              <input
                type="text"
                placeholder="Student ID *"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Student Name *"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="number"
                placeholder="Total Amount *"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="number"
                placeholder="Amount Paid"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formActions}>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? "Processing..." : "💾 Save Fee Record"}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} style={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div style={styles.filterSection}>
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="🔍 Search by Student ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading fee records...</p>
          </div>
        )}

        {/* Fee Table */}
        {!loading && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Student ID</th>
                  <th style={styles.th}>Student Name</th>
                  <th style={styles.th}>Total Amount</th>
                  <th style={styles.th}>Amount Paid</th>
                  <th style={styles.th}>Pending</th>
                  <th style={styles.th}>Progress</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                 </tr>
              </thead>
              <tbody>
                {filteredFees.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={styles.noData}>
                      <div style={styles.noDataIcon}>💰</div>
                      <p>No fee records found</p>
                    </td>
                  </tr>
                ) : (
                  filteredFees.map((fee, index) => {
                    const progress = getProgressPercentage(fee.amountPaid, fee.totalAmount);
                    const pending = fee.totalAmount - fee.amountPaid;
                    return (
                      <tr key={index} style={styles.tableRow}>
                        <td style={styles.td}>{fee.studentId}</td>
                        <td style={styles.td}>{fee.studentName}</td>
                        <td style={styles.td}>₹{fee.totalAmount?.toLocaleString()}</td>
                        <td style={styles.td}>₹{fee.amountPaid?.toLocaleString()}</td>
                        <td style={styles.td}>₹{pending.toLocaleString()}</td>
                        <td style={styles.td}>
                          <div style={styles.progressContainer}>
                            <div style={{...styles.progressBar, width: `${progress}%`, backgroundColor: getStatusColor(fee.status)}}></div>
                            <span style={styles.progressText}>{Math.round(progress)}%</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: getStatusColor(fee.status)
                          }}>
                            {getStatusIcon(fee.status)} {fee.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {fee.status !== "Paid" && (
                            <button
                              onClick={() => {
                                setSelectedStudent(fee);
                                setShowPaymentModal(true);
                              }}
                              style={styles.payBtn}
                            >
                              💳 Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <div style={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Record Payment</h3>
              <button style={styles.modalClose} onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalInfo}>
                <p><strong>Student:</strong> {selectedStudent.studentName}</p>
                <p><strong>Student ID:</strong> {selectedStudent.studentId}</p>
                <p><strong>Total Fee:</strong> ₹{selectedStudent.totalAmount?.toLocaleString()}</p>
                <p><strong>Already Paid:</strong> ₹{selectedStudent.amountPaid?.toLocaleString()}</p>
                <p><strong>Pending Amount:</strong> ₹{(selectedStudent.totalAmount - selectedStudent.amountPaid).toLocaleString()}</p>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Amount to Pay (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  max={selectedStudent.totalAmount - selectedStudent.amountPaid}
                  min="1"
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  style={styles.select}
                >
                  <option value="Online">Online Banking</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div style={styles.modalActions}>
                <button onClick={() => handlePayment(selectedStudent)} style={styles.confirmBtn} disabled={loading}>
                  {loading ? "Processing..." : "Confirm Payment"}
                </button>
                <button onClick={() => setShowPaymentModal(false)} style={styles.cancelModalBtn}>
                  Cancel
                </button>
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
  messageWarning: {
    background: "#fff3e0",
    color: "#f57c00",
    border: "1px solid #ffe0b2",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#2d3748",
  },
  statLabel: {
    fontSize: "0.8rem",
    color: "#718096",
  },
  form: {
    background: "white",
    borderRadius: "16px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  formTitle: {
    margin: "0 0 20px 0",
    color: "#2d3748",
    fontSize: "1.2rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },
  input: {
    padding: "12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
  },
  select: {
    padding: "12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    background: "white",
  },
  formActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  cancelBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
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
    padding: "40px",
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
    background: "white",
    borderRadius: "16px",
    overflow: "auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
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
  progressContainer: {
    position: "relative",
    width: "100px",
    height: "30px",
    background: "#e2e8f0",
    borderRadius: "15px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: "15px",
    transition: "width 0.3s ease",
  },
  progressText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "0.7rem",
    fontWeight: "bold",
    color: "#2d3748",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    color: "white",
    fontSize: "0.8rem",
    fontWeight: "600",
    display: "inline-block",
  },
  payBtn: {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
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
    maxWidth: "450px",
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
  },
  modalInfo: {
    background: "#f8f9fa",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#2d3748",
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
  confirmBtn: {
    flex: 1,
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  cancelModalBtn: {
    flex: 1,
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
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

export default Fees;