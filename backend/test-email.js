require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

console.log('Testing connection with:', process.env.EMAIL_USER);

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to take messages');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Nodemailer Test',
      text: 'If you received this, your email configuration is working!'
    };

    transporter.sendMail(mailOptions, (sendErr, info) => {
      if (sendErr) {
        console.error('Send Error:', sendErr);
      } else {
        console.log('Test Email Sent:', info.response);
      }
    });
  }
});
