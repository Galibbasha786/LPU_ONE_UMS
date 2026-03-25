import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing with:');
console.log('User:', process.env.EMAIL_USER);
console.log('Pass length:', process.env.EMAIL_PASS?.length);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: 'syedsunnygalibbasha@gmail.com',
  subject: 'Test Email',
  text: 'This is a test from LPU Portal'
}, (err, info) => {
  if (err) {
    console.log('❌ Error:', err.message);
    console.log('Full error:', err);
  } else {
    console.log('✅ Success! Email sent:', info.messageId);
  }
});