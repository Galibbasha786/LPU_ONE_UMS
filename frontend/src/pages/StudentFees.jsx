import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import lpuLogo from "../assets/logo.jpg";

function StudentFees() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [fee, setFee] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Online");

  // Role guard
  if (!user || user.role !== "Student") {
    return (
      <div style={styles.accessDenied}>
        <h2>⛔ Access Denied</h2>
        <p>Only students can view fee details.</p>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          ← Go Back to Login
        </button>
      </div>
    );
  }

  useEffect(() => {
    fetchFeeDetails();
    fetchPaymentHistory();
  }, [user.email]);

  const fetchFeeDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/users/fees/${user.email}`);
      const data = await res.json();
      if (data.success && data.fee) {
        setFee(data.fee);
      }
    } catch (err) {
      console.error("Error loading fee info:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      // In a real app, you'd have a payment history endpoint
      // For now, using mock data
      const mockPayments = [
        { id: 1, date: "2024-01-15", amount: 25000, mode: "Online", receipt: "RCPT001", status: "Success" },
        { id: 2, date: "2023-07-20", amount: 25000, mode: "Bank Transfer", receipt: "RCPT002", status: "Success" },
        { id: 3, date: "2023-01-10", amount: 25000, mode: "Online", receipt: "RCPT003", status: "Success" },
      ];
      setPaymentHistory(mockPayments);
    } catch (err) {
      console.error("Error fetching payment history:", err);
    }
  };

  const handlePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const amount = parseFloat(paymentAmount);
    const pendingAmount = fee ? fee.totalAmount - fee.amountPaid : 0;

    if (amount > pendingAmount) {
      alert(`Amount cannot exceed pending amount: ₹${pendingAmount}`);
      return;
    }

    setLoading(true);
    try {
      // In a real app, you'd call a payment API
      const newPayment = {
        id: paymentHistory.length + 1,
        date: new Date().toISOString().split('T')[0],
        amount: amount,
        mode: paymentMode,
        receipt: `RCPT${Date.now()}`,
        status: "Success"
      };
      
      setPaymentHistory([newPayment, ...paymentHistory]);
      
      // Update fee record
      setFee({
        ...fee,
        amountPaid: fee.amountPaid + amount,
        status: fee.amountPaid + amount >= fee.totalAmount ? "Paid" : "Partial"
      });
      
      setShowPaymentModal(false);
      setPaymentAmount("");
      alert(`✅ Payment of ₹${amount} successful! Receipt: ${newPayment.receipt}`);
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
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

  const getStatusBadge = (status) => {
    switch(status) {
      case "Paid": return "✅ Paid";
      case "Partial": return "⚠️ Partial";
      case "Pending": return "❌ Pending";
      default: return status;
    }
  };

  const getProgressPercentage = () => {
    if (!fee) return 0;
    return (fee.amountPaid / fee.totalAmount) * 100;
  };

  const pendingAmount = fee ? fee.totalAmount - fee.amountPaid : 0;
  const progressPercentage = getProgressPercentage();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading fee details...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={lpuLogo} alt="LPU Logo" style={styles.logo} />
          <div style={styles.headerText}>
            <h1 style={styles.title}>Lovely Professional University</h1>
            <p style={styles.subtitle}>Fee Management Portal</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userDetails}>
              <span style={styles.welcome}>{user.name}</span>
              <span style={styles.userRole}>Student</span>
            </div>
            <button onClick={() => navigate("/student-dashboard")} style={styles.backBtn}>
              ← Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.content}>
          <h2 style={styles.sectionTitle}>💰 Fee Details</h2>

          {!fee ? (
            <div style={styles.noFeeCard}>
              <div style={styles.noFeeIcon}>📭</div>
              <h3>No Fee Record Found</h3>
              <p>Your fee details will appear here once they are added by the administration.</p>
              <button onClick={() => navigate("/student-dashboard")} style={styles.dashboardBtn}>
                Back to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Fee Summary Cards */}
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>💰</div>
                  <div style={styles.statInfo}>
                    <h3 style={styles.statNumber}>₹{fee.totalAmount?.toLocaleString() || "0"}</h3>
                    <p style={styles.statLabel}>Total Fees</p>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>✅</div>
                  <div style={styles.statInfo}>
                    <h3 style={styles.statNumber}>₹{fee.amountPaid?.toLocaleString() || "0"}</h3>
                    <p style={styles.statLabel}>Amount Paid</p>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>⚠️</div>
                  <div style={styles.statInfo}>
                    <h3 style={styles.statNumber}>₹{pendingAmount.toLocaleString()}</h3>
                    <p style={styles.statLabel}>Pending Amount</p>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>📊</div>
                  <div style={styles.statInfo}>
                    <h3 style={{
                      ...styles.statNumber,
                      color: getStatusColor(fee.status)
                    }}>
                      {getStatusBadge(fee.status)}
                    </h3>
                    <p style={styles.statLabel}>Fee Status</p>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div style={styles.progressCard}>
                <h3>Payment Progress</h3>
                <div style={styles.progressBarContainer}>
                  <div style={{
                    ...styles.progressBar,
                    width: `${progressPercentage}%`,
                    backgroundColor: getStatusColor(fee.status)
                  }}></div>
                </div>
                <div style={styles.progressStats}>
                  <span>₹{fee.amountPaid?.toLocaleString() || "0"} Paid</span>
                  <span>{progressPercentage.toFixed(1)}% Complete</span>
                  <span>₹{pendingAmount.toLocaleString()} Remaining</span>
                </div>
              </div>

              {/* Student Info Card */}
              <div style={styles.infoCard}>
                <div style={styles.studentInfoHeader}>
                  <div style={styles.studentAvatarLarge}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.studentInfoDetails}>
                    <h3>{fee.studentName || user.name}</h3>
                    <p>{user.email}</p>
                    <div style={styles.studentMeta}>
                      <span>Student ID: {fee.studentId || user.email}</span>
                      <span>Department: {user.department || "Not Assigned"}</span>
                      <span>Semester: {user.semester || "Current"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div style={styles.breakdownCard}>
                <h3>📋 Fee Breakdown</h3>
                <div style={styles.breakdownList}>
                  <div style={styles.breakdownItem}>
                    <span>Tuition Fee</span>
                    <span>₹{Math.round(fee.totalAmount * 0.6)}</span>
                  </div>
                  <div style={styles.breakdownItem}>
                    <span>Hostel Fee</span>
                    <span>₹{Math.round(fee.totalAmount * 0.2)}</span>
                  </div>
                  <div style={styles.breakdownItem}>
                    <span>Transport Fee</span>
                    <span>₹{Math.round(fee.totalAmount * 0.1)}</span>
                  </div>
                  <div style={styles.breakdownItem}>
                    <span>Library & Other Fees</span>
                    <span>₹{Math.round(fee.totalAmount * 0.1)}</span>
                  </div>
                  <div style={styles.breakdownItemTotal}>
                    <strong>Total</strong>
                    <strong>₹{fee.totalAmount?.toLocaleString() || "0"}</strong>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              {fee.status !== "Paid" && (
                <div style={styles.paymentCard}>
                  <button onClick={() => setShowPaymentModal(true)} style={styles.payNowBtn}>
                    💳 Pay Now
                  </button>
                  <p style={styles.paymentNote}>
                    Last date to pay: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Payment History */}
              <div style={styles.historyCard}>
                <h3>📜 Payment History</h3>
                {paymentHistory.length > 0 ? (
                  <div style={styles.historyTable}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeader}>
                          <th style={styles.th}>Date</th>
                          <th style={styles.th}>Receipt No.</th>
                          <th style={styles.th}>Amount</th>
                          <th style={styles.th}>Payment Mode</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Download</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((payment) => (
                          <tr key={payment.id} style={styles.tableRow}>
                            <td style={styles.td}>{new Date(payment.date).toLocaleDateString()}</td>
                            <td style={styles.td}>{payment.receipt}</td>
                            <td style={styles.td}>₹{payment.amount.toLocaleString()}</td>
                            <td style={styles.td}>{payment.mode}</td>
                            <td style={styles.td}>
                              <span style={styles.successBadge}>{payment.status}</span>
                            </td>
                            <td style={styles.td}>
                              <button style={styles.downloadReceiptBtn}>
                                📄 Receipt
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={styles.noData}>No payment history available</p>
                )}
              </div>

              {/* Help Section */}
              <div style={styles.helpCard}>
                <h3>❓ Need Help?</h3>
                <div style={styles.helpContent}>
                  <div style={styles.helpItem}>
                    <span>📞</span>
                    <span>Fee Help Desk: +91 1234567890</span>
                  </div>
                  <div style={styles.helpItem}>
                    <span>📧</span>
                    <span>Email: fees@lpu.edu.in</span>
                  </div>
                  <div style={styles.helpItem}>
                    <span>🏛️</span>
                    <span>Visit Accounts Office: Block 7, Ground Floor</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Make Payment</h3>
              <button style={styles.modalClose} onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalInfo}>
                <p><strong>Total Fees:</strong> ₹{fee.totalAmount?.toLocaleString()}</p>
                <p><strong>Already Paid:</strong> ₹{fee.amountPaid?.toLocaleString()}</p>
                <p><strong>Pending Amount:</strong> ₹{pendingAmount.toLocaleString()}</p>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Amount to Pay (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  max={pendingAmount}
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
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>
              <div style={styles.modalActions}>
                <button onClick={handlePayment} style={styles.confirmBtn} disabled={loading}>
                  {loading ? "Processing..." : "Pay Now"}
                </button>
                <button onClick={() => setShowPaymentModal(false)} style={styles.cancelBtn}>
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
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    borderBottom: "3px solid #f58003ff",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  logo: {
    width: "60px",
    height: "60px",
    borderRadius: "10px",
    objectFit: "cover",
  },
  headerText: {
    color: "#2c3e50",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  subtitle: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#7f8c8d",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  userAvatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "#f58003",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
  },
  welcome: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#2c3e50",
  },
  userRole: {
    fontSize: "0.75rem",
    color: "#7f8c8d",
  },
  backBtn: {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  mainContent: {
    padding: "2rem",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sectionTitle: {
    color: "white",
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #f58003",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "1.5rem",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  statIcon: {
    fontSize: "2rem",
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    margin: 0,
    color: "#2c3e50",
  },
  statLabel: {
    margin: 0,
    color: "#7f8c8d",
    fontSize: "0.85rem",
  },
  progressCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    "& h3": {
      margin: "0 0 1rem 0",
      color: "#2c3e50",
    },
  },
  progressBarContainer: {
    height: "12px",
    background: "#e1e8ed",
    borderRadius: "6px",
    overflow: "hidden",
    marginBottom: "0.5rem",
  },
  progressBar: {
    height: "100%",
    borderRadius: "6px",
    transition: "width 0.3s ease",
  },
  progressStats: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
    color: "#7f8c8d",
  },
  infoCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  studentInfoHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  studentAvatarLarge: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f58003, #f58003)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "2rem",
    fontWeight: "bold",
  },
  studentInfoDetails: {
    flex: 1,
    "& h3": {
      margin: "0 0 0.3rem 0",
      color: "#2c3e50",
    },
    "& p": {
      margin: "0 0 0.5rem 0",
      color: "#7f8c8d",
    },
  },
  studentMeta: {
    display: "flex",
    gap: "1rem",
    fontSize: "0.85rem",
    color: "#7f8c8d",
  },
  breakdownCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    "& h3": {
      margin: "0 0 1rem 0",
      color: "#2c3e50",
    },
  },
  breakdownList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  breakdownItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0",
    borderBottom: "1px solid #e1e8ed",
  },
  breakdownItemTotal: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.8rem 0",
    marginTop: "0.5rem",
    borderTop: "2px solid #e1e8ed",
  },
  paymentCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "2rem",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  payNowBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    padding: "1rem 2rem",
    borderRadius: "10px",
    fontSize: "1.2rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "0.5rem",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
    },
  },
  paymentNote: {
    fontSize: "0.8rem",
    color: "#7f8c8d",
    margin: 0,
  },
  historyCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    "& h3": {
      margin: "0 0 1rem 0",
      color: "#2c3e50",
    },
  },
  historyTable: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    background: "#f8f9fa",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    fontWeight: "600",
    color: "#2c3e50",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e1e8ed",
  },
  tableRow: {
    "&:hover": {
      background: "#f8f9fa",
    },
  },
  successBadge: {
    padding: "4px 8px",
    background: "#d4edda",
    color: "#155724",
    borderRadius: "4px",
    fontSize: "0.85rem",
  },
  downloadReceiptBtn: {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.75rem",
  },
  helpCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    "& h3": {
      margin: "0 0 1rem 0",
      color: "#2c3e50",
    },
  },
  helpContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  helpItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    fontSize: "0.9rem",
    color: "#7f8c8d",
  },
  noFeeCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "3rem",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  noFeeIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  dashboardBtn: {
    background: "#f58003",
    color: "white",
    border: "none",
    padding: "0.8rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    marginTop: "1rem",
  },
  noData: {
    textAlign: "center",
    color: "#7f8c8d",
    padding: "2rem",
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
  // Modal Styles
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
    borderRadius: "12px",
    width: "90%",
    maxWidth: "450px",
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #e1e8ed",
    "& h3": {
      margin: 0,
      color: "#2c3e50",
    },
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#7f8c8d",
  },
  modalBody: {
    padding: "1.5rem",
  },
  modalInfo: {
    background: "#f8f9fa",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    "& p": {
      margin: "0.3rem 0",
    },
  },
  formGroup: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "600",
    color: "#2c3e50",
  },
  input: {
    width: "100%",
    padding: "0.8rem",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    fontSize: "1rem",
    outline: "none",
    "&:focus": {
      borderColor: "#f58003",
    },
  },
  select: {
    width: "100%",
    padding: "0.8rem",
    border: "2px solid #e1e8ed",
    borderRadius: "8px",
    fontSize: "1rem",
    background: "white",
    outline: "none",
  },
  modalActions: {
    display: "flex",
    gap: "1rem",
    marginTop: "1.5rem",
  },
  confirmBtn: {
    flex: 1,
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "0.8rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  cancelBtn: {
    flex: 1,
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "0.8rem",
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
  
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
document.head.appendChild(styleSheet);

export default StudentFees;