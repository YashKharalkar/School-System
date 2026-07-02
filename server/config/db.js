const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection
pool.getConnection()
  .then(async connection => {
    console.log('✅ MySQL Connected Successfully');
    
    // Check and add notices columns
    try {
      await connection.query('ALTER TABLE notices ADD COLUMN target_classes VARCHAR(500) DEFAULT \'["Everyone"]\'');
      console.log('✅ Added target_classes to notices');
    } catch (e) {
      // Column might already exist
    }
    
    try {
      await connection.query('ALTER TABLE notices ADD COLUMN target_sections VARCHAR(500) DEFAULT \'["Everyone"]\'');
      console.log('✅ Added target_sections to notices');
    } catch (e) {
      // Column might already exist
    }

    try {
      await connection.query('ALTER TABLE notices ADD COLUMN expires_at DATETIME DEFAULT NULL');
      console.log('✅ Added expires_at to notices');
    } catch (e) {
      // Column might already exist
    }

    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Failed:', err.message);
  });

module.exports = pool;
