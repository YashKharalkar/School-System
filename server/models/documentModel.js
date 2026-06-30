const pool = require('../config/db');

const DocumentModel = {
  async getByStudentId(studentId) {
    const [rows] = await pool.execute(
      'SELECT * FROM documents WHERE student_id = ? ORDER BY created_at DESC', [studentId]
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM documents WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { student_id, document_type, file_name, file_path, file_size, uploaded_by } = data;
    const [result] = await pool.execute(
      'INSERT INTO documents (student_id, document_type, file_name, file_path, file_size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
      [student_id, document_type, file_name, file_path, file_size, uploaded_by]
    );
    return result.insertId;
  },

  async update(id, data) {
    const { file_name, file_path, file_size } = data;
    await pool.execute(
      'UPDATE documents SET file_name=?, file_path=?, file_size=? WHERE id=?',
      [file_name, file_path, file_size, id]
    );
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM documents WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getTotalCount() {
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM documents');
    return rows[0].total;
  }
};

module.exports = DocumentModel;
