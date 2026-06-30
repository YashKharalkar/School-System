const pool = require('../config/db');

const AttendanceModel = {
  async markBulk(records) {
    const values = records.map(r => [r.student_id, r.date, r.status, r.marked_by]);
    for (const v of values) {
      await pool.execute(
        `INSERT INTO attendance (student_id, date, status, marked_by) VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by)`,
        v
      );
    }
    return true;
  },

  async getByStudentAndMonth(studentId, year, month) {
    const [rows] = await pool.execute(
      'SELECT * FROM attendance WHERE student_id = ? AND YEAR(date) = ? AND MONTH(date) = ? ORDER BY date',
      [studentId, year, month]
    );
    return rows;
  },

  async getByClassAndDate(cls, section, date) {
    const [rows] = await pool.execute(
      `SELECT a.*, s.name, s.admission_no FROM attendance a 
       JOIN students s ON a.student_id = s.id 
       WHERE s.class = ? AND s.section = ? AND a.date = ? ORDER BY s.name`,
      [cls, section, date]
    );
    return rows;
  },

  async getStudentSummary(studentId) {
    const [rows] = await pool.execute(
      `SELECT status, COUNT(*) as count FROM attendance WHERE student_id = ? GROUP BY status`,
      [studentId]
    );
    return rows;
  },

  async getByStudent(studentId) {
    const [rows] = await pool.execute(
      'SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 60',
      [studentId]
    );
    return rows;
  }
};

module.exports = AttendanceModel;
