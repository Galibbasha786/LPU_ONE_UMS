import React, { useState } from "react";

function AdminCreateStudent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    section: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5001/api/users/create-student",  {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Student created successfully!");
        setFormData({ name: "", email: "", password: "", section: "" });
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (err) {
      setMessage("⚠️ Server error, please try again.");
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create New Student 👨‍🎓</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <input name="section" placeholder="Section (e.g., A1, B2)" value={formData.section} onChange={handleChange} required />
        <button type="submit">Create Student</button>
      </form>
      {message && <p style={styles.msg}>{message}</p>}
    </div>
  );
}

const styles = {
  container: { textAlign: "center", marginTop: "50px" },
  form: { display: "flex", flexDirection: "column", width: "300px", margin: "auto", gap: "10px" },
  msg: { marginTop: "15px", fontWeight: "bold" },
};

export default AdminCreateStudent;
