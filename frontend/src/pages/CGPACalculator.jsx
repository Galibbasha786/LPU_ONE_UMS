import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/CGPACalculator.css";

const gradeForMarks = (m) => {
  if (m >= 90) return { grade: "A+", gp: 10, color: "#10b981" };
  if (m >= 80) return { grade: "A", gp: 9, color: "#10b981" };
  if (m >= 70) return { grade: "B+", gp: 8, color: "#f59e0b" };
  if (m >= 60) return { grade: "B", gp: 7, color: "#f59e0b" };
  if (m >= 50) return { grade: "C", gp: 6, color: "#3b82f6" };
  if (m >= 40) return { grade: "D", gp: 5, color: "#ef4444" };
  return { grade: "F", gp: 0, color: "#ef4444" };
};

export default function CGPACalculator() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [subjects, setSubjects] = useState([
    { courseCode: "", name: "", marks: "", credits: "" },
  ]);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSavedReports, setShowSavedReports] = useState(false);
  const [savedReports, setSavedReports] = useState([]);

  // Fetch saved reports on load
  useEffect(() => {
    if (user?.email) {
      fetchSavedReports();
    }
  }, [user]);

  const fetchSavedReports = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/users/reportcards/${user?.email}`);
      if (res.data.success) {
        setSavedReports(res.data.reports || []);
      }
    } catch (err) {
      console.error("Error fetching saved reports:", err);
    }
  };

  const addRow = () => setSubjects([...subjects, { courseCode: "", name: "", marks: "", credits: "" }]);
  
  const removeRow = (i) => {
    if (subjects.length === 1) return;
    setSubjects(subjects.filter((_, idx) => idx !== i));
  };
  
  const updateRow = (i, key, value) => {
    const copy = [...subjects];
    copy[i][key] = value;
    setSubjects(copy);
  };

  const clearAll = () => {
    setSubjects([{ courseCode: "", name: "", marks: "", credits: "" }]);
    setResult(null);
  };

  const calculate = () => {
    let totalCredits = 0;
    let totalPoints = 0;
    let validSubjects = 0;
    
    const enriched = subjects.map((s) => {
      const marks = Number(s.marks) || 0;
      const credits = Number(s.credits) || 0;
      const { grade, gp, color } = gradeForMarks(marks);
      
      if (credits > 0) {
        totalCredits += credits;
        totalPoints += gp * credits;
        validSubjects++;
      }
      
      return { ...s, marks, credits, grade, gradePoint: gp, gradeColor: color };
    });

    const cgpa = totalCredits > 0 ? +(totalPoints / totalCredits).toFixed(2) : 0;
    const tgpa = cgpa;
    const totalMarks = enriched.reduce((sum, s) => sum + s.marks, 0);
    const averageMarks = validSubjects > 0 ? +(totalMarks / validSubjects).toFixed(2) : 0;
    
    setResult({ 
      subjects: enriched, 
      cgpa, 
      tgpa, 
      totalCredits,
      totalMarks,
      averageMarks,
      validSubjects
    });
  };

  const downloadReport = () => {
    if (!result) return;
    const title = `${user?.name || 'student'}-report-${new Date().toISOString().slice(0,19)}`;
    
    const rows = result.subjects.map(
      (s) => `<tr><td>${s.courseCode || '-'}</td><td>${s.name || '-'}</td><td>${s.marks}</td><td>${s.credits}</td><td>${s.grade}</td><td>${s.gradePoint}</td></tr>`
    ).join("");
    
    const html = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset='utf-8'>
      <title>Report Card - ${user?.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; }
        .report-card { max-width: 1000px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); overflow: hidden; }
        .header { background: linear-gradient(135deg, #ff6d00, #e65100); color: white; padding: 30px; text-align: center; }
        .header h1 { margin-bottom: 10px; }
        .student-info { padding: 20px 30px; background: #f8f9fa; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; border-bottom: 1px solid #e2e8f0; }
        .student-info p { margin: 0; }
        .table-container { padding: 30px; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f58003; color: white; padding: 12px; text-align: left; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
        .summary { background: #f8f9fa; padding: 20px 30px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
        .summary-item { padding: 15px; background: white; border-radius: 10px; }
        .summary-label { font-size: 0.8rem; color: #718096; margin-bottom: 5px; }
        .summary-value { font-size: 1.5rem; font-weight: bold; color: #2d3748; }
        .footer { padding: 20px; text-align: center; color: #718096; font-size: 0.8rem; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="report-card">
        <div class="header">
          <h1>📊 Academic Report Card</h1>
          <p>Lovely Professional University</p>
        </div>
        <div class="student-info">
          <p><strong>Name:</strong> ${user?.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${user?.email || 'N/A'}</p>
          <p><strong>Department:</strong> ${user?.department || 'N/A'}</p>
          <p><strong>Semester:</strong> ${user?.semester || 'Current'}</p>
        </div>
        <div class="table-container">
          <table>
            <thead><tr><th>Course Code</th><th>Subject</th><th>Marks</th><th>Credits</th><th>Grade</th><th>Grade Point</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="summary">
          <div class="summary-item"><div class="summary-label">Total Credits</div><div class="summary-value">${result.totalCredits}</div></div>
          <div class="summary-item"><div class="summary-label">TGPA</div><div class="summary-value">${result.tgpa}</div></div>
          <div class="summary-item"><div class="summary-label">CGPA</div><div class="summary-value">${result.cgpa}</div></div>
        </div>
        <div class="footer">Generated on ${new Date().toLocaleString()}</div>
      </div>
    </body>
    </html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveToServer = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await axios.post("http://localhost:5001/api/users/reportcard", {
        email: user?.email,
        studentName: user?.name,
        subjects: result.subjects.map(s => ({
          courseCode: s.courseCode,
          name: s.name,
          marks: s.marks,
          credits: s.credits,
          grade: s.grade,
          gradePoint: s.gradePoint
        })),
        cgpa: result.cgpa,
        tgpa: result.tgpa,
      });
      alert("✅ Report saved successfully!");
      fetchSavedReports();
    } catch (err) {
      console.error(err);
      alert("❌ Error saving report");
    } finally {
      setSaving(false);
    }
  };

  const loadReport = (report) => {
    if (report.subjects && report.subjects.length > 0) {
      const loadedSubjects = report.subjects.map(s => ({
        courseCode: s.courseCode || "",
        name: s.name || "",
        marks: s.marks || "",
        credits: s.credits || ""
      }));
      setSubjects(loadedSubjects);
      setResult({
        subjects: loadedSubjects.map(s => ({
          ...s,
          ...gradeForMarks(Number(s.marks) || 0)
        })),
        cgpa: report.cgpa,
        tgpa: report.tgpa,
        totalCredits: loadedSubjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0)
      });
      setShowSavedReports(false);
    }
  };

  const getPerformanceMessage = (cgpa) => {
    if (cgpa >= 9) return { text: "Excellent Performance! 🎉", color: "#10b981" };
    if (cgpa >= 8) return { text: "Very Good! 👍", color: "#10b981" };
    if (cgpa >= 7) return { text: "Good! Keep it up! 📚", color: "#f59e0b" };
    if (cgpa >= 6) return { text: "Satisfactory, can improve 💪", color: "#f59e0b" };
    if (cgpa >= 5) return { text: "Needs Improvement 📖", color: "#ef4444" };
    return { text: "Requires Attention ⚠️", color: "#ef4444" };
  };

  return (
    <div className="cgpa-calculator" style={styles.container}>
      <div className="cgpa-card" style={styles.card}>
        <div className="cgpa-header" style={styles.header}>
          <h2 style={styles.title}>📊 CGPA & TGPA Calculator</h2>
          <p style={styles.subtitle}>Calculate your GPA based on subject marks and credits</p>
        </div>

        <div className="cgpa-controls" style={styles.controls}>
          <button className="btn primary" onClick={addRow} style={styles.addBtn}>
            + Add Subject
          </button>
          <button className="btn" onClick={clearAll} style={styles.clearBtn}>
            🗑️ Clear All
          </button>
          <button className="btn" onClick={() => setShowSavedReports(!showSavedReports)} style={styles.savedBtn}>
            📚 Saved Reports
          </button>
          <div className="right-buttons" style={styles.rightButtons}>
            <button className="btn" onClick={calculate} style={styles.calcBtn}>
              Calculate
            </button>
            <button className="btn" onClick={downloadReport} disabled={!result} style={{...styles.downloadBtn, ...(!result && styles.disabled)}}>
              📥 Download
            </button>
            <button className="btn" onClick={saveToServer} disabled={!result || saving} style={{...styles.saveBtn, ...((!result || saving) && styles.disabled)}}>
              {saving ? '💾 Saving...' : '💾 Save'}
            </button>
          </div>
        </div>

        {/* Saved Reports Modal */}
        {showSavedReports && (
          <div style={styles.modalOverlay} onClick={() => setShowSavedReports(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3>📚 Saved Reports</h3>
                <button style={styles.modalClose} onClick={() => setShowSavedReports(false)}>✕</button>
              </div>
              <div style={styles.modalBody}>
                {savedReports.length === 0 ? (
                  <p style={styles.noData}>No saved reports found</p>
                ) : (
                  savedReports.map((report, index) => (
                    <div key={index} style={styles.reportItem} onClick={() => loadReport(report)}>
                      <div>
                        <strong>{new Date(report.createdAt).toLocaleDateString()}</strong>
                        <p>CGPA: {report.cgpa} | Credits: {report.subjects?.length || 0} subjects</p>
                      </div>
                      <button style={styles.loadBtn}>Load</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="cgpa-table-wrap" style={styles.tableWrap}>
          <table className="cgpa-table" style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Course Code</th>
                <th style={styles.th}>Subject Name</th>
                <th style={styles.th}>Marks (0-100)</th>
                <th style={styles.th}>Credits</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s, i) => (
                <tr key={i} style={styles.tableRow}>
                  <td style={styles.td}>
                    <input 
                      className="input" 
                      value={s.courseCode} 
                      onChange={(e) => updateRow(i, 'courseCode', e.target.value)} 
                      placeholder="CSE101" 
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.td}>
                    <input 
                      className="input" 
                      value={s.name} 
                      onChange={(e) => updateRow(i, 'name', e.target.value)} 
                      placeholder="Subject Name" 
                      style={styles.input}
                    />
                  </td>
                  <td style={styles.td}>
                    <input 
                      className="input" 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={s.marks} 
                      onChange={(e) => updateRow(i, 'marks', e.target.value)} 
                      style={styles.inputSmall}
                    />
                  </td>
                  <td style={styles.td}>
                    <input 
                      className="input" 
                      type="number" 
                      min="0" 
                      value={s.credits} 
                      onChange={(e) => updateRow(i, 'credits', e.target.value)} 
                      style={styles.inputSmall}
                    />
                  </td>
                  <td style={styles.td}>
                    <button 
                      className="btn danger" 
                      onClick={() => removeRow(i)} 
                      disabled={subjects.length === 1}
                      style={{...styles.removeBtn, ...(subjects.length === 1 && styles.disabled)}}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result && (
          <div className="cgpa-result" style={styles.resultContainer}>
            <div className="result-summary" style={styles.resultSummary}>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Total Credits</div>
                <div style={styles.summaryValue}>{result.totalCredits}</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Average Marks</div>
                <div style={styles.summaryValue}>{result.averageMarks}%</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>TGPA</div>
                <div style={styles.summaryValue}>{result.tgpa}</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>CGPA</div>
                <div style={styles.summaryValue}>{result.cgpa}</div>
              </div>
            </div>

            <div style={styles.performanceMessage}>
              <span style={{ color: getPerformanceMessage(result.cgpa).color }}>
                {getPerformanceMessage(result.cgpa).text}
              </span>
            </div>

            <div className="result-table-wrap" style={styles.resultTableWrap}>
              <table className="result-table" style={styles.resultTable}>
                <thead>
                  <tr style={styles.resultTableHeader}>
                    <th>Course Code</th>
                    <th>Subject</th>
                    <th>Marks</th>
                    <th>Credits</th>
                    <th>Grade</th>
                    <th>GP</th>
                  </tr>
                </thead>
                <tbody>
                  {result.subjects.map((s, i) => (
                    <tr key={i} style={styles.resultRow}>
                      <td style={styles.resultTd}>{s.courseCode || '-'}</td>
                      <td style={styles.resultTd}>{s.name || '-'}</td>
                      <td style={styles.resultTd}>{s.marks}</td>
                      <td style={styles.resultTd}>{s.credits}</td>
                      <td style={styles.resultTd}>
                        <span style={{...styles.gradeBadge, backgroundColor: s.gradeColor}}>
                          {s.grade}
                        </span>
                      </td>
                      <td style={styles.resultTd}>{s.gradePoint}</td>
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
    padding: "40px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    maxWidth: "1200px",
    width: "100%",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    overflow: "hidden",
    animation: "slideUp 0.5s ease",
  },
  header: {
    background: "linear-gradient(135deg, #ff6d00, #e65100)",
    padding: "30px",
    textAlign: "center",
    color: "white",
  },
  title: {
    margin: "0 0 10px 0",
    fontSize: "1.8rem",
    fontWeight: "700",
  },
  subtitle: {
    margin: 0,
    fontSize: "0.9rem",
    opacity: 0.9,
  },
  controls: {
    padding: "20px",
    background: "#f8f9fa",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  clearBtn: {
    background: "#6c757d",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  savedBtn: {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  rightButtons: {
    display: "flex",
    gap: "10px",
  },
  calcBtn: {
    background: "linear-gradient(135deg, #ff6d00, #e65100)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  downloadBtn: {
    background: "#6c757d",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  saveBtn: {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  tableWrap: {
    padding: "20px",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    background: "#f58003",
    color: "white",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    fontWeight: "600",
  },
  tableRow: {
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "10px",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    border: "2px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "0.9rem",
    transition: "all 0.3s ease",
  },
  inputSmall: {
    width: "80px",
    padding: "8px 12px",
    border: "2px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "0.9rem",
    textAlign: "center",
  },
  removeBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  resultContainer: {
    borderTop: "1px solid #e2e8f0",
    padding: "20px",
    background: "#f8f9fa",
  },
  resultSummary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  summaryItem: {
    textAlign: "center",
    padding: "15px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  summaryLabel: {
    fontSize: "0.8rem",
    color: "#718096",
    marginBottom: "5px",
  },
  summaryValue: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#2d3748",
  },
  performanceMessage: {
    textAlign: "center",
    padding: "15px",
    background: "white",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "1.1rem",
    fontWeight: "500",
  },
  resultTableWrap: {
    overflowX: "auto",
  },
  resultTable: {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    borderRadius: "10px",
    overflow: "hidden",
  },
  resultTableHeader: {
    background: "#2d3748",
    color: "white",
  },
  resultRow: {
    borderBottom: "1px solid #e2e8f0",
  },
  resultTd: {
    padding: "10px",
  },
  gradeBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    color: "white",
    fontWeight: "600",
    fontSize: "0.8rem",
    display: "inline-block",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "white",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "80vh",
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
    padding: "15px",
  },
  reportItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
    cursor: "pointer",
    "&:hover": {
      background: "#f8f9fa",
    },
  },
  loadBtn: {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "5px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  noData: {
    textAlign: "center",
    padding: "20px",
    color: "#718096",
  },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  button:hover {
    transform: translateY(-2px);
  }
  
  button:active {
    transform: scale(0.98);
  }
  
  input:focus {
    border-color: #f58003;
    outline: none;
    box-shadow: 0 0 0 3px rgba(245, 128, 3, 0.1);
  }
`;
document.head.appendChild(styleSheet);