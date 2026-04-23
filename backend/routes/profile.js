const express = require('express');
const router = express.Router();
const { query } = require('../db');
const verifyToken = require('../middleware/verifyToken');

// GET /api/profile — fetch the user profile
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT FULL_NAME, EMAIL, AVATAR_URL, BASE_IMAGE_URL, STATUS, LOCATION, BIO, CV_URL
       FROM profile
       FETCH FIRST 1 ROWS ONLY`
    );
    
    // Log for debugging
    console.log(`Fetched profile. Total rows in table: ${result.rows.length}`);

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /api/profile error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch profile', 
      details: String(err.message || err) 
    });
  }
});

// PUT /api/profile — update profile (admin only)
router.put('/', verifyToken, async (req, res) => {
  try {
    const { full_name, email, avatar_url, base_image_url, status, location, bio, cv_url } = req.body;
    console.log('Incoming profile update request:', req.body);
    
    const updateResult = await query(
      `UPDATE profile
       SET FULL_NAME = :full_name, 
           EMAIL = :email, 
           AVATAR_URL = :avatar_url,
           BASE_IMAGE_URL = :base_image_url, 
           STATUS = :status, 
           LOCATION = :location, 
           BIO = :bio, 
           CV_URL = :cv_url
       WHERE ROWID IN (SELECT ROWID FROM profile FETCH FIRST 1 ROWS ONLY)`,
      { full_name, email, avatar_url, base_image_url, status, location, bio, cv_url }
    );
    
    console.log('Update Success - Rows Affected:', updateResult.rowsAffected);
    
    res.json({ message: 'Profile updated successfully', rowsAffected: updateResult.rowsAffected });
  } catch (err) {
    console.error('PUT /api/profile error:', err.message);
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
});

module.exports = router;
