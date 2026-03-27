// src/pages/CampusClubs.jsx

import React, { useState, useEffect } from "react";
import { 
  FiUsers, 
  FiCalendar, 
  FiMapPin, 
  FiBell, 
  FiX,
  FiLoader,
  FiHeart,
  FiShare2
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CampusClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);
  const [showClubModal, setShowClubModal] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/campus-clubs");
      const data = await response.json();
      setClubs(data.clubs || []);
    } catch (error) {
      console.error("Error fetching clubs:", error);
      toast.error("Failed to load campus clubs");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async (clubId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/campus-clubs/${clubId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Successfully joined the club!");
        fetchClubs();
      } else {
        toast.error(data.message || "Failed to join club");
      }
    } catch (error) {
      console.error("Error joining club:", error);
      toast.error("Failed to join club");
    }
  };

  const handleLeaveClub = async (clubId) => {
    if (!confirm("Are you sure you want to leave this club?")) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/campus-clubs/${clubId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Left the club");
        fetchClubs();
      } else {
        toast.error(data.message || "Failed to leave club");
      }
    } catch (error) {
      console.error("Error leaving club:", error);
      toast.error("Failed to leave club");
    }
  };

  const handleRegisterForEvent = async (clubId, eventId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/campus-clubs/${clubId}/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Successfully registered for the event!");
        fetchClubs();
      } else {
        toast.error(data.message || "Failed to register");
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      toast.error("Failed to register");
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading campus clubs...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>Campus Clubs</h1>
          <p style={styles.headerSubtitle}>Connect with clubs, participate in events, and stay updated</p>
        </div>
      </div>

      <div style={styles.content}>
        {/* Clubs Grid */}
        <div style={styles.clubsGrid}>
          {clubs.map((club) => (
            <div
              key={club._id}
              style={styles.clubCard}
              onClick={() => {
                setSelectedClub(club);
                setShowClubModal(true);
              }}
            >
              {/* Cover Image */}
              <div style={styles.clubCardHeader}>
                {club.coverImage ? (
                  <img src={club.coverImage} alt={club.name} style={styles.clubCover} />
                ) : (
                  <div style={styles.clubCoverPlaceholder}></div>
                )}
                {club.isMember && (
                  <div style={styles.memberBadge}>Member</div>
                )}
              </div>
              
              {/* Logo & Info */}
              <div style={styles.clubCardBody}>
                <div style={styles.clubLogoContainer}>
                  <img
                    src={club.logo || "https://via.placeholder.com/60"}
                    alt={club.name}
                    style={styles.clubLogo}
                  />
                </div>
                <div style={styles.clubInfo}>
                  <h3 style={styles.clubName}>{club.name}</h3>
                  {club.shortName && (
                    <p style={styles.clubShortName}>{club.shortName}</p>
                  )}
                  <span style={styles.clubCategory}>{club.category}</span>
                </div>
                
                <p style={styles.clubDescription}>{club.description.substring(0, 100)}...</p>
                
                <div style={styles.clubMeta}>
                  <div style={styles.clubMetaItem}>
                    <FiUsers style={styles.metaIcon} />
                    <span>{club.members?.length || 0} members</span>
                  </div>
                  {club.meetingSchedule?.day && (
                    <div style={styles.clubMetaItem}>
                      <FiCalendar style={styles.metaIcon} />
                      <span>{club.meetingSchedule.day}s at {club.meetingSchedule.time}</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (club.isMember) {
                      handleLeaveClub(club._id);
                    } else {
                      handleJoinClub(club._id);
                    }
                  }}
                  style={club.isMember ? styles.leaveButton : styles.joinButton}
                >
                  {club.isMember ? "Leave Club" : "Join Club"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {clubs.length === 0 && (
          <div style={styles.emptyState}>
            <FiUsers style={styles.emptyIcon} />
            <h3 style={styles.emptyTitle}>No Clubs Yet</h3>
            <p style={styles.emptyText}>Check back later for campus clubs</p>
          </div>
        )}
      </div>

      {/* Club Details Modal */}
      {showClubModal && selectedClub && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            {/* Club Header */}
            <div style={styles.modalHeader}>
              <img
                src={selectedClub.coverImage || "https://via.placeholder.com/1200x300"}
                alt={selectedClub.name}
                style={styles.modalCover}
              />
              <div style={styles.modalHeaderOverlay}></div>
              <div style={styles.modalHeaderInfo}>
                <div style={styles.modalLogoContainer}>
                  <img
                    src={selectedClub.logo || "https://via.placeholder.com/80"}
                    alt={selectedClub.name}
                    style={styles.modalLogo}
                  />
                </div>
                <div style={styles.modalTitleContainer}>
                  <h2 style={styles.modalTitle}>{selectedClub.name}</h2>
                  {selectedClub.motto && (
                    <p style={styles.modalMotto}>"{selectedClub.motto}"</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowClubModal(false)}
                style={styles.closeButton}
              >
                <FiX style={styles.closeIcon} />
              </button>
            </div>

            {/* Club Content */}
            <div style={styles.modalBody}>
              {/* Description */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>About</h3>
                <p style={styles.sectionText}>{selectedClub.description}</p>
              </div>

              {/* Vision & Mission */}
              {(selectedClub.vision || selectedClub.mission) && (
                <div style={styles.twoColumnSection}>
                  {selectedClub.vision && (
                    <div style={styles.visionBox}>
                      <h4 style={styles.visionTitle}>Vision</h4>
                      <p style={styles.visionText}>{selectedClub.vision}</p>
                    </div>
                  )}
                  {selectedClub.mission && (
                    <div style={styles.missionBox}>
                      <h4 style={styles.missionTitle}>Mission</h4>
                      <p style={styles.missionText}>{selectedClub.mission}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Faculty Advisor */}
              {selectedClub.facultyAdvisor?.name && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Faculty Advisor</h3>
                  <div style={styles.advisorBox}>
                    <p style={styles.advisorName}>{selectedClub.facultyAdvisor.name}</p>
                    <p style={styles.advisorDetail}>{selectedClub.facultyAdvisor.department}</p>
                    <p style={styles.advisorDetail}>{selectedClub.facultyAdvisor.email}</p>
                  </div>
                </div>
              )}

              {/* Meeting Schedule */}
              {selectedClub.meetingSchedule?.day && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Meeting Schedule</h3>
                  <div style={styles.scheduleBox}>
                    <FiCalendar style={styles.scheduleIcon} />
                    <div>
                      <p style={styles.scheduleText}>{selectedClub.meetingSchedule.day}s</p>
                      <p style={styles.scheduleDetail}>
                        {selectedClub.meetingSchedule.time} at {selectedClub.meetingSchedule.venue}
                        ({selectedClub.meetingSchedule.frequency})
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links */}
              {Object.values(selectedClub.socialLinks || {}).some(link => link) && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Connect With Us</h3>
                  <div style={styles.socialLinks}>
                    {selectedClub.socialLinks?.instagram && (
                      <a href={selectedClub.socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                        Instagram
                      </a>
                    )}
                    {selectedClub.socialLinks?.linkedin && (
                      <a href={selectedClub.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                        LinkedIn
                      </a>
                    )}
                    {selectedClub.socialLinks?.github && (
                      <a href={selectedClub.socialLinks.github} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                        GitHub
                      </a>
                    )}
                    {selectedClub.socialLinks?.website && (
                      <a href={selectedClub.socialLinks.website} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Upcoming Events */}
              {selectedClub.events?.filter(e => new Date(e.date) >= new Date()).length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Upcoming Events</h3>
                  <div style={styles.eventsList}>
                    {selectedClub.events
                      .filter(e => new Date(e.date) >= new Date())
                      .map(event => (
                        <div key={event._id} style={styles.eventCard}>
                          <div style={styles.eventInfo}>
                            <h4 style={styles.eventTitle}>{event.title}</h4>
                            <p style={styles.eventDescription}>{event.description}</p>
                            <div style={styles.eventDetails}>
                              <span style={styles.eventDetail}>
                                <FiCalendar style={styles.detailIcon} />
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                              {event.location && (
                                <span style={styles.eventDetail}>
                                  <FiMapPin style={styles.detailIcon} />
                                  {event.location}
                                </span>
                              )}
                              {event.startTime && (
                                <span style={styles.eventDetail}>
                                  <FiBell style={styles.detailIcon} />
                                  {event.startTime} - {event.endTime}
                                </span>
                              )}
                            </div>
                          </div>
                          {selectedClub.isMember && (
                            <button
                              onClick={() => handleRegisterForEvent(selectedClub._id, event._id)}
                              style={styles.registerButton}
                            >
                              Register
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Latest News */}
              {selectedClub.news?.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Latest News</h3>
                  <div style={styles.newsList}>
                    {selectedClub.news.slice(0, 5).map(news => (
                      <div key={news._id} style={{
                        ...styles.newsCard,
                        borderLeftColor: news.importance === "urgent" ? "#ef4444" :
                                        news.importance === "important" ? "#f59e0b" : "#8b5cf6"
                      }}>
                        <div style={styles.newsHeader}>
                          <FiBell style={styles.newsIcon} />
                          <h4 style={styles.newsTitle}>{news.title}</h4>
                          {news.importance === "important" && (
                            <span style={styles.importantBadge}>Important</span>
                          )}
                          {news.importance === "urgent" && (
                            <span style={styles.urgentBadge}>Urgent</span>
                          )}
                        </div>
                        <p style={styles.newsContent}>{news.content}</p>
                        <p style={styles.newsDate}>
                          {new Date(news.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f3f4f6",
  },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "1rem",
    color: "#6b7280",
  },
  header: {
    background: "white",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerContent: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "1.5rem 2rem",
  },
  headerTitle: {
    fontSize: "1.875rem",
    fontWeight: "bold",
    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
  },
  headerSubtitle: {
    color: "#6b7280",
    marginTop: "0.5rem",
  },
  content: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "2rem",
  },
  clubsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "1.5rem",
  },
  clubCard: {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "boxShadow 0.3s ease",
  },
  clubCardHeader: {
    position: "relative",
    height: "120px",
  },
  clubCover: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  clubCoverPlaceholder: {
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  memberBadge: {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "#10b981",
    color: "white",
    padding: "4px 8px",
    borderRadius: "9999px",
    fontSize: "12px",
  },
  clubCardBody: {
    padding: "1rem",
    position: "relative",
  },
  clubLogoContainer: {
    position: "absolute",
    top: "-30px",
    left: "16px",
  },
  clubLogo: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    border: "4px solid white",
    background: "white",
    objectFit: "cover",
  },
  clubInfo: {
    marginLeft: "76px",
    marginBottom: "12px",
  },
  clubName: {
    fontSize: "1.125rem",
    fontWeight: "bold",
    color: "#111827",
    margin: 0,
  },
  clubShortName: {
    fontSize: "0.75rem",
    color: "#6b7280",
    margin: "4px 0 0 0",
  },
  clubCategory: {
    display: "inline-block",
    background: "#e5e7eb",
    color: "#374151",
    padding: "2px 8px",
    borderRadius: "9999px",
    fontSize: "0.7rem",
    marginTop: "4px",
  },
  clubDescription: {
    fontSize: "0.875rem",
    color: "#4b5563",
    marginBottom: "12px",
    lineHeight: "1.4",
  },
  clubMeta: {
    display: "flex",
    gap: "1rem",
    marginBottom: "12px",
  },
  clubMetaItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  metaIcon: {
    fontSize: "12px",
  },
  joinButton: {
    width: "100%",
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  leaveButton: {
    width: "100%",
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
  },
  emptyIcon: {
    width: "64px",
    height: "64px",
    margin: "0 auto",
    color: "#d1d5db",
  },
  emptyTitle: {
    fontSize: "1.125rem",
    fontWeight: "500",
    color: "#111827",
    marginTop: "1rem",
  },
  emptyText: {
    color: "#6b7280",
    marginTop: "0.5rem",
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
    overflowY: "auto",
  },
  modalContent: {
    background: "white",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "1024px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    position: "relative",
    height: "200px",
  },
  modalCover: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  modalHeaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
  },
  modalHeaderInfo: {
    position: "absolute",
    bottom: "0",
    left: "0",
    right: "0",
    padding: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  modalLogoContainer: {
    background: "white",
    borderRadius: "50%",
    padding: "4px",
  },
  modalLogo: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  modalTitleContainer: {
    color: "white",
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: 0,
  },
  modalMotto: {
    fontSize: "0.875rem",
    opacity: 0.9,
    marginTop: "4px",
  },
  closeButton: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(4px)",
    border: "none",
    borderRadius: "50%",
    padding: "8px",
    cursor: "pointer",
  },
  closeIcon: {
    width: "20px",
    height: "20px",
    color: "white",
  },
  modalBody: {
    padding: "1.5rem",
  },
  section: {
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "0.75rem",
  },
  sectionText: {
    color: "#4b5563",
    lineHeight: "1.5",
  },
  twoColumnSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  visionBox: {
    background: "#eff6ff",
    padding: "1rem",
    borderRadius: "8px",
  },
  visionTitle: {
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: "0.5rem",
  },
  visionText: {
    fontSize: "0.875rem",
    color: "#1e3a8a",
  },
  missionBox: {
    background: "#faf5ff",
    padding: "1rem",
    borderRadius: "8px",
  },
  missionTitle: {
    fontWeight: "600",
    color: "#6b21a5",
    marginBottom: "0.5rem",
  },
  missionText: {
    fontSize: "0.875rem",
    color: "#581c87",
  },
  advisorBox: {
    background: "#f9fafb",
    padding: "1rem",
    borderRadius: "8px",
  },
  advisorName: {
    fontWeight: "500",
    color: "#111827",
  },
  advisorDetail: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginTop: "4px",
  },
  scheduleBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    background: "#f9fafb",
    padding: "1rem",
    borderRadius: "8px",
  },
  scheduleIcon: {
    width: "20px",
    height: "20px",
    color: "#8b5cf6",
  },
  scheduleText: {
    fontWeight: "500",
    color: "#111827",
  },
  scheduleDetail: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginTop: "4px",
  },
  socialLinks: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  socialLink: {
    padding: "0.5rem 1rem",
    background: "#f3f4f6",
    color: "#374151",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "0.875rem",
  },
  eventsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  eventCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontWeight: "600",
    color: "#111827",
    marginBottom: "4px",
  },
  eventDescription: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginBottom: "8px",
  },
  eventDetails: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  eventDetail: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
  detailIcon: {
    width: "12px",
    height: "12px",
  },
  registerButton: {
    background: "#8b5cf6",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "0.75rem",
    cursor: "pointer",
  },
  newsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  newsCard: {
    borderLeft: "4px solid",
    paddingLeft: "1rem",
    paddingTop: "0.5rem",
    paddingBottom: "0.5rem",
  },
  newsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "4px",
  },
  newsIcon: {
    width: "14px",
    height: "14px",
    color: "#8b5cf6",
  },
  newsTitle: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#111827",
  },
  importantBadge: {
    background: "#fef3c7",
    color: "#d97706",
    padding: "2px 6px",
    borderRadius: "9999px",
    fontSize: "0.7rem",
  },
  urgentBadge: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "2px 6px",
    borderRadius: "9999px",
    fontSize: "0.7rem",
  },
  newsContent: {
    fontSize: "0.875rem",
    color: "#4b5563",
    marginBottom: "4px",
  },
  newsDate: {
    fontSize: "0.7rem",
    color: "#9ca3af",
  },
};

// Add CSS animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default CampusClubs;