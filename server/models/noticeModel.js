const pool = require('../config/db');

const NoticeModel = {
  async getAll() {
    const [rows] = await pool.execute(
      'SELECT n.*, u.user_id as created_by_name FROM notices n LEFT JOIN users u ON n.created_by = u.id ORDER BY n.is_pinned DESC, n.created_at DESC'
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM notices WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { title, content, is_pinned, created_by } = data;
    const [result] = await pool.execute(
      'INSERT INTO notices (title, content, is_pinned, created_by) VALUES (?, ?, ?, ?)',
      [title, content, is_pinned || false, created_by]
    );
    return result.insertId;
  },

  async update(id, data) {
    const { title, content, is_pinned } = data;
    await pool.execute(
      'UPDATE notices SET title=?, content=?, is_pinned=? WHERE id=?',
      [title, content, is_pinned || false, id]
    );
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM notices WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getTotalCount() {
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM notices');
    return rows[0].total;
  }
};

module.exports = NoticeModel;
