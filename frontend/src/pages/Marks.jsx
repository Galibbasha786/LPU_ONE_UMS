import React, { useEffect, useState } from "react";

function Marks() {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || user.role !== "Admin") {
    return <p style={{textAlign: "center", marginTop: "50px", color: "red"}}>Access Denied: Admins Only</p>;
  }

  // ✅ Fetch students from backend
  useEffect(() => {
    fetch("http://localhost:5001/api/users/students")
      .then((res) => res.json())
      .then((data) => setStudents(data.students || []))
      .catch((err) => console.error("Error fetching students:", err));
  }, []);

  // ✅ Update marks for student
  const handleUpdateMarks = async (email) => {
    const value = marks[email];
    if (!value) return alert("Please enter marks before submitting!");

    try {
      const res = await fetch("http://localhost:5001/api/users/update-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, field: "marks", value }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage(`✅ Marks updated for ${email}`);
        setStudents((prev) =>
          prev.map((s) =>
            s.email === email ? { ...s, marks: value } : s
          )
        );
        setMarks({ ...marks, [email]: "" }); // Clear input
      } else {
        setMessage(`❌ Failed to update marks for ${email}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error while updating marks.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>🧾 Enter / Update Student Marks</h2>
      {message && <p style={styles.msg}>{message}</p>}
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Section</th>
            <th>Current Marks</th>
            <th>Enter New Marks</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={i}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.section || "Not Assigned"}</td>
              <td>{s.marks || "Not Assigned"}</td>
              <td>
                <input
                  type="text"
                  placeholder="Enter marks"
                  value={marks[s.email] || ""}
                  onChange={(e) =>
                    setMarks({ ...marks, [s.email]: e.target.value })
                  }
                  style={styles.input}
                />
              </td>
              <td>
                <button
                  onClick={() => handleUpdateMarks(s.email)}
                  style={styles.saveBtn}
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "40px",
    background: "#fefefe",
    padding: "20px",
    minHeight: "100vh",
  },
  table: {
    margin: "auto",
    marginTop: "20px",
    borderCollapse: "collapse",
    width: "90%",
  },
  input: {
    padding: "5px",
    borderRadius: "3px",
    border: "1px solid #ccc",
    width: "120px",
  },
  msg: { color: "#007bff", fontWeight: "bold" },
  saveBtn: {
    background: "#007bff",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Marks;