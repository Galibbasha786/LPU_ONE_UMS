import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function FinancialReports() {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState("fees");
  const [dateRange, setDateRange] = useState("month");
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "Admin") {
    return (
      <div style={styles.accessDenied}>
        <h2>⛔ Access Denied</h2>
        <p>Only Administrators can view financial reports.</p>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          ← Go Back
        </button>
      </div>
    );
  }

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/users/fees");
      const data = await res.json();
      const fees = data.fees || [];
      
      const totalCollected = fees.reduce((sum, f) => sum + (f.amountPaid || 0), 0);
      const totalPending = fees.reduce((sum, f) => sum + ((f.totalAmount || 0) - (f.amountPaid || 0)), 0);
      const paidStudents = fees.filter(f => f.status === "Paid").length;
      const pendingStudents = fees.filter(f => f.status === "Pending").length;
      const partialStudents = fees.filter(f => f.status === "Partial").length;
      
      const reportData = {
        totalCollected,
        totalPending,
        paidStudents,
        pendingStudents,
        partialStudents,
        totalStudents: fees.length,
        collectionRate: fees.length > 0 ? (paidStudents / fees.length) * 100 : 0
      };
      
      setReportData(reportData);
    } catch (err) {
      console.error("Error generating report:", err);
    } finally {
      setLoading(false);
    }
  };

  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    generateReport();
  }, [dateRange, reportType]);

  const exportToPDF = () => {
    alert("Exporting to PDF... (Coming soon)");
  };

  const exportToExcel = () => {
    alert("Exporting to Excel... (Coming soon)");
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate("/admin-dashboard")} style={styles.backBtn}>
              ← Back to Dashboard
            </button>
            <h1 style={styles.title}>📊 Financial Reports</h1>
            <p style={styles.subtitle}>View and export financial data reports</p>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        {/* Filters */}
        <div style={styles.filtersCard}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Report Type:</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={styles.select}>
              <option value="fees">Fee Collection Report</option>
              <option value="pending">Pending Fees Report</option>
              <option value="defaulters">Fee Defaulters Report</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Date Range:</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={styles.select}>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <button onClick={generateReport} style={styles.generateBtn}>Generate Report</button>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Generating report...</p>
          </div>
        ) : reportData && (
          <>
            {/* Summary Cards */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>💰</div>
                <div style={styles.statInfo}>
                  <div style={styles.statNumber}>₹{reportData.totalCollected.toLocaleString()}</div>
                  <div style={styles.statLabel}>Total Collected</div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>⏳</div>
                <div style={styles.statInfo}>
                  <div style={styles.statNumber}>₹{reportData.totalPending.toLocaleString()}</div>
                  <div style={styles.statLabel}>Total Pending</div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>✅</div>
                <div style={styles.statInfo}>
                  <div style={styles.statNumber}>{reportData.paidStudents}</div>
                  <div style={styles.statLabel}>Paid Students</div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>📊</div>
                <div style={styles.statInfo}>
                  <div style={styles.statNumber}>{reportData.collectionRate.toFixed(1)}%</div>
                  <div style={styles.statLabel}>Collection Rate</div>
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div style={styles.tableCard}>
              <div style={styles.tableHeader}>
                <h3>Fee Collection Details</h3>
                <div style={styles.exportBtns}>
                  <button onClick={exportToPDF} style={styles.exportBtn}>📄 Export PDF</button>
                  <button onClick={exportToExcel} style={styles.exportBtn}>📊 Export Excel</button>
                </div>
              </div>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Paid Students</td>
                      <td>{reportData.paidStudents}</td>
                      <td>{((reportData.paidStudents / reportData.totalStudents) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td>Pending Students</td>
                      <td>{reportData.pendingStudents}</td>
                      <td>{((reportData.pendingStudents / reportData.totalStudents) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td>Partial Payment</td>
                      <td>{reportData.partialStudents}</td>
                      <td>{((reportData.partialStudents / reportData.totalStudents) * 100).toFixed(1)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
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
  filtersCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "30px",
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  filterGroup: {
    flex: 1,
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#2d3748",
  },
  select: {
    width: "100%",
    padding: "10px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
  },
  generateBtn: {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
  tableCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  exportBtns: {
    display: "flex",
    gap: "10px",
  },
  exportBtn: {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
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
};

export default FinancialReports;