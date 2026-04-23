const express = require('express');
const router = express.Router();
const { query } = require('../db');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const verifyToken = require('../middleware/verifyToken');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

// Upload image buffer to Cloudinary
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'portfolio' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// GET /api/projects — fetch all projects
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, description, category, tags, image_url, live_url, github_url,
              to_char(created_at, 'YYYY-MM-DD') AS created_at
       FROM projects
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/projects error:', err.message);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id — fetch single project
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, description, category, tags, image_url, live_url, github_url,
              to_char(created_at, 'YYYY-MM-DD') AS created_at
       FROM projects WHERE id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /api/projects/:id error:', err.message);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects — create project (with optional image) [PROTECTED]
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, tags, live_url, github_url } = req.body;
    let image_url = req.body.image_url || null;

    if (req.file) {
      image_url = await uploadToCloudinary(req.file.buffer);
    }

    console.log('Received project data for Postgres:', req.body);
    await query(
      `INSERT INTO projects (title, description, category, tags, image_url, live_url, github_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [title, description, category, tags, image_url, live_url, github_url]
    );
    res.status(201).json({ message: 'Project created successfully' });
  } catch (err) {
    console.error('POST /api/projects error detail:', err);
    res.status(500).json({ error: `Database Error: ${err.message}` });
  }
});

// PUT /api/projects/:id — update project [PROTECTED]
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, tags, live_url } = req.body;
    let image_url = req.body.image_url;

    if (req.file) {
      image_url = await uploadToCloudinary(req.file.buffer);
    }

    await query(
      `UPDATE projects
       SET title = $1, description = $2, category = $3,
           tags = $4, image_url = COALESCE($5, image_url), live_url = $6
       WHERE id = $7`,
      [title, description, category, tags, image_url, live_url, req.params.id]
    );
    res.json({ message: 'Project updated successfully' });
  } catch (err) {
    console.error('PUT /api/projects/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id — delete project [PROTECTED]
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/projects/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
