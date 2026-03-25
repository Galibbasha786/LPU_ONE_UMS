// backend/services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug: Check if env variables are loaded
console.log('📧 Email Service Initialized');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✓ Set' : '✗ Not set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ Set' : '✗ Not set');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Add these for better debugging
  debug: true,
  logger: true
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
    console.error('Please check your EMAIL_USER and EMAIL_PASS in .env file');
  } else {
    console.log('✅ Email transporter ready - Gmail configured successfully');
  }
});

// Send Admission Email
export const sendAdmissionEmail = async (formData) => {
  const { name, email, phone, course, qualification, message } = formData;
  
  const mailOptions = {
    from: `"LPU Admissions" <${process.env.EMAIL_USER}>`,
    to: 'syedsunnygalibbasha@gmail.com',
    subject: `🎓 New Student Admission Application - ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f58003, #e65100); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #f58003; }
          .value { margin-left: 10px; }
          .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎓 New Student Admission Application</h2>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Student Name:</span>
              <span class="value">${name}</span>
            </div>
            <div class="field">
              <span class="label">Email:</span>
              <span class="value">${email}</span>
            </div>
            <div class="field">
              <span class="label">Phone:</span>
              <span class="value">${phone}</span>
            </div>
            <div class="field">
              <span class="label">Course Applied:</span>
              <span class="value">${course}</span>
            </div>
            <div class="field">
              <span class="label">Qualification:</span>
              <span class="value">${qualification}</span>
            </div>
            <div class="field">
              <span class="label">Additional Message:</span>
              <span class="value">${message || 'N/A'}</span>
            </div>
          </div>
          <div class="footer">
            <p>This application was submitted from LPU Portal Website</p>
            <p>Sent on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Admission email sent to:', info.envelope.to);
    return info;
  } catch (error) {
    console.error('❌ Error sending admission email:', error.message);
    throw error;
  }
};

// Send Staff Recruitment Email
export const sendStaffEmail = async (formData) => {
  const { name, email, phone, qualification, experience, department, message } = formData;
  
  const mailOptions = {
    from: `"LPU Recruitment" <${process.env.EMAIL_USER}>`,
    to: 'syedsunnygalibbasha@gmail.com',
    subject: `👨‍🏫 New Staff Recruitment Application - ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #10b981; }
          .value { margin-left: 10px; }
          .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>👨‍🏫 New Staff Recruitment Application</h2>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Applicant Name:</span>
              <span class="value">${name}</span>
            </div>
            <div class="field">
              <span class="label">Email:</span>
              <span class="value">${email}</span>
            </div>
            <div class="field">
              <span class="label">Phone:</span>
              <span class="value">${phone}</span>
            </div>
            <div class="field">
              <span class="label">Qualification:</span>
              <span class="value">${qualification}</span>
            </div>
            <div class="field">
              <span class="label">Experience:</span>
              <span class="value">${experience} years</span>
            </div>
            <div class="field">
              <span class="label">Department Applied:</span>
              <span class="value">${department}</span>
            </div>
            <div class="field">
              <span class="label">Additional Message:</span>
              <span class="value">${message || 'N/A'}</span>
            </div>
          </div>
          <div class="footer">
            <p>This application was submitted from LPU Portal Website</p>
            <p>Sent on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Staff email sent to:', info.envelope.to);
    return info;
  } catch (error) {
    console.error('❌ Error sending staff email:', error.message);
    throw error;
  }
};

// Send Contact Form Email
export const sendContactEmail = async (formData) => {
  const { name, email, phone, message } = formData;
  
  const mailOptions = {
    from: `"LPU Contact" <${process.env.EMAIL_USER}>`,
    to: 'syedsunnygalibbasha@gmail.com',
    subject: `📧 New Contact Message from ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #3b82f6; }
          .value { margin-left: 10px; }
          .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📧 New Contact Message</h2>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Name:</span>
              <span class="value">${name}</span>
            </div>
            <div class="field">
              <span class="label">Email:</span>
              <span class="value">${email}</span>
            </div>
            <div class="field">
              <span class="label">Phone:</span>
              <span class="value">${phone || 'N/A'}</span>
            </div>
            <div class="field">
              <span class="label">Message:</span>
              <span class="value">${message}</span>
            </div>
          </div>
          <div class="footer">
            <p>This message was sent from LPU Portal Website</p>
            <p>Sent on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Contact email sent to:', info.envelope.to);
    return info;
  } catch (error) {
    console.error('❌ Error sending contact email:', error.message);
    throw error;
  }
};