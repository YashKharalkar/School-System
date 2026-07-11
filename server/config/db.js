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

    // Add dob column to users table for admin profile
    try {
      await connection.query('ALTER TABLE users ADD COLUMN dob DATE DEFAULT NULL');
      console.log('✅ Added dob column to users');
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

    // Run migration for detailed student profile columns and payment status enum
    try {
      const studentCols = [
        { name: 'roll_no', type: 'VARCHAR(20) DEFAULT NULL' },
        { name: 'blood_group', type: 'VARCHAR(10) DEFAULT NULL' },
        { name: 'aadhaar_no', type: 'VARCHAR(20) DEFAULT NULL' },
        { name: 'birth_reg_no', type: 'VARCHAR(50) DEFAULT NULL' },
        { name: 'nationality', type: 'VARCHAR(50) DEFAULT NULL' },
        { name: 'religion', type: 'VARCHAR(50) DEFAULT NULL' },
        { name: 'caste', type: 'VARCHAR(50) DEFAULT NULL' },
        { name: 'category', type: 'VARCHAR(20) DEFAULT NULL' },
        { name: 'mother_tongue', type: 'VARCHAR(50) DEFAULT NULL' },
        { name: 'mobile_no', type: 'VARCHAR(15) DEFAULT NULL' },
        { name: 'alt_mobile_no', type: 'VARCHAR(15) DEFAULT NULL' },
        { name: 'email_id', type: 'VARCHAR(100) DEFAULT NULL' },
        { name: 'current_address', type: 'TEXT DEFAULT NULL' },
        { name: 'permanent_address', type: 'TEXT DEFAULT NULL' },
        { name: 'city', type: 'VARCHAR(50) DEFAULT NULL' },
        { name: 'district', type: 'VARCHAR(50) DEFAULT NULL' },
        { name: 'state', type: 'VARCHAR(50) DEFAULT NULL' },
        { name: 'pin_code', type: 'VARCHAR(10) DEFAULT NULL' },
        { name: 'father_occupation', type: 'VARCHAR(100) DEFAULT NULL' },
        { name: 'father_qualification', type: 'VARCHAR(100) DEFAULT NULL' },
        { name: 'father_mobile', type: 'VARCHAR(15) DEFAULT NULL' },
        { name: 'father_email', type: 'VARCHAR(100) DEFAULT NULL' },
        { name: 'father_aadhaar', type: 'VARCHAR(20) DEFAULT NULL' },
        { name: 'mother_occupation', type: 'VARCHAR(100) DEFAULT NULL' },
        { name: 'mother_qualification', type: 'VARCHAR(100) DEFAULT NULL' },
        { name: 'mother_mobile', type: 'VARCHAR(15) DEFAULT NULL' },
        { name: 'mother_email', type: 'VARCHAR(100) DEFAULT NULL' },
        { name: 'mother_aadhaar', type: 'VARCHAR(20) DEFAULT NULL' },
        { name: 'guardian_name', type: 'VARCHAR(100) DEFAULT NULL' },
        { name: 'guardian_relationship', type: 'VARCHAR(50) DEFAULT NULL' },
        { name: 'guardian_mobile', type: 'VARCHAR(15) DEFAULT NULL' },
        { name: 'guardian_address', type: 'TEXT DEFAULT NULL' },
        { name: 'admission_date', type: 'DATE DEFAULT NULL' },
        { name: 'admission_class', type: 'VARCHAR(10) DEFAULT NULL' },
        { name: 'house', type: 'VARCHAR(50) DEFAULT NULL' },
        { name: 'prev_school_name', type: 'VARCHAR(150) DEFAULT NULL' },
        { name: 'prev_school_address', type: 'TEXT DEFAULT NULL' },
        { name: 'udise_no', type: 'VARCHAR(30) DEFAULT NULL' },
        { name: 'medium_of_instruction', type: 'VARCHAR(50) DEFAULT NULL' },
        { name: 'signature_path', type: 'VARCHAR(255) DEFAULT NULL' },
        { name: 'id_mark_1', type: 'VARCHAR(150) DEFAULT NULL' },
        { name: 'id_mark_2', type: 'VARCHAR(150) DEFAULT NULL' },
        { name: 'allergies', type: 'TEXT DEFAULT NULL' },
        { name: 'medical_conditions', type: 'TEXT DEFAULT NULL' },
        { name: 'disability', type: 'VARCHAR(150) DEFAULT NULL' },
        { name: 'emergency_contact_person', type: 'VARCHAR(100) DEFAULT NULL' },
        { name: 'emergency_contact_no', type: 'VARCHAR(15) DEFAULT NULL' }
      ];

      for (const col of studentCols) {
        try {
          const [exists] = await connection.query(`SHOW COLUMNS FROM students LIKE '${col.name}'`);
          if (exists.length === 0) {
            await connection.query(`ALTER TABLE students ADD COLUMN ${col.name} ${col.type}`);
            console.log(`✅ Added column ${col.name} to students`);
          }
        } catch (colErr) {
          console.error(`❌ Error adding column ${col.name}:`, colErr.message);
        }
      }

      // Modify student_fee_payments status column enum
      try {
        await connection.query(`ALTER TABLE student_fee_payments MODIFY COLUMN status ENUM('Pending', 'Confirmed', 'Denied') DEFAULT 'Pending'`);
        console.log('✅ Updated status ENUM in student_fee_payments');
      } catch (enumErr) {
        console.error('❌ Error modifying student_fee_payments status ENUM:', enumErr.message);
      }

      // Create settings table
      try {
        await connection.query(`
          CREATE TABLE IF NOT EXISTS settings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            \`key\` VARCHAR(100) UNIQUE NOT NULL,
            value TEXT NOT NULL
          )
        `);
        console.log('✅ Created settings table');
        
        // Seed default academic year
        await connection.query(`
          INSERT IGNORE INTO settings (\`key\`, value) VALUES ('academic_year', '2026-27')
        `);
        console.log('✅ Seeded academic_year setting');
      } catch (settingsErr) {
        console.error('❌ Error creating/seeding settings table:', settingsErr.message);
      }

      // Add status and status_academic_year columns to students
      try {
        const [existsStatus] = await connection.query("SHOW COLUMNS FROM students LIKE 'status'");
        if (existsStatus.length === 0) {
          await connection.query("ALTER TABLE students ADD COLUMN status ENUM('Active', 'Left', 'Past 10th', 'Past 12th') NOT NULL DEFAULT 'Active'");
          console.log("✅ Added status column to students");
        }
      } catch (statusErr) {
        console.error("❌ Error adding status column to students:", statusErr.message);
      }

      try {
        const [existsYear] = await connection.query("SHOW COLUMNS FROM students LIKE 'status_academic_year'");
        if (existsYear.length === 0) {
          await connection.query("ALTER TABLE students ADD COLUMN status_academic_year VARCHAR(20) DEFAULT NULL");
          console.log("✅ Added status_academic_year column to students");
        }
      } catch (yearErr) {
        console.error("❌ Error adding status_academic_year column to students:", yearErr.message);
      }
    } catch (migErr) {
      console.error('❌ Migration failed:', migErr.message);
    }

    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Failed:', err.message);
  });

module.exports = pool;
