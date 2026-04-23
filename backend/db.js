const { Pool } = require('pg');
require('dotenv').config();

let pool;

// Initialize connection pool
async function initPool() {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // REQUIRED for Supabase
      },
    });

    // Test connection
    const client = await pool.connect();
    console.log('--- DB Handshake Successful ---');
    client.release();

  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    throw err;
  }
}

// Query helper
const query = (text, params) => {
  if (!pool) {
    throw new Error('Pool not initialized. Call initPool first.');
  }
  return pool.query(text, params);
};

module.exports = {
  initPool,
  query,
};