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

    // Create class_fees table
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS class_fees (
          class VARCHAR(20) PRIMARY KEY,
          amount DECIMAL(10,2) NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created class_fees table');
    } catch (e) {
      console.error('❌ Error creating class_fees table:', e.message);
    }

    // Create fee_structures table
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS fee_structures (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          uploaded_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      console.log('✅ Created fee_structures table');
    } catch (e) {
      console.error('❌ Error creating fee_structures table:', e.message);
    }

    // Create admin_tasks table
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS admin_tasks (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'Pending',
          created_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Created admin_tasks table');
    } catch (e) {
      console.error('❌ Error creating admin_tasks table:', e.message);
    }

    // Create certificates_applications table
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS certificates_applications (
          id INT PRIMARY KEY AUTO_INCREMENT,
          student_id INT NOT NULL,
          certificate_type VARCHAR(100) NOT NULL,
          purpose TEXT,
          status VARCHAR(20) DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Created certificates_applications table');
    } catch (e) {
      console.error('❌ Error creating certificates_applications table:', e.message);
    }

    // Create payment_qr_code table
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS payment_qr_code (
          id INT PRIMARY KEY AUTO_INCREMENT,
          file_path VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created payment_qr_code table');
    } catch (e) {
      console.error('❌ Error creating payment_qr_code table:', e.message);
    }

    // Create student_fee_payments table
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS student_fee_payments (
          id INT PRIMARY KEY AUTO_INCREMENT,
          student_id INT NOT NULL,
          upi_transaction_id VARCHAR(100) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          status ENUM('Pending', 'Confirmed') DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Created student_fee_payments table');
    } catch (e) {
      console.error('❌ Error creating student_fee_payments table:', e.message);
    }

    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Failed:', err.message);
  });

module.exports = pool;
