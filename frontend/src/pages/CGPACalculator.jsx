import React, { useState } from "react";
import axios from "axios";
import "../styles/CGPACalculator.css";

const gradeForMarks = (m) => {
  if (m >= 90) return { grade: "A+", gp: 10 };
  if (m >= 80) return { grade: "A", gp: 9 };
  if (m >= 70) return { grade: "B+", gp: 8 };
  if (m >= 60) return { grade: "B", gp: 7 };
  if (m >= 50) return { grade: "C", gp: 6 };
  if (m >= 40) return { grade: "D", gp: 5 };
  return { grade: "F", gp: 0 };
};

export default function CGPACalculator() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [subjects, setSubjects] = useState([
    { courseCode: "", name: "", marks: "", credits: "" },
  ]);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const addRow = () => setSubjects([...subjects, { courseCode: "", name: "", marks: "", credits: "" }]);
  const removeRow = (i) => setSubjects(subjects.filter((_, idx) => idx !== i));
  const updateRow = (i, key, value) => {
    const copy = [...subjects];
    copy[i][key] = value;
    setSubjects(copy);
  };

  const calculate = () => {
    let totalCredits = 0;
    let totalPoints = 0;
    const enriched = subjects.map((s) => {
      const marks = Number(s.marks) || 0;
      const credits = Number(s.credits) || 0;
      const { grade, gp } = gradeForMarks(marks);
      totalCredits += credits;
      totalPoints += gp * credits;
      return { ...s, marks, credits, grade, gradePoint: gp };
    });

    const cgpa = totalCredits ? +(totalPoints / totalCredits).toFixed(2) : 0;
    // For simplicity TGPA = CGPA here
    const tgpa = cgpa;
    setResult({ subjects: enriched, cgpa, tgpa, totalCredits });
  };

  const downloadReport = () => {
    if (!result) return;
    const title = `${user?.name || 'student'}-report-${new Date().toISOString()}`;
    const rows = result.subjects.map(
      (s) => `<tr><td>${s.courseCode}</td><td>${s.name}</td><td>${s.marks}</td><td>${s.credits}</td><td>${s.grade}</td><td>${s.gradePoint}</td></tr>`
    ).join("");
    const html = `<!doctype html><html><head><meta charset='utf-8'><title>Report Card</title><style>table{width:100%;border-collapse:collapse}td,th{border:1px solid #333;padding:8px;text-align:left}</style></head><body><h2>Report Card</h2><p>Name: ${user?.name || ''}</p><p>Email: ${user?.email || ''}</p><table><thead><tr><th>Course Code</th><th>Subject</th><th>Marks</th><th>Credits</th><th>Grade</th><th>GP</th></tr></thead><tbody>${rows}</tbody></table><p>Total Credits: ${result.totalCredits}</p><p>TGPA: ${result.tgpa}</p><p>CGPA: ${result.cgpa}</p></body></html>`;

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
        subjects: result.subjects,
        cgpa: result.cgpa,
        tgpa: result.tgpa,
      });
      alert("Report saved to server");
    } catch (err) {
      console.error(err);
      alert("Error saving report");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cgpa-calculator">
      <div className="cgpa-card">
        <div className="cgpa-header">
          <h2>CGPA & TGPA Calculator</h2>
          <p className="subtle">Add subjects, enter marks & credits, then calculate.</p>
        </div>

        <div className="cgpa-controls">
          <button className="btn primary" onClick={addRow}>+ Add Subject</button>
          <div className="right-buttons">
            <button className="btn" onClick={calculate}>Calculate</button>
            <button className="btn" onClick={downloadReport} disabled={!result}>Download</button>
            <button className="btn" onClick={saveToServer} disabled={!result || saving}>{saving? 'Saving...':'Save'}</button>
          </div>
        </div>

        <div className="cgpa-table-wrap">
          <table className="cgpa-table">
            <thead>
              <tr>
                <th className="col-code">Course Code</th>
                <th>Subject Name</th>
                <th className="col-marks">Marks</th>
                <th className="col-credits">Credits</th>
                <th className="col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s, i) => (
                <tr key={i}>
                  <td><input className="input" value={s.courseCode} onChange={(e)=>updateRow(i,'courseCode',e.target.value)} placeholder="CSE101" /></td>
                  <td><input className="input" value={s.name} onChange={(e)=>updateRow(i,'name',e.target.value)} placeholder="Subject Name" /></td>
                  <td><input className="input" type="number" min="0" max="100" value={s.marks} onChange={(e)=>updateRow(i,'marks',e.target.value)} /></td>
                  <td><input className="input" type="number" min="0" value={s.credits} onChange={(e)=>updateRow(i,'credits',e.target.value)} /></td>
                  <td>
                    <button className="btn danger" onClick={()=>removeRow(i)} disabled={subjects.length===1}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result && (
          <div className="cgpa-result">
            <div className="result-summary">
              <div><strong>Total Credits</strong><div>{result.totalCredits}</div></div>
              <div><strong>TGPA</strong><div>{result.tgpa}</div></div>
              <div><strong>CGPA</strong><div>{result.cgpa}</div></div>
            </div>

            <div className="result-table-wrap">
              <table className="result-table">
                <thead>
                  <tr><th>Course</th><th>Subject</th><th>Marks</th><th>Credits</th><th>Grade</th><th>GP</th></tr>
                </thead>
                <tbody>
                  {result.subjects.map((s, i) => (
                    <tr key={i}><td>{s.courseCode}</td><td>{s.name}</td><td>{s.marks}</td><td>{s.credits}</td><td>{s.grade}</td><td>{s.gradePoint}</td></tr>
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
