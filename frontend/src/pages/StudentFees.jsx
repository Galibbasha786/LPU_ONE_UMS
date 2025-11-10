import React, { useEffect, useState } from "react";

function StudentFees() {
  const [fee, setFee] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || user.role !== "Student") {
    return <p style={{textAlign: "center", marginTop: "50px", color: "red"}}>Access Denied</p>;
  }

  useEffect(() => {
    // Using email as studentId since that's how your backend stores it
    fetch(`http://localhost:5001/api/users/fees/${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFee(data.fee);
        }
      })
      .catch(() => console.error("Error loading fee info"));
  }, [user.email]);

  if (!fee) {
    return (
      <div style={styles.container}>
        <h2>💸 Your Fee Details</h2>
        <p>No fee record found yet.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>💸 Your Fee Details</h2>
      <div style={styles.card}>
        <p><strong>Student ID:</strong> {fee.studentId}</p>
        <p><strong>Student Name:</strong> {fee.studentName}</p>
        <p><strong>Total Amount:</strong> ₹{fee.totalAmount}</p>
        <p><strong>Amount Paid:</strong> ₹{fee.amountPaid}</p>
        <p><strong>Status:</strong> 
          <span style={{
            color: fee.status === 'Paid' ? 'green' : fee.status === 'Partial' ? 'orange' : 'red',
            fontWeight: 'bold',
            marginLeft: '10px'
          }}>
            {fee.status}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
    padding: "20px",
  },
  card: {
    background: "#f8f9fa",
    padding: "30px",
    borderRadius: "10px",
    margin: "20px auto",
    maxWidth: "500px",
    textAlign: "left",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
};

export default StudentFees;