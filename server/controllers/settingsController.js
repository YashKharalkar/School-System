const pool = require('../config/db');

const settingsController = {
  // GET /api/settings/academic-year
  async getAcademicYear(req, res) {
    try {
      const [rows] = await pool.execute("SELECT value FROM settings WHERE `key` = 'academic_year'");
      if (rows.length === 0) {
        return res.json({ success: true, academicYear: '2026-27' });
      }
      res.json({ success: true, academicYear: rows[0].value });
    } catch (error) {
      console.error('Get academic year error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch academic year.' });
    }
  },

  // PUT /api/settings/academic-year
  async updateAcademicYear(req, res) {
    try {
      const { academicYear } = req.body;
      if (!academicYear) {
        return res.status(400).json({ success: false, message: 'academicYear parameter is required.' });
      }

      await pool.execute(
        "INSERT INTO settings (`key`, value) VALUES ('academic_year', ?) ON DUPLICATE KEY UPDATE value = ?",
        [academicYear, academicYear]
      );

      res.json({ success: true, message: 'Academic year updated successfully.' });
    } catch (error) {
      console.error('Update academic year error:', error);
      res.status(500).json({ success: false, message: 'Failed to update academic year.' });
    }
  }
};

module.exports = settingsController;
