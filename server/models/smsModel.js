const pool = require('../config/db');

const SmsModel = {
  async create(data) {
    const { sent_by, class: cls, section, recipients, message } = data;
    const [result] = await pool.execute(
      'INSERT INTO sms_logs (sent_by, class, section, recipients, message, status) VALUES (?, ?, ?, ?, ?, ?)',
      [sent_by, cls || null, section || null, recipients, message, 'Sent']
    );
    return result.insertId;
  },

  async getAll({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM sms_logs');
    const [rows] = await pool.execute(
      'SELECT s.*, u.user_id as sent_by_name FROM sms_logs s LEFT JOIN users u ON s.sent_by = u.id ORDER BY s.sent_at DESC LIMIT ? OFFSET ?',
      [String(limit), String(offset)]
    );
    return { logs: rows, total: countResult[0].total, page, totalPages: Math.ceil(countResult[0].total / limit) };
  },

  async getTotalCount() {
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM sms_logs');
    return rows[0].total;
  }
};

module.exports = SmsModel;
