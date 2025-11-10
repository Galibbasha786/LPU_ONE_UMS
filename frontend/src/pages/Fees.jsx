import React, { useEffect, useState } from "react";

function Fees() {
  const [fees, setFees] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5001/api/users/fees")
      .then((res) => res.json())
      .then((data) => setFees(data.fees || []))
      .catch(() => console.error("Error loading fees"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5001/api/users/fees/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        studentName,
        totalAmount,
        amountPaid,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setMessage("✅ " + data.message);
      setStudentId("");
      setStudentName("");
      setTotalAmount("");
      setAmountPaid("");
      setFees([
        ...fees.filter((f) => f.studentId !== studentId),
        {
          studentId,
          studentName,
          totalAmount,
          amountPaid,
          status:
            amountPaid >= totalAmount
              ? "Paid"
              : amountPaid > 0
              ? "Partial"
              : "Pending",
        },
      ]);
    } else {
      setMessage("❌ " + data.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>💰 Fee Management Portal</h2>
      {message && <p style={styles.message}>{message}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Student Name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Total Amount"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Amount Paid"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          style={styles.input}
        />
        <button style={styles.button}>Add / Update Fee</button>
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {fees.map((fee, i) => (
            <tr key={i}>
              <td>{fee.studentId}</td>
              <td>{fee.studentName}</td>
              <td>₹{fee.totalAmount}</td>
              <td>₹{fee.amountPaid}</td>
              <td>{fee.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { textAlign: "center", padding: "40px", background: "#fff" },
  form: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: {
    padding: "10px 20px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
  table: {
    margin: "auto",
    borderCollapse: "collapse",
    width: "80%",
  },
  message: { color: "#007bff", fontWeight: "bold" },
};

export default Fees;
