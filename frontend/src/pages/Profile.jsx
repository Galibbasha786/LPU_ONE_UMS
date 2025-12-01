import React from "react";
import "../styles/Profile.css"; // Create this CSS file

function Profile() {
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "John Doe",
    email: "john@example.com",
    role: "User",
    joinDate: "2024-01-15",
    location: "New York, USA",
    bio: "Passionate about technology and design."
  };

  return (
    <div className="profile-container">
      {/* Background Image Overlay */}
      <div className="profile-background"></div>
      
      <div className="profile-card">
        {/* Profile Header with Avatar */}
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <h1 className="profile-name">{user?.name}</h1>
          <div className="profile-badge">{user?.role}</div>
        </div>

        {/* Profile Details */}
        <div className="profile-details">
          <div className="detail-row">
            <div className="detail-icon">📧</div>
            <div className="detail-content">
              <h3>Email</h3>
              <p>{user?.email}</p>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-icon">👨‍💼</div>
            <div className="detail-content">
              <h3>Role</h3>
              <p>{user?.role}</p>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-icon">📅</div>
            <div className="detail-content">
              <h3>Member Since</h3>
              <p>{user?.joinDate || "January 2024"}</p>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-icon">📍</div>
            <div className="detail-content">
              <h3>Location</h3>
              <p>{user?.location || "Not specified"}</p>
            </div>
          </div>

          <div className="detail-row full-width">
            <div className="detail-icon">📝</div>
            <div className="detail-content">
              <h3>Bio</h3>
              <p className="bio-text">{user?.bio || "No bio available."}</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-number">24</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">156</span>
            <span className="stat-label">Tasks</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">89%</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button className="btn btn-primary">Edit Profile</button>
          <button className="btn btn-secondary">Settings</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;