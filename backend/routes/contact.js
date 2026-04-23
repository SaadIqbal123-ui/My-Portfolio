const express = require('express');
const router = express.Router();
const { query } = require('../db');
const verifyToken = require('../middleware/verifyToken');
const nodemailer = require('nodemailer');
const multer = require('multer');

// Configure Multer for memory storage (max 4 images)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per file
}).array('images', 4);

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// POST /api/contact — save contact form submission and send email
router.post('/', (req, res) => {
  upload(req, res, async (err) => {
    // Extensive logging for debugging
    console.log('--- Incoming Contact Submission ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Files count:', req.files ? req.files.length : 0);

    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err.message);
      return res.status(400).json({ error: `File upload error: ${err.message}` });
    } else if (err) {
      console.error('Upload Error:', err.message);
      return res.status(500).json({ error: 'Server error during upload' });
    }

    try {
      const { name, email, subject, message, attachment_link } = req.body;
      const images = req.files || [];

      if (!name || !email || !subject || !message) {
        console.warn('Missing required fields:', { name, email, subject, message });
        return res.status(400).json({ error: 'All fields (name, email, subject, message) are required' });
      }

      // 1. Save to Database
      await query(
        `INSERT INTO contacts (full_name, email, subject, message, attachment_link)
         VALUES (:full_name, :email, :subject, :message, :attachment_link)`,
        { full_name: name, email, subject, message, attachment_link: attachment_link || null }
      );

      // 2. Prepare Email Notification
      const attachments = images.map(file => ({
        filename: file.originalname,
        content: file.buffer
      }));

      const mailOptions = {
        from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
        to: 'saadiqbalbse067@gmail.com',
        subject: `New Portfolio Message: ${subject}`,
        text: `You have received a new message from your portfolio contact form.\n\n` +
              `Name: ${name}\n` +
              `Email: ${email}\n` +
              `Subject: ${subject}\n\n` +
              (attachment_link ? `Reference Link: ${attachment_link}\n\n` : '') +
              `Message:\n${message}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; line-height: 1.6;">
            <h2 style="color: #494bd6;">New Contact Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="white-space: pre-wrap;"><strong>Message:</strong><br/>${message}</p>
            ${attachment_link ? `<p><strong>Reference Link:</strong> <a href="${attachment_link}">${attachment_link}</a></p>` : ''}
            <p style="color: #666; font-size: 0.8em; margin-top: 30px;">Sent from your Portfolio System.</p>
          </div>
        `,
        attachments: attachments,
        replyTo: email
      };

      // Send email asynchronously
      transporter.sendMail(mailOptions).catch(mailErr => {
        console.error('Nodemailer Error:', mailErr.message);
      });

      res.status(201).json({ message: 'Message received! I will get back to you soon.' });
    } catch (saveErr) {
      console.error('POST /api/contact error:', saveErr.message);
      res.status(500).json({ error: 'Failed to save contact message' });
    }
  });
});

// GET /api/contact — admin: view all submissions (Secured)
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, full_name, email, subject,
              TO_CHAR(submitted_at, 'YYYY-MM-DD HH24:MI') AS submitted_at
       FROM contacts
       ORDER BY submitted_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/contact error:', err.message);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

module.exports = router;
