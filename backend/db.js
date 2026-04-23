const oracledb = require('oracledb');
require('dotenv').config();

// Use Thin mode — no Oracle Client needed
oracledb.initOracleClient = undefined;

// Fetch CLOBs as strings to avoid circular JSON structure errors
oracledb.fetchAsString = [oracledb.CLOB];

let pool;

async function initPool() {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log('✅ Oracle DB connection pool created');
  } catch (err) {
    console.error('❌ Failed to create Oracle DB pool:', err.message);
    // Do not exit process, allow server to start for UI preview
  }
}

async function query(sql, binds = [], opts = {}) {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...opts,
    });
    return result;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { initPool, query };
