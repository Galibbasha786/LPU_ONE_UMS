import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

function StudentBulkUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "Admin") {
    return (
      <div style={styles.accessDenied}>
        <h2>⛔ Access Denied</h2>
        <p>Only Administrators can upload student data.</p>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          ← Go Back
        </button>
      </div>
    );
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setPreview(jsonData.slice(0, 10));
      setFile(file);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Please select a file first");
      setMessageType("error");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const students = XLSX.utils.sheet_to_json(sheet);

        let success = 0;
        let failed = 0;

        for (const student of students) {
          try {
            const res = await fetch("http://localhost:5001/api/users/create-student", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: student.name || student.Name,
                email: student.email || student.Email,
                password: student.password || student.email || student.Email,
                section: student.section || student.Section,
                enrollmentId: student.enrollmentId || `REG${Date.now()}`,
                department: student.department || student.Department,
                semester: student.semester || student.Semester || "1"
              }),
            });
            const data = await res.json();
            if (data.success) success++;
            else failed++;
          } catch (err) {
            failed++;
          }
        }

        setMessage(`✅ Upload complete! ${success} students added, ${failed} failed.`);
        setMessageType("success");
        setFile(null);
        setPreview([]);
        setTimeout(() => setMessage(""), 5000);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setMessage("❌ Error processing file");
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { name: "John Doe", email: "john@lpu.edu", section: "A", department: "CSE", semester: "1" },
      { name: "Jane Smith", email: "jane@lpu.edu", section: "B", department: "CSE", semester: "1" }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_template.xlsx");
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <button onClick={() => navigate("/admin-dashboard")} style={styles.backBtn}>
              ← Back to Dashboard
            </button>
            <h1 style={styles.title}>📤 Bulk Student Upload</h1>
            <p style={styles.subtitle}>Upload multiple students using Excel/CSV file</p>
          </div>
        </div>
      </header>

      <div style={styles.content}>
        {message && (
          <div style={{...styles.message, ...(messageType === "success" ? styles.messageSuccess : styles.messageError)}}>
            {message}
          </div>
        )}

        <div style={styles.uploadCard}>
          <div style={styles.uploadArea}>
            <div style={styles.uploadIcon}>📊</div>
            <h3>Upload Excel/CSV File</h3>
            <p>Supported formats: .xlsx, .xls, .csv</p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              style={styles.fileInput}
              id="file-upload"
            />
            <label htmlFor="file-upload" style={styles.fileLabel}>
              Choose File
            </label>
            {file && <p style={styles.fileName}>Selected: {file.name}</p>}
          </div>

          <div style={styles.actions}>
            <button onClick={downloadTemplate} style={styles.downloadBtn}>
              📥 Download Template
            </button>
            <button onClick={handleUpload} style={styles.uploadBtn} disabled={!file || uploading}>
              {uploading ? "Uploading..." : "🚀 Upload Students"}
            </button>
          </div>
        </div>

        {preview.length > 0 && (
          <div style={styles.previewCard}>
            <h3>Preview (First 10 records)</h3>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {Object.keys(preview[0]).map((key, idx) => (
                      <th key={idx} style={styles.th}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, i) => (
                        <td key={i} style={styles.td}>{val}</td>
                      ))}
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
  },
  messageError: {
    background: "#f8d7da",
    color: "#721c24",
  },
  uploadCard: {
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "center",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  uploadArea: {
    marginBottom: "30px",
  },
  uploadIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
  },
  fileInput: {
    display: "none",
  },
  fileLabel: {
    display: "inline-block",
    background: "#f58003",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "20px",
    fontWeight: "600",
  },
  fileName: {
    marginTop: "15px",
    color: "#10b981",
  },
  actions: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
  },
  downloadBtn: {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  uploadBtn: {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  previewCard: {
    background: "white",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    background: "#f8f9fa",
    borderBottom: "2px solid #e2e8f0",
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #e2e8f0",
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

export default StudentBulkUpload;