const pool = require('../config/db');

const generateAdmissionNo = async () => {
  const year = new Date().getFullYear().toString().slice(-2);
  let admissionNo;
  let exists = true;

  while (exists) {
    const random = Math.floor(1000 + Math.random() * 9000);
    admissionNo = `${year}${random}`;
    const [rows] = await pool.execute(
      'SELECT id FROM students WHERE admission_no = ?',
      [admissionNo]
    );
    exists = rows.length > 0;
  }

  return admissionNo;
};

const generateLoginId = (name, admissionNo) => {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 6);
  return `${cleanName}${admissionNo}`;
};

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

module.exports = { generateAdmissionNo, generateLoginId, formatDate };
