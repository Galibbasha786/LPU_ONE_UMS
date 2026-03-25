import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [formData, setFormData] = useState({
    // Student Form
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    studentCourse: "",
    studentQualification: "",
    studentMessage: "",
    // Staff Form
    staffName: "",
    staffEmail: "",
    staffPhone: "",
    staffQualification: "",
    staffExperience: "",
    staffDepartment: "",
    staffMessage: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  
  const formRef = useRef();

  // Scroll to section
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e) => {
    setContactFormData({ ...contactFormData, [e.target.name]: e.target.value });
  };

  // Handle Student Form Submit
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch("http://localhost:5001/api/email/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.studentName,
          email: formData.studentEmail,
          phone: formData.studentPhone,
          course: formData.studentCourse,
          qualification: formData.studentQualification,
          message: formData.studentMessage
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Thank you! Your admission application has been sent. We'll contact you soon!");
        setMessageType("success");
        setFormData({
          ...formData,
          studentName: "", studentEmail: "", studentPhone: "", studentCourse: "", studentQualification: "", studentMessage: ""
        });
        setTimeout(() => setShowStudentForm(false), 2000);
      } else {
        setMessage("❌ " + data.message);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ Failed to send application. Please try again later.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  // Handle Staff Form Submit
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch("http://localhost:5001/api/email/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.staffName,
          email: formData.staffEmail,
          phone: formData.staffPhone,
          qualification: formData.staffQualification,
          experience: formData.staffExperience,
          department: formData.staffDepartment,
          message: formData.staffMessage
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Thank you! Your application has been sent. We'll contact you soon!");
        setMessageType("success");
        setFormData({
          ...formData,
          staffName: "", staffEmail: "", staffPhone: "", staffQualification: "", staffExperience: "", staffDepartment: "", staffMessage: ""
        });
        setTimeout(() => setShowStaffForm(false), 2000);
      } else {
        setMessage("❌ " + data.message);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ Failed to send application. Please try again later.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  // Handle Contact Form Submit
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch("http://localhost:5001/api/email/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactFormData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage("✅ Message sent successfully! We'll get back to you soon.");
        setMessageType("success");
        setContactFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setMessage("❌ " + data.message);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ Failed to send message. Please try again later.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  // Enhanced campus photos with better quality images
  const campusPhotos = [
    { url: "https://images.unsplash.com/photo-1562774053-701939374585?w=800", title: "Academic Block", description: "State-of-the-art classrooms" },
    { url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800", title: "Central Library", description: "Vast collection of books & e-resources" },
    { url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800", title: "Hostel Complex", description: "Comfortable accommodation" },
    { url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800", title: "Sports Arena", description: "World-class sports facilities" },
    { url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800", title: "Central Plaza", description: "Vibrant student hub" },
    { url: "https://images.unsplash.com/photo-1541823709867-1b206113eafd?w=800", title: "Innovation Hub", description: "Cutting-edge research labs" }
  ];

  // Achievements data
  const achievements = [
    { number: "50+", label: "Academic Programs", icon: "🎓" },
    { number: "1000+", label: "International Students", icon: "🌍" },
    { number: "500+", label: "Industry Partners", icon: "🤝" },
    { number: "2000+", label: "Placements", icon: "💼" }
  ];

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          <span style={styles.logoIcon}>🎓</span>
          <span style={styles.logoText}>LPU Portal</span>
        </div>
        <div style={styles.navLinks}>
          <button onClick={() => scrollToSection("home")} style={styles.navLink}>Home</button>
          <button onClick={() => scrollToSection("about")} style={styles.navLink}>About</button>
          <button onClick={() => scrollToSection("campus")} style={styles.navLink}>Campus</button>
          <button onClick={() => scrollToSection("achievements")} style={styles.navLink}>Achievements</button>
          <button onClick={() => scrollToSection("contact")} style={styles.navLink}>Contact</button>
          <button onClick={() => navigate("/login")} style={styles.loginBtn}>Login</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>India's Largest Private University</div>
          <h1 style={styles.heroTitle}>Welcome to Lovely Professional University</h1>
          <p style={styles.heroSubtitle}>30,000+ Students | 500+ Acres Campus | 200+ Programs | 1,500+ Faculty</p>
          <div style={styles.heroButtons}>
            <button onClick={() => setShowStudentForm(true)} style={styles.admissionBtn}>
              📝 Apply for Admission
            </button>
            <button onClick={() => setShowStaffForm(true)} style={styles.recruitmentBtn}>
              👨‍🏫 Join as Faculty
            </button>
            <button onClick={() => scrollToSection("contact")} style={styles.contactBtn}>
              📞 Contact Us
            </button>
          </div>
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>30,000+</div>
              <div style={styles.statLabel}>Students</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>1,500+</div>
              <div style={styles.statLabel}>Faculty</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>500+</div>
              <div style={styles.statLabel}>Acres Campus</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>200+</div>
              <div style={styles.statLabel}>Programs</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={styles.about}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>About Us</span>
            <h2 style={styles.sectionTitle}>Welcome to Lovely Professional University</h2>
            <p style={styles.sectionSubtitle}>Excellence in Education Since 2005</p>
          </div>
          <div style={styles.aboutGrid}>
            <div style={styles.aboutCard}>
              <div style={styles.aboutIcon}>🎯</div>
              <h3>Our Mission</h3>
              <p>To provide quality education that transforms students into responsible global citizens, equipped with knowledge, skills, and values to excel in their chosen fields.</p>
            </div>
            <div style={styles.aboutCard}>
              <div style={styles.aboutIcon}>👁️</div>
              <h3>Our Vision</h3>
              <p>To be a world-class university that nurtures innovation, research, and excellence, creating leaders who will shape the future of India and the world.</p>
            </div>
            <div style={styles.aboutCard}>
              <div style={styles.aboutIcon}>⭐</div>
              <h3>Our Values</h3>
              <p>Integrity, Innovation, Excellence, Inclusivity, and Social Responsibility. We believe in holistic development and creating a positive impact on society.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" style={styles.achievements}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>Our Achievements</span>
            <h2 style={styles.sectionTitle}>Recognized Excellence</h2>
          </div>
          <div style={styles.achievementsGrid}>
            {achievements.map((item, index) => (
              <div key={index} style={styles.achievementCard}>
                <div style={styles.achievementIcon}>{item.icon}</div>
                <div style={styles.achievementNumber}>{item.number}</div>
                <div style={styles.achievementLabel}>{item.label}</div>
              </div>
            ))}
          </div>
          <div style={styles.rankings}>
            <div style={styles.rankingItem}>
              <span>🏆</span>
              <span>Ranked #1 Private University in India</span>
            </div>
            <div style={styles.rankingItem}>
              <span>⭐</span>
              <span>NAAC A+ Accreditation</span>
            </div>
            <div style={styles.rankingItem}>
              <span>🌍</span>
              <span>QS I-Gauge Gold Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Gallery Section */}
      <section id="campus" style={styles.gallery}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>Explore Campus</span>
            <h2 style={styles.sectionTitle}>Campus Gallery</h2>
            <p style={styles.sectionSubtitle}>Experience the vibrant LPU campus life</p>
          </div>
          <div style={styles.galleryGrid}>
            {campusPhotos.map((photo, index) => (
              <div key={index} style={styles.galleryItem}>
                <img src={photo.url} alt={photo.title} style={styles.galleryImage} />
                <div style={styles.galleryOverlay}>
                  <span style={styles.galleryTitle}>{photo.title}</span>
                  <span style={styles.galleryDesc}>{photo.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={styles.contact}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>Get in Touch</span>
            <h2 style={styles.sectionTitle}>Contact Us</h2>
            <p style={styles.sectionSubtitle}>Have questions? We're here to help!</p>
          </div>
          <div style={styles.contactGrid}>
            <div style={styles.contactInfo}>
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>📍</div>
                <div>
                  <h4>Address</h4>
                  <p>LPU Campus, Jalandhar - Delhi G.T. Road,<br/>Phagwara, Punjab - 144411</p>
                </div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>📞</div>
                <div>
                  <h4>Phone</h4>
                  <p>+91 1824 404 404</p>
                  <p>+91 98765 43210</p>
                </div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>📧</div>
                <div>
                  <h4>Email</h4>
                  <p>admissions@lpu.edu.in</p>
                  <p>info@lpu.edu.in</p>
                </div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>⏰</div>
                <div>
                  <h4>Working Hours</h4>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 9:00 AM - 2:00 PM</p>
                </div>
              </div>
            </div>
            <div style={styles.contactForm}>
              <h3>Send us a Message</h3>
              <form onSubmit={handleContactSubmit}>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Your Name *" 
                  value={contactFormData.name}
                  onChange={handleContactChange}
                  style={styles.formInput} 
                  required 
                />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Your Email *" 
                  value={contactFormData.email}
                  onChange={handleContactChange}
                  style={styles.formInput} 
                  required 
                />
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="Phone Number" 
                  value={contactFormData.phone}
                  onChange={handleContactChange}
                  style={styles.formInput} 
                />
                <textarea 
                  name="message" 
                  placeholder="Your Message *" 
                  rows="4" 
                  value={contactFormData.message}
                  onChange={handleContactChange}
                  style={styles.formTextarea} 
                  required
                ></textarea>
                <button type="submit" style={styles.submitContactBtn} disabled={submitting}>
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <h3>LPU Portal</h3>
            <p>Transforming education, empowering futures.</p>
            <div style={styles.socialLinks}>
              <a href="#" style={styles.socialLink}>📘</a>
              <a href="#" style={styles.socialLink}>🐦</a>
              <a href="#" style={styles.socialLink}>📸</a>
              <a href="#" style={styles.socialLink}>💼</a>
            </div>
          </div>
          <div style={styles.footerSection}>
            <h3>Quick Links</h3>
            <button onClick={() => scrollToSection("home")} style={styles.footerLink}>Home</button>
            <button onClick={() => scrollToSection("about")} style={styles.footerLink}>About</button>
            <button onClick={() => scrollToSection("campus")} style={styles.footerLink}>Campus</button>
            <button onClick={() => scrollToSection("achievements")} style={styles.footerLink}>Achievements</button>
            <button onClick={() => scrollToSection("contact")} style={styles.footerLink}>Contact</button>
          </div>
          <div style={styles.footerSection}>
            <h3>Important Links</h3>
            <a href="#" style={styles.footerLink}>Admissions</a>
            <a href="#" style={styles.footerLink}>Placements</a>
            <a href="#" style={styles.footerLink}>Scholarships</a>
            <a href="#" style={styles.footerLink}>Student Portal</a>
          </div>
          <div style={styles.footerSection}>
            <h3>Subscribe to Newsletter</h3>
            <div style={styles.newsletter}>
              <input type="email" placeholder="Your Email" style={styles.newsletterInput} />
              <button style={styles.newsletterBtn}>Subscribe</button>
            </div>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>&copy; 2024 Lovely Professional University. All rights reserved. | <a href="#" style={styles.footerLink}>Privacy Policy</a> | <a href="#" style={styles.footerLink}>Terms of Use</a></p>
        </div>
      </footer>

      {/* Student Admission Modal */}
      {showStudentForm && (
        <div style={styles.modalOverlay} onClick={() => setShowStudentForm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>🎓 Student Admission Application</h2>
              <button style={styles.modalClose} onClick={() => setShowStudentForm(false)}>✕</button>
            </div>
            <form onSubmit={handleStudentSubmit} style={styles.modalForm}>
              <input type="text" name="studentName" placeholder="Full Name *" value={formData.studentName} onChange={handleChange} style={styles.modalInput} required />
              <input type="email" name="studentEmail" placeholder="Email Address *" value={formData.studentEmail} onChange={handleChange} style={styles.modalInput} required />
              <input type="tel" name="studentPhone" placeholder="Phone Number *" value={formData.studentPhone} onChange={handleChange} style={styles.modalInput} required />
              <select name="studentCourse" value={formData.studentCourse} onChange={handleChange} style={styles.modalSelect} required>
                <option value="">Select Course *</option>
                <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                <option value="B.Tech Electronics">B.Tech Electronics</option>
                <option value="B.Tech Mechanical">B.Tech Mechanical</option>
                <option value="B.Tech Civil">B.Tech Civil</option>
                <option value="MBA">MBA</option>
                <option value="MCA">MCA</option>
                <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                <option value="BCA">BCA</option>
                <option value="BA Economics">BA Economics</option>
                <option value="B.Com">B.Com</option>
              </select>
              <select name="studentQualification" value={formData.studentQualification} onChange={handleChange} style={styles.modalSelect} required>
                <option value="">Highest Qualification *</option>
                <option value="10th Pass">10th Pass</option>
                <option value="12th Pass">12th Pass</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
              </select>
              <textarea name="studentMessage" placeholder="Additional Information (Optional)" value={formData.studentMessage} onChange={handleChange} style={styles.modalTextarea} rows="3"></textarea>
              <button type="submit" style={styles.modalSubmitBtn} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Staff Recruitment Modal */}
      {showStaffForm && (
        <div style={styles.modalOverlay} onClick={() => setShowStaffForm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>👨‍🏫 Faculty Recruitment</h2>
              <button style={styles.modalClose} onClick={() => setShowStaffForm(false)}>✕</button>
            </div>
            <form onSubmit={handleStaffSubmit} style={styles.modalForm}>
              <input type="text" name="staffName" placeholder="Full Name *" value={formData.staffName} onChange={handleChange} style={styles.modalInput} required />
              <input type="email" name="staffEmail" placeholder="Email Address *" value={formData.staffEmail} onChange={handleChange} style={styles.modalInput} required />
              <input type="tel" name="staffPhone" placeholder="Phone Number *" value={formData.staffPhone} onChange={handleChange} style={styles.modalInput} required />
              <select name="staffQualification" value={formData.staffQualification} onChange={handleChange} style={styles.modalSelect} required>
                <option value="">Highest Qualification *</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="M.Phil">M.Phil</option>
                <option value="Ph.D">Ph.D</option>
                <option value="Post Doctorate">Post Doctorate</option>
              </select>
              <input type="text" name="staffExperience" placeholder="Years of Experience *" value={formData.staffExperience} onChange={handleChange} style={styles.modalInput} required />
              <select name="staffDepartment" value={formData.staffDepartment} onChange={handleChange} style={styles.modalSelect} required>
                <option value="">Preferred Department *</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
              </select>
              <textarea name="staffMessage" placeholder="Additional Information / Cover Letter" value={formData.staffMessage} onChange={handleChange} style={styles.modalTextarea} rows="3"></textarea>
              <button type="submit" style={styles.modalSubmitBtn} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Message Toast */}
      {message && (
        <div style={{...styles.toast, ...(messageType === "success" ? styles.toastSuccess : styles.toastError)}}>
          {message}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    overflowX: "hidden",
  },
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(10px)",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1000,
    boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
  },
  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#f58003",
  },
  logoIcon: { fontSize: "1.8rem" },
  logoText: { fontSize: "1.3rem" },
  navLinks: {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
  },
  navLink: {
    background: "none",
    border: "none",
    fontSize: "1rem",
    cursor: "pointer",
    color: "#2d3748",
    fontWeight: "500",
    transition: "color 0.3s",
  },
  loginBtn: {
    background: "linear-gradient(135deg, #f58003, #e65100)",
    color: "white",
    border: "none",
    padding: "0.5rem 1.5rem",
    borderRadius: "25px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "transform 0.3s",
  },
  hero: {
    minHeight: "100vh",
    backgroundImage: "url('https://images.unsplash.com/photo-1562774053-701939374585?w=1600')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    color: "white",
    maxWidth: "900px",
    padding: "2rem",
  },
  heroBadge: {
    display: "inline-block",
    background: "rgba(245, 128, 3, 0.9)",
    padding: "0.5rem 1rem",
    borderRadius: "30px",
    fontSize: "0.9rem",
    marginBottom: "1.5rem",
  },
  heroTitle: {
    fontSize: "3.5rem",
    marginBottom: "1rem",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
  },
  heroSubtitle: {
    fontSize: "1.2rem",
    marginBottom: "2rem",
    opacity: 0.9,
  },
  heroButtons: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginBottom: "3rem",
    flexWrap: "wrap",
  },
  admissionBtn: {
    background: "linear-gradient(135deg, #f58003, #e65100)",
    color: "white",
    border: "none",
    padding: "1rem 2rem",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.3s",
  },
  recruitmentBtn: {
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    padding: "1rem 2rem",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.3s",
  },
  contactBtn: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    border: "none",
    padding: "1rem 2rem",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.3s",
  },
  stats: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: "2rem",
    marginTop: "2rem",
  },
  statItem: { textAlign: "center" },
  statNumber: { fontSize: "2rem", fontWeight: "bold" },
  statLabel: { fontSize: "0.9rem", opacity: 0.8 },
  sectionContainer: { maxWidth: "1200px", margin: "0 auto", padding: "5rem 2rem" },
  sectionHeader: { textAlign: "center", marginBottom: "3rem" },
  sectionTag: {
    display: "inline-block",
    background: "#f5800310",
    color: "#f58003",
    padding: "0.3rem 1rem",
    borderRadius: "20px",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },
  sectionTitle: { fontSize: "2.5rem", marginBottom: "1rem", color: "#2d3748" },
  sectionSubtitle: { color: "#718096", fontSize: "1.1rem" },
  about: { background: "white" },
  aboutGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
  },
  aboutCard: {
    textAlign: "center",
    padding: "2rem",
    background: "#f8f9fa",
    borderRadius: "20px",
    transition: "transform 0.3s",
  },
  aboutIcon: { fontSize: "3rem", marginBottom: "1rem" },
  achievements: { background: "#f8f9fa" },
  achievementsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "2rem",
    marginBottom: "3rem",
  },
  achievementCard: {
    textAlign: "center",
    padding: "2rem",
    background: "white",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
  achievementIcon: { fontSize: "2.5rem", marginBottom: "0.5rem" },
  achievementNumber: { fontSize: "2rem", fontWeight: "bold", color: "#f58003" },
  achievementLabel: { fontSize: "0.9rem", color: "#718096" },
  rankings: {
    display: "flex",
    justifyContent: "center",
    gap: "2rem",
    flexWrap: "wrap",
    marginTop: "2rem",
  },
  rankingItem: {
    background: "white",
    padding: "1rem 2rem",
    borderRadius: "30px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  gallery: { background: "white" },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "1.5rem",
  },
  galleryItem: {
    position: "relative",
    borderRadius: "15px",
    overflow: "hidden",
    aspectRatio: "4/3",
    cursor: "pointer",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s",
  },
  galleryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
    padding: "1.5rem",
    color: "white",
  },
  galleryTitle: { fontSize: "1.2rem", fontWeight: "bold", display: "block" },
  galleryDesc: { fontSize: "0.8rem", opacity: 0.8, marginTop: "0.3rem", display: "block" },
  contact: { background: "#f8f9fa" },
  contactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "3rem",
  },
  contactInfo: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  infoItem: { display: "flex", gap: "1rem", alignItems: "flex-start" },
  infoIcon: { fontSize: "1.5rem", minWidth: "2rem" },
  contactForm: { background: "white", padding: "2rem", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" },
  formInput: {
    width: "100%",
    padding: "12px",
    marginBottom: "1rem",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "1rem",
    transition: "all 0.3s",
  },
  formTextarea: {
    width: "100%",
    padding: "12px",
    marginBottom: "1rem",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "1rem",
    resize: "vertical",
    transition: "all 0.3s",
  },
  submitContactBtn: {
    background: "linear-gradient(135deg, #f58003, #e65100)",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    transition: "transform 0.3s",
  },
  footer: {
    background: "#1a202c",
    color: "white",
    padding: "3rem 2rem 1rem",
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "2rem",
    marginBottom: "2rem",
  },
  footerSection: { textAlign: "left" },
  footerLink: {
    display: "block",
    background: "none",
    border: "none",
    color: "#cbd5e0",
    margin: "0.5rem 0",
    cursor: "pointer",
    textAlign: "left",
    textDecoration: "none",
  },
  socialLinks: { display: "flex", gap: "1rem", marginTop: "1rem" },
  socialLink: {
    background: "rgba(255,255,255,0.1)",
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    color: "white",
    transition: "all 0.3s",
  },
  newsletter: { display: "flex", marginTop: "1rem", gap: "0.5rem" },
  newsletterInput: {
    flex: 1,
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
  },
  newsletterBtn: {
    background: "#f58003",
    border: "none",
    padding: "8px 15px",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
  },
  footerBottom: { textAlign: "center", paddingTop: "2rem", borderTop: "1px solid #2d3748", color: "#a0aec0", fontSize: "0.9rem" },
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
    zIndex: 2000,
  },
  modalContent: {
    background: "white",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "85vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem",
    borderBottom: "1px solid #e2e8f0",
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#718096",
  },
  modalForm: { padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" },
  modalInput: {
    padding: "12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
  },
  modalSelect: {
    padding: "12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
    background: "white",
  },
  modalTextarea: {
    padding: "12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
    resize: "vertical",
  },
  modalSubmitBtn: {
    background: "linear-gradient(135deg, #f58003, #e65100)",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  toast: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "1rem 1.5rem",
    borderRadius: "10px",
    zIndex: 3000,
    animation: "slideIn 0.3s ease",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  toastSuccess: { background: "#10b981", color: "white" },
  toastError: { background: "#ef4444", color: "white" },
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  button:hover { transform: translateY(-2px); }
  button:active { transform: scale(0.98); }
  .gallery-item:hover img { transform: scale(1.05); }
  input:focus, textarea:focus, select:focus {
    border-color: #f58003 !important;
    outline: none;
    box-shadow: 0 0 0 3px rgba(245, 128, 3, 0.1);
  }
`;
document.head.appendChild(styleSheet);

export default HomePage;