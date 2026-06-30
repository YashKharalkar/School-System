const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const CLASSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

const FIRST_NAMES_MALE = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Rohan', 'Kartik', 'Dhruv', 'Arnav', 'Kabir', 'Rishi', 'Yash', 'Harsh', 'Pranav', 'Dev'];
const FIRST_NAMES_FEMALE = ['Diya', 'Ananya', 'Myra', 'Sara', 'Aadhya', 'Isha', 'Kavya', 'Riya', 'Priya', 'Neha', 'Sanya', 'Tanvi', 'Pooja', 'Shreya', 'Anika', 'Nisha', 'Meera', 'Kiara', 'Tara', 'Jiya'];
const LAST_NAMES = ['Sharma', 'Patel', 'Singh', 'Verma', 'Gupta', 'Jain', 'Reddy', 'Kumar', 'Rao', 'Mishra', 'Pandey', 'Chauhan', 'Iyer', 'Nair', 'Das', 'Mehta', 'Shah', 'Thakur', 'Yadav', 'Saxena'];
const FATHER_NAMES = ['Rajesh', 'Suresh', 'Mahesh', 'Ramesh', 'Ganesh', 'Anil', 'Sunil', 'Vijay', 'Sanjay', 'Ajay', 'Deepak', 'Prakash', 'Mohan', 'Rakesh', 'Naresh', 'Dinesh', 'Mukesh', 'Harish', 'Satish', 'Manish'];
const MOTHER_NAMES = ['Sunita', 'Anita', 'Rekha', 'Kavita', 'Savita', 'Meena', 'Suman', 'Geeta', 'Seema', 'Neelam', 'Poonam', 'Asha', 'Usha', 'Lata', 'Radha', 'Saroj', 'Kiran', 'Shanti', 'Vijaya', 'Padma'];
const AREAS = ['Kodamendhi', 'Sathupalli', 'Khammam', 'Wyra', 'Madhira', 'Kothagudem', 'Bhadrachalam', 'Palvancha', 'Yellandu', 'Manuguru'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDOB(classNum) {
  const currentYear = 2026;
  const age = classNum + 5 + Math.floor(Math.random() * 2);
  const year = currentYear - age;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function randomMobile() {
  const prefixes = ['98', '97', '96', '95', '94', '93', '91', '90', '89', '88'];
  return randomFrom(prefixes) + String(Math.floor(10000000 + Math.random() * 90000000));
}

async function seed() {
  let connection;
  try {
    // Connect without database first to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('📦 Creating database and tables...');

    // Read and execute schema
    const fs = require('fs');
    const schema = fs.readFileSync(require('path').join(__dirname, '..', '..', 'database', 'schema.sql'), 'utf8');
    await connection.query(schema);
    await connection.end();

    // Reconnect with database selected
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Clear existing data
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('TRUNCATE TABLE students');
    await connection.execute('TRUNCATE TABLE users');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const [adminResult] = await connection.execute(
      'INSERT INTO users (user_id, password, role) VALUES (?, ?, ?)',
      ['admin', adminPassword, 'admin']
    );
    console.log('✅ Admin user created (user_id: admin, password: admin123)');

    // Generate students
    const usedAdmissions = new Set();
    let totalStudents = 0;

    for (const cls of CLASSES) {
      const classNum = parseInt(cls);
      const count = 15;

      for (let i = 0; i < count; i++) {
        const gender = Math.random() > 0.5 ? 'Male' : 'Female';
        const firstName = gender === 'Male' ? randomFrom(FIRST_NAMES_MALE) : randomFrom(FIRST_NAMES_FEMALE);
        const lastName = randomFrom(LAST_NAMES);
        const name = `${firstName} ${lastName}`;

        // Generate unique admission number
        let admissionNo;
        do {
          const rand = Math.floor(1000 + Math.random() * 9000);
          admissionNo = `26${rand}`;
        } while (usedAdmissions.has(admissionNo));
        usedAdmissions.add(admissionNo);

        const loginId = `${firstName.toLowerCase()}${admissionNo}`;
        const rawPassword = `student@${admissionNo}`;
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Create user
        const [userResult] = await connection.execute(
          'INSERT INTO users (user_id, password, role) VALUES (?, ?, ?)',
          [loginId, hashedPassword, 'student']
        );

        // Create student
        const dob = randomDOB(classNum);
        const fatherName = `${randomFrom(FATHER_NAMES)} ${lastName}`;
        const motherName = `${randomFrom(MOTHER_NAMES)} ${lastName}`;
        const mobile = randomMobile();
        const address = `${Math.floor(1 + Math.random() * 500)}, ${randomFrom(AREAS)}, Telangana`;

        await connection.execute(
          `INSERT INTO students (user_id, admission_no, name, father_name, mother_name, dob, gender, parent_mobile, address, class, section) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userResult.insertId, admissionNo, name, fatherName, motherName, dob, gender, mobile, address, cls, 'A']
        );

        totalStudents++;
      }
      console.log(`  📝 Class ${cls}: ${count} students created`);
    }

    console.log(`\n✅ Seeding complete! ${totalStudents} students created.`);
    console.log('\n📋 Login Credentials:');
    console.log('  Admin: user_id=admin, password=admin123');
    console.log('  Students: user_id=<firstname><admissionno>, password=student@<admissionno>');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

seed();
