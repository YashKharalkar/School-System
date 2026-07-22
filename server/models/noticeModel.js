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
    const { title, content, is_pinned, created_by, target_classes, target_sections, expires_at } = data;
    const [result] = await pool.execute(
      'INSERT INTO notices (title, content, is_pinned, created_by, target_classes, target_sections, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        title,
        content,
        is_pinned || false,
        created_by,
        target_classes || '["Everyone"]',
        target_sections || '["Everyone"]',
        expires_at || null
      ]
    );
    return result.insertId;
  },

  async update(id, data) {
    const { title, content, is_pinned, target_classes, target_sections, expires_at } = data;
    await pool.execute(
      'UPDATE notices SET title=?, content=?, is_pinned=?, target_classes=?, target_sections=?, expires_at=? WHERE id=?',
      [
        title,
        content,
        is_pinned || false,
        target_classes || '["Everyone"]',
        target_sections || '["Everyone"]',
        expires_at || null,
        id
      ]
    );
  },

  async getForStudent(className, sectionName) {
    const [rows] = await pool.execute(
      `SELECT n.*, u.user_id as created_by_name FROM notices n
       LEFT JOIN users u ON n.created_by = u.id
       WHERE n.expires_at IS NULL OR n.expires_at >= NOW()
       ORDER BY n.is_pinned DESC, n.created_at DESC`
    );
    return rows.filter(notice => {
      let classes = [];
      let sections = [];
      try {
        classes = JSON.parse(notice.target_classes || '["Everyone"]');
      } catch (e) {
        classes = ["Everyone"];
      }
      try {
        sections = JSON.parse(notice.target_sections || '["Everyone"]');
      } catch (e) {
        sections = ["Everyone"];
      }
      const matchClass = classes.includes("Everyone") || classes.includes(className);
      const matchSection = sections.includes("Everyone") || sections.includes(sectionName);
      return matchClass && matchSection;
    });
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
