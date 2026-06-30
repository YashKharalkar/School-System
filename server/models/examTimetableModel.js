const pool = require('../config/db');

const ExamTimetableModel = {
  async getAll({ cls, section }) {
    let query = 'SELECT * FROM exam_timetable WHERE 1=1';
    const params = [];
    if (cls) { query += ' AND class = ?'; params.push(cls); }
    if (section) { query += ' AND section = ?'; params.push(section); }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM exam_timetable WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { class: cls, section, exam_name, file_name, file_path, effective_from, uploaded_by } = data;
    const [result] = await pool.execute(
      'INSERT INTO exam_timetable (class, section, exam_name, file_name, file_path, effective_from, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [cls, section || 'A', exam_name || null, file_name, file_path, effective_from || null, uploaded_by]
    );
    return result.insertId;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM exam_timetable WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = ExamTimetableModel;
