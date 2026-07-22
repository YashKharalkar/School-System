const pool = require('../config/db');

const UserModel = {

  async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, user_id, role, photo_path, dob, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async updatePhotoPath(id, photoPath) {
    await pool.execute(
      'UPDATE users SET photo_path = ? WHERE id = ?',
      [photoPath, id]
    );
  },

  async findByIdWithPassword(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create(userData) {
    const { user_id, password, role } = userData;
    const [result] = await pool.execute(
      'INSERT INTO users (user_id, password, role) VALUES (?, ?, ?)',
      [user_id, password, role || 'student']
    );
    return result.insertId;
  },

  async delete(id) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async updatePassword(id, hashedPassword) {
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
  }
};

module.exports = UserModel;
