import React from "react";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>👤 My Profile</h2>
      <p><b>Name:</b> {user?.name}</p>
      <p><b>Email:</b> {user?.email}</p>
      <p><b>Role:</b> {user?.role}</p>
    </div>
  );
}

export default Profile;
