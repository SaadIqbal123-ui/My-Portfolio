const { initPool, query } = require('./db');

async function checkDatabase() {
  console.log('🔍 Starting Database Diagnosis...');
  
  try {
    await initPool();
    
    // 1. Check if tables exist
    console.log('\n--- Checking Tables ---');
    const tableResult = await query(`
      SELECT table_name 
      FROM user_tables 
      WHERE table_name IN ('PROFILE', 'PROJECTS', 'ADMINS', 'CONTACTS')
    `);
    
    const tables = tableResult.rows.map(r => r.TABLE_NAME);
    console.log('Found tables:', tables.length ? tables.join(', ') : 'NONE');
    
    if (!tables.includes('PROFILE')) {
      console.error('❌ ERROR: PROFILE table is missing! Did you run Portfolio.sql?');
    } else {
      // 2. Check row count in PROFILE
      const countResult = await query('SELECT COUNT(*) as count FROM profile');
      const count = countResult.rows[0].COUNT;
      console.log('Records in PROFILE table:', count);
      
      if (count === 0) {
        console.warn('⚠️ WARNING: PROFILE table is empty. You need to run the INSERT statement.');
      } else {
        // 3. Try a sample fetch
        const sample = await query('SELECT * FROM profile FETCH FIRST 1 ROWS ONLY');
        console.log('Sample Record Keys:', Object.keys(sample.rows[0]));
      }
    }

    console.log('\n--- Diagnosis Complete ---');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ DIAGNOSIS FAILED:', err.message);
    process.exit(1);
  }
}

checkDatabase();
