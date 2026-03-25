import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PaymentHistory() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "Student") {
    return (
      <div style={styles.accessDenied}>
        <h2>⛔ Access Denied</h2>
        <p>Only students can view payment history.</p>
        <button onClick={() => navigate("/")} style={styles.backBtn}>← Go Back</button>
      </div>
    );
  }

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/payments/student/${user.id || user.email}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments || []);
      } else {
        // Fallback to mock data if API not ready
        setPayments([
          { id: 1, date: "2024-01-15", amount: 25000, mode: "Online", receipt: "RCPT001", status: "Success" },
          { id: 2, date: "2023-07-20", amount: 25000, mode: "Bank Transfer", receipt: "RCPT002", status: "Success" },
        ]);
      }
    } catch (err) {
      console.error("Error fetching payment history:", err);
      // Mock data for fallback
      setPayments([
        { id: 1, date: "2024-01-15", amount: 25000, mode: "Online", receipt: "RCPT001", status: "Success" },
        { id: 2, date: "2023-07-20", amount: 25000, mode: "Bank Transfer", receipt: "RCPT002", status: "Success" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = (receipt) => {
    alert(`Downloading receipt: ${receipt}`);
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate("/student-dashboard")} style={styles.backBtn}>← Back to Dashboard</button>
            <h1 style={styles.title}>📜 Payment History</h1>
            <p style={styles.subtitle}>View all your past fee payments and receipts</p>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        {loading ? (
          <div style={styles.loading}><div style={styles.spinner}></div><p>Loading payment history...</p></div>
        ) : payments.length === 0 ? (
          <div style={styles.noData}><div style={styles.noDataIcon}>💰</div><p>No payment history found</p><p style={styles.noDataSub}>Payments will appear here once you make a payment</p></div>
        ) : (
          <div style={styles.tableCard}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryItem}><div>💰</div><div><div style={styles.summaryNumber}>₹{totalPaid.toLocaleString()}</div><div>Total Paid</div></div></div>
              <div style={styles.summaryItem}><div>📊</div><div><div style={styles.summaryNumber}>{payments.length}</div><div>Transactions</div></div></div>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead><tr style={styles.tableHeader}><th>Date</th><th>Receipt No.</th><th>Amount</th><th>Payment Mode</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id || payment._id} style={styles.tableRow}>
                      <td>{new Date(payment.date).toLocaleDateString()}</td>
                      <td><span style={styles.receiptBadge}>{payment.receipt}</span></td>
                      <td style={styles.amount}>₹{payment.amount.toLocaleString()}</td>
                      <td>{payment.mode}</td>
                      <td><span style={styles.successBadge}>{payment.status}</span></td>
                      <td><button onClick={() => downloadReceipt(payment.receipt)} style={styles.downloadBtn}>📄 Receipt</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
  tableCard: { background: "white", borderRadius: "12px", padding: "20px" },
  summaryCard: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" },
  summaryItem: { background: "#f8f9fa", padding: "15px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "15px" },
  summaryNumber: { fontSize: "1.2rem", fontWeight: "bold", color: "#2d3748" },
  tableContainer: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeader: { background: "#f8f9fa", borderBottom: "2px solid #e2e8f0" },
  tableRow: { borderBottom: "1px solid #e2e8f0" },
  receiptBadge: { background: "#e3f2fd", color: "#1976d2", padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem", fontFamily: "monospace" },
  amount: { fontWeight: "600" },
  successBadge: { background: "#d4edda", color: "#155724", padding: "4px 8px", borderRadius: "20px", fontSize: "0.8rem" },
  downloadBtn: { background: "#3498db", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" },
  accessDenied: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", textAlign: "center" }
};

export default PaymentHistory;