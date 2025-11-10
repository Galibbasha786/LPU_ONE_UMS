import React, { useEffect, useState } from "react";

function AllotSection() {
  const [students, setStudents] = useState([]);
  const [section, setSection] = useState({});
  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || user.role !== "Admin") {
    return <p style={{textAlign: "center", marginTop: "50px", color: "red"}}>Access Denied: Admins Only</p>;
  }

  useEffect(() => {
    fetch("http://localhost:5001/api/users/students")
      .then((res) => res.json())
      .then((data) => setStudents(data.students || []))
      .catch((err) => console.error("Error fetching students:", err));
  }, []);

  const handleAllot = async (email) => {
    const value = section[email];
    if (!value) return alert("Enter section before saving!");

    try {
      const res = await fetch("http://localhost:5001/api/users/update-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, field: "section", value }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Section updated for ${email}`);
        setStudents((prev) =>
          prev.map((s) =>
            s.email === email ? { ...s, section: value } : s
          )
        );
        setSection({ ...section, [email]: "" }); // Clear input
      } else {
        setMessage(`❌ Failed to update section for ${email}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error while updating section.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>🏫 Allot Section to Students</h2>
      {message && <p style={styles.msg}>{message}</p>}
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Current Section</th>
            <th>Enter Section</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={i}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.section || "Not Assigned"}</td>
              <td>
                <input
                  type="text"
                  placeholder="e.g. CS-A, IT-B"
                  value={section[s.email] || ""}
                  onChange={(e) =>
                    setSection({ ...section, [s.email]: e.target.value })
                  }
                  style={styles.input}
                />
              </td>
              <td>
                <button onClick={() => handleAllot(s.email)} style={styles.saveBtn}>
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
  msg: { color: "#007bff", fontWeight: "bold" },
  table: {
    margin: "auto",
    marginTop: "20px",
    borderCollapse: "collapse",
    width: "80%",
  },
  input: {
    padding: "5px",
    borderRadius: "3px",
    border: "1px solid #ccc",
    width: "120px",
  },
  saveBtn: {
    background: "#007bff",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default AllotSection;