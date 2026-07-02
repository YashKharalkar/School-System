const pool = require('../config/db');

const FeeModel = {
  async getByStudentId(studentId) {
    const [rows] = await pool.execute(
      `SELECT s.id AS student_id, s.name, s.admission_no, s.class, s.section,
              COALESCE(cf.amount, 0) AS total_fee,
              COALESCE(f.paid_amount, 0) AS paid_amount,
              COALESCE(f.academic_year, '2026-27') AS academic_year,
              f.id AS id
       FROM students s
       LEFT JOIN class_fees cf ON s.class = cf.class
       LEFT JOIN fees f ON s.id = f.student_id
       WHERE s.id = ?`,
      [studentId]
    );
    return rows[0] || null;
  },

  async createOrUpdate(data) {
    const { student_id, total_fee, paid_amount, academic_year } = data;
    const existing = await pool.execute('SELECT id FROM fees WHERE student_id = ?', [student_id]);
    if (existing[0].length > 0) {
      await pool.execute(
        'UPDATE fees SET total_fee=?, paid_amount=?, academic_year=? WHERE student_id=?',
        [total_fee, paid_amount, academic_year, student_id]
      );
      return existing[0][0].id;
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

  async getAllWithStudents({ cls, name, admission_no, section, gender, search }) {
    let query = `SELECT s.id AS student_id, s.name, s.admission_no, s.class, s.section,
                        COALESCE(cf.amount, 0) AS total_fee,
                        COALESCE(f.paid_amount, 0) AS paid_amount,
                        (COALESCE(cf.amount, 0) - COALESCE(f.paid_amount, 0)) AS balance,
                        COALESCE(f.academic_year, '2026-27') AS academic_year,
                        f.id AS id
                 FROM students s
                 LEFT JOIN class_fees cf ON s.class = cf.class
                 LEFT JOIN fees f ON s.id = f.student_id
                 WHERE 1=1`;
    const params = [];
    if (cls && cls !== 'All Classes' && cls !== 'All') {
      query += ' AND s.class = ?';
      params.push(cls);
    }
    if (section && section !== 'Everyone' && section !== 'All') {
      query += ' AND s.section = ?';
      params.push(section);
    }
    if (gender && gender !== 'Everyone') {
      query += ' AND s.gender = ?';
      params.push(gender);
    }
    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (admission_no) {
      query += ' AND s.admission_no LIKE ?';
      params.push(`%${admission_no}%`);
    }
    if (search) {
      query += ' AND (s.name LIKE ? OR s.admission_no LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY s.class, s.name';
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  // Global class fees management
  async getClassFees() {
    const [rows] = await pool.execute('SELECT * FROM class_fees');
    return rows;
  },

  async setClassFee(cls, amount) {
    const [existing] = await pool.execute('SELECT * FROM class_fees WHERE class = ?', [cls]);
    if (existing.length > 0) {
      const [result] = await pool.execute(
        'UPDATE class_fees SET amount = ? WHERE class = ?',
        [amount, cls]
      );
      return result.affectedRows > 0;
    } else {
      const [result] = await pool.execute(
        'INSERT INTO class_fees (class, amount) VALUES (?, ?)',
        [cls, amount]
      );
      return result.insertId;
    }
  },

  // Student paid fee direct updates
  async updatePaidAmount(studentId, paidAmount) {
    const [existing] = await pool.execute('SELECT id, paid_amount FROM fees WHERE student_id = ?', [studentId]);
    if (existing.length > 0) {
      const oldPaid = Number(existing[0].paid_amount || 0);
      const diff = paidAmount - oldPaid;
      const [result] = await pool.execute(
        'UPDATE fees SET paid_amount = ? WHERE student_id = ?',
        [paidAmount, studentId]
      );
      if (diff > 0) {
        await pool.execute(
          'INSERT INTO fee_payments (fee_id, amount, payment_date, payment_method, receipt_no, remarks) VALUES (?, ?, ?, ?, ?, ?)',
          [existing[0].id, diff, new Date().toISOString().split('T')[0], 'Cash', `REC-${Date.now().toString().slice(-6)}`, 'Admin Update']
        );
      }
      return result.affectedRows > 0;
    } else {
      // Find student class to set appropriate total_fee from class_fees
      const [student] = await pool.execute('SELECT class FROM students WHERE id = ?', [studentId]);
      const cls = student[0]?.class || '';
      const [classFee] = await pool.execute('SELECT amount FROM class_fees WHERE class = ?', [cls]);
      const totalFee = classFee[0]?.amount || 0;
      const [result] = await pool.execute(
        'INSERT INTO fees (student_id, total_fee, paid_amount, academic_year) VALUES (?, ?, ?, ?)',
        [studentId, totalFee, paidAmount, '2026-27']
      );
      const feeId = result.insertId;
      if (paidAmount > 0) {
        await pool.execute(
          'INSERT INTO fee_payments (fee_id, amount, payment_date, payment_method, receipt_no, remarks) VALUES (?, ?, ?, ?, ?, ?)',
          [feeId, paidAmount, new Date().toISOString().split('T')[0], 'Cash', `REC-${Date.now().toString().slice(-6)}`, 'Admin Update']
        );
      }
      return feeId;
    }
  },

  // Fee structures document uploads management
  async getStructures() {
    const [rows] = await pool.execute('SELECT * FROM fee_structures ORDER BY created_at DESC');
    return rows;
  },

  async getStructureById(id) {
    const [rows] = await pool.execute('SELECT * FROM fee_structures WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async createStructure({ name, file_name, file_path, uploaded_by }) {
    const [result] = await pool.execute(
      'INSERT INTO fee_structures (name, file_name, file_path, uploaded_by) VALUES (?, ?, ?, ?)',
      [name, file_name, file_path, uploaded_by]
    );
    return result.insertId;
  },

  async renameStructure(id, newName) {
    const [result] = await pool.execute('UPDATE fee_structures SET name = ? WHERE id = ?', [newName, id]);
    return result.affectedRows > 0;
  },

  async deleteStructure(id) {
    const [result] = await pool.execute('DELETE FROM fee_structures WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = FeeModel;
