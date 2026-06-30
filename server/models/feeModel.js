const pool = require('../config/db');

const FeeModel = {
  async getByStudentId(studentId) {
    const [rows] = await pool.execute('SELECT * FROM fees WHERE student_id = ?', [studentId]);
    return rows[0] || null;
  },

  async createOrUpdate(data) {
    const { student_id, total_fee, paid_amount, academic_year } = data;
    const existing = await this.getByStudentId(student_id);
    if (existing) {
      await pool.execute(
        'UPDATE fees SET total_fee=?, paid_amount=?, academic_year=? WHERE id=?',
        [total_fee, paid_amount, academic_year, existing.id]
      );
      return existing.id;
    } else {
      const [result] = await pool.execute(
        'INSERT INTO fees (student_id, total_fee, paid_amount, academic_year) VALUES (?, ?, ?, ?)',
        [student_id, total_fee, paid_amount || 0, academic_year]
      );
      return result.insertId;
    }
  },

  async addPayment(data) {
    const { fee_id, amount, payment_date, payment_method, receipt_no, remarks } = data;
    const [result] = await pool.execute(
      'INSERT INTO fee_payments (fee_id, amount, payment_date, payment_method, receipt_no, remarks) VALUES (?, ?, ?, ?, ?, ?)',
      [fee_id, amount, payment_date, payment_method || null, receipt_no || null, remarks || null]
    );
    // Update paid amount in fees table
    await pool.execute(
      'UPDATE fees SET paid_amount = paid_amount + ? WHERE id = ?',
      [amount, fee_id]
    );
    return result.insertId;
  },

  async getPayments(feeId) {
    const [rows] = await pool.execute(
      'SELECT * FROM fee_payments WHERE fee_id = ? ORDER BY payment_date DESC', [feeId]
    );
    return rows;
  },

  async getAllWithStudents({ cls, search }) {
    let query = `SELECT f.*, s.name, s.admission_no, s.class, s.section 
                 FROM fees f JOIN students s ON f.student_id = s.id WHERE 1=1`;
    const params = [];
    if (cls && cls !== 'All Classes') { query += ' AND s.class = ?'; params.push(cls); }
    if (search) { query += ' AND (s.name LIKE ? OR s.admission_no LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY s.class, s.name';
    const [rows] = await pool.execute(query, params);
    return rows;
  }
};

module.exports = FeeModel;
