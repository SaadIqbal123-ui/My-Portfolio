require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initPool } = require('./db');

const projectsRouter = require('./routes/projects');
const contactRouter = require('./routes/contact');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/projects', projectsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server after DB pool is ready (Graceful start)
initPool()
  .then(() => {
    console.log('✅ Oracle DB Connection Pool Initialized');
  })
  .catch((err) => {
    console.error('❌ CRITICAL: Oracle DB Connection Failed:', err.message);
    console.error('The server will continue to run, but DB features will be unavailable.');
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  });
