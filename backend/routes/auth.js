const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin');

/**
 * POST /api/auth/verify
 * Frontend sends Firebase ID token, backend verifies and returns user info.
 * Used to validate the admin session securely.
 */
router.post('/verify', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'ID token required' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    res.json({
      uid: decodedToken.uid,
      email: decodedToken.email,
      message: 'Token valid',
    });
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
