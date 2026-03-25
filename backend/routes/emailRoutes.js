// backend/routes/emailRoutes.js
import express from 'express';
import { sendAdmissionEmail, sendStaffEmail, sendContactEmail } from '../services/emailService.js';

const router = express.Router();

// Send Admission Application
router.post('/admission', async (req, res) => {
  try {
    const { name, email, phone, course, qualification, message } = req.body;
    
    if (!name || !email || !phone || !course || !qualification) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill all required fields' 
      });
    }
    
    await sendAdmissionEmail({ name, email, phone, course, qualification, message });
    
    res.json({ 
      success: true, 
      message: 'Application submitted successfully! We will contact you soon.' 
    });
  } catch (error) {
    console.error('Error sending admission email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit application. Please try again later.' 
    });
  }
});

// Send Staff Application
router.post('/staff', async (req, res) => {
  try {
    const { name, email, phone, qualification, experience, department, message } = req.body;
    
    if (!name || !email || !phone || !qualification || !experience || !department) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill all required fields' 
      });
    }
    
    await sendStaffEmail({ name, email, phone, qualification, experience, department, message });
    
    res.json({ 
      success: true, 
      message: 'Application submitted successfully! We will contact you soon.' 
    });
  } catch (error) {
    console.error('Error sending staff email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit application. Please try again later.' 
    });
  }
});

// Send Contact Message
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill all required fields' 
      });
    }
    
    await sendContactEmail({ name, email, phone, message });
    
    res.json({ 
      success: true, 
      message: 'Message sent successfully! We will get back to you soon.' 
    });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again later.' 
    });
  }
});

export default router;