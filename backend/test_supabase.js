const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    console.log('✅ Connection Successful');
    const res = await client.query('SELECT NOW()');
    console.log('Current Time from DB:', res.rows[0]);
  } catch (err) {
    console.error('❌ Connection Failed');
    console.error('Code:', err.code);
    console.error('Detail:', err.detail);
    console.error('Full Error:', err);
  } finally {
    await client.end();
  }
}
check();
