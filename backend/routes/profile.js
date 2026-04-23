const express = require('express');
const router = express.Router();
const { query } = require('../db');
const verifyToken = require('../middleware/verifyToken');

// GET /api/profile — fetch the user profile
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT full_name, email, avatar_url, base_image_url, status, location, bio, cv_url
       FROM profile
       LIMIT 1`
    );
    
    console.log(`Fetched profile. Found: ${result.rows.length} records`);

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
       SET full_name = $1, 
           email = $2, 
           avatar_url = $3, 
           base_image_url = $4, 
           status = $5, 
           location = $6, 
           bio = $7, 
           cv_url = $8
       WHERE id = (SELECT id FROM profile LIMIT 1)`,
      [full_name, email, avatar_url, base_image_url, status, location, bio, cv_url]
    );
    
    console.log('Update Success - Rows Affected:', updateResult.rowCount);
    
    res.json({ message: 'Profile updated successfully', rowCount: updateResult.rowCount });
  } catch (err) {
    console.error('PUT /api/profile error:', err.message);
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
});

module.exports = router;
