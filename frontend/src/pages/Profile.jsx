import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    bio: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Get user from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!storedUser) {
      navigate("/");
      return;
    }
    fetchUserProfile();
  }, [storedUser]);

  const fetchUserProfile = async () => {
    try {
      let url = "";
      if (storedUser.role === "Admin") {
        url = `http://localhost:5001/api/users/admin/${storedUser.email}`;
      } else if (storedUser.role === "staff") {
        url = `http://localhost:5001/api/users/staff/${storedUser.email}`;
      } else {
        url = `http://localhost:5001/api/users/student/${storedUser.email}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setUser(data.user || storedUser);
        setEditForm({
          name: data.user?.name || storedUser.name,
          phoneNumber: data.user?.phoneNumber || "",
          address: data.user?.address || "",
          bio: data.user?.bio || ""
        });
      } else {
        setUser(storedUser);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setUser(storedUser);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      let url = "";
      let body = {};
      
      if (storedUser.role === "Admin") {
        url = `http://localhost:5001/api/users/update-admin/${storedUser.email}`;
        body = { name: editForm.name, phoneNumber: editForm.phoneNumber };
      } else if (storedUser.role === "staff") {
        url = `http://localhost:5001/api/users/update-staff/${storedUser.email}`;
        body = { name: editForm.name, phoneNumber: editForm.phoneNumber, address: editForm.address };
      } else {
        url = `http://localhost:5001/api/users/update-student/${storedUser.email}`;
        body = { name: editForm.name, phoneNumber: editForm.phoneNumber, address: editForm.address };
      }

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      if (data.success) {
        setUser({ ...user, ...body });
        const updatedStoredUser = { ...storedUser, name: editForm.name };
        localStorage.setItem("user", JSON.stringify(updatedStoredUser));
        setMessage("✅ Profile updated successfully!");
        setMessageType("success");
        setIsEditing(false);
      } else {
        setMessage("❌ Failed to update profile: " + data.message);
        setMessageType("error");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage("⚠️ Server error while updating profile");
      setMessageType("error");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const getRoleIcon = () => {
    switch(storedUser?.role) {
      case "Admin": return "👨‍💼";
      case "staff": return "👨‍🏫";
      case "Student": return "👨‍🎓";
      default: return "👤";
    }
  };

  const getRoleColor = () => {
    switch(storedUser?.role) {
      case "Admin": return "#f58003";
      case "staff": return "#3498db";
      case "Student": return "#10b981";
      default: return "#718096";
    }
  };

  const getStats = () => {
    if (storedUser?.role === "Student") {
      return [
        { number: user?.cgpa || "0.0", label: "CGPA" },
        { number: user?.attendance || "0%", label: "Attendance" },
        { number: user?.semester || "1", label: "Semester" }
      ];
    } else if (storedUser?.role === "staff") {
      return [
        { number: user?.coursesTeaching?.length || 0, label: "Courses" },
        { number: user?.experience || "0", label: "Years Exp" },
        { number: user?.isClassTeacher ? "Yes" : "No", label: "Class Teacher" }
      ];
    } else {
      return [
        { number: user?.department || "N/A", label: "Department" },
        { number: new Date().getFullYear() - (user?.joinDate?.getFullYear() || 2024), label: "Years" },
        { number: "Full", label: "Access" }
      ];
    }
  };

  const getAdditionalInfo = () => {
    if (storedUser?.role === "Student") {
      return (
        <>
          <div className="detail-row">
            <div className="detail-icon">🆔</div>
            <div className="detail-content">
              <h3>Enrollment ID</h3>
              <p>{user?.enrollmentId || "N/A"}</p>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-icon">🏛️</div>
            <div className="detail-content">
              <h3>Department</h3>
              <p>{user?.department || "Not Assigned"}</p>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-icon">📚</div>
            <div className="detail-content">
              <h3>Section</h3>
              <p>{user?.section || "Not Assigned"}</p>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-icon">📞</div>
            <div className="detail-content">
              <h3>Phone Number</h3>
              <p>{user?.phoneNumber || "Not provided"}</p>
            </div>
          </div>
        </>
      );
    } else if (storedUser?.role === "staff") {
      return (
        <>
          <div className="detail-row">
            <div className="detail-icon">🆔</div>
            <div className="detail-content">
              <h3>Employee ID</h3>
              <p>{user?.employeeId || "N/A"}</p>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-icon">🏛️</div>
            <div className="detail-content">
              <h3>Department</h3>
              <p>{user?.department || "Not Assigned"}</p>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-icon">🎓</div>
            <div className="detail-content">
              <h3>Qualification</h3>
              <p>{user?.qualification || "Not specified"}</p>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-icon">📞</div>
            <div className="detail-content">
              <h3>Phone Number</h3>
              <p>{user?.phoneNumber || "Not provided"}</p>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-icon">🏫</div>
            <div className="detail-content">
              <h3>Designation</h3>
              <p>{user?.designation || "Assistant Professor"}</p>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="detail-row">
            <div className="detail-icon">🆔</div>
            <div className="detail-content">
              <h3>Employee ID</h3>
              <p>{user?.employeeId || "ADMIN001"}</p>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-icon">🏛️</div>
            <div className="detail-content">
              <h3>Department</h3>
              <p>{user?.department || "Administration"}</p>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-icon">📞</div>
            <div className="detail-content">
              <h3>Phone Number</h3>
              <p>{user?.phoneNumber || "Not provided"}</p>
            </div>
          </div>
        </>
      );
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Background Image Overlay */}
      <div className="profile-background"></div>
      
      <div className="profile-card">
        {/* Profile Header with Avatar */}
        <div className="profile-header">
          <div className="profile-avatar" style={{ background: getRoleColor() }}>
            <span className="avatar-icon">{getRoleIcon()}</span>
          </div>
          {!isEditing ? (
            <h1 className="profile-name">{user?.name || storedUser?.name}</h1>
          ) : (
            <input
              type="text"
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              className="profile-name-input"
              placeholder="Enter your name"
            />
          )}
          <div className="profile-badge" style={{ background: getRoleColor() }}>
            {storedUser?.role}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`profile-message ${messageType}`}>
            {message}
          </div>
        )}

        {/* Profile Details */}
        <div className="profile-details">
          <div className="detail-row">
            <div className="detail-icon">📧</div>
            <div className="detail-content">
              <h3>Email</h3>
              <p>{storedUser?.email}</p>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-icon">👨‍💼</div>
            <div className="detail-content">
              <h3>Role</h3>
              <p>{storedUser?.role}</p>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-icon">📅</div>
            <div className="detail-content">
              <h3>Member Since</h3>
              <p>{user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : "January 2024"}</p>
            </div>
          </div>

          {getAdditionalInfo()}

          {!isEditing && user?.address && (
            <div className="detail-row full-width">
              <div className="detail-icon">📍</div>
              <div className="detail-content">
                <h3>Address</h3>
                <p className="bio-text">{user?.address}</p>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="detail-row full-width">
              <div className="detail-icon">📍</div>
              <div className="detail-content">
                <h3>Address</h3>
                <textarea
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  className="profile-textarea"
                  rows="3"
                  placeholder="Enter your address"
                />
              </div>
            </div>
          )}

          {!isEditing && user?.bio && (
            <div className="detail-row full-width">
              <div className="detail-icon">📝</div>
              <div className="detail-content">
                <h3>Bio</h3>
                <p className="bio-text">{user?.bio}</p>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="detail-row full-width">
              <div className="detail-icon">📝</div>
              <div className="detail-content">
                <h3>Bio</h3>
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleEditChange}
                  className="profile-textarea"
                  rows="3"
                  placeholder="Write something about yourself"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="profile-stats">
          {getStats().map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          {!isEditing ? (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              ✏️ Edit Profile
            </button>
          ) : (
            <>
              <button className="btn btn-primary" onClick={handleUpdateProfile} disabled={loading}>
                {loading ? "Saving..." : "💾 Save Changes"}
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                ❌ Cancel
              </button>
            </>
          )}
          <button className="btn btn-secondary" onClick={handleChangePassword}>
            🔒 Change Password
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;