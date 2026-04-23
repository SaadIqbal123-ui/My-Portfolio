const { Pool } = require('pg');
const fs = require('fs');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log('--- Initializing Supabase Cloud Database ---');
  try {
     const schemaPath = path.join(__dirname, '../database/schema_postgres.sql');
     const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
     
     console.log('Connecting to Supabase...');
     await pool.query(schemaSql);
     
     console.log('✅ SUCCESS: Supabase is now fully provisioned with your tables and profile data.');
  } catch(e) {
     console.error('❌ FAILED:', e.message);
  } finally {
     await pool.end();
     process.exit();
  }
}

run();
