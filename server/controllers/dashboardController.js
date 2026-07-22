const pool = require('../config/db');

const dashboardController = {

  async getStats(req, res) {
    try {

      const [totalRows] = await pool.execute('SELECT COUNT(*) AS total FROM students');
      const totalStudents = totalRows[0].total;

      const [classSectionRows] = await pool.execute(
        'SELECT class, section, COUNT(*) AS count FROM students GROUP BY class, section ORDER BY class, section'
      );

      const [feeRows] = await pool.execute(`
        SELECT fp.id, fp.amount, fp.payment_date, s.name, s.admission_no
        FROM fee_payments fp
        JOIN fees f ON fp.fee_id = f.id
        JOIN students s ON f.student_id = s.id
        ORDER BY fp.id DESC LIMIT 5
      `);

      const [smsRows] = await pool.execute(`
        SELECT sl.id, sl.message, sl.sent_at, sl.class, sl.recipients
        FROM sms_logs sl
        ORDER BY sl.id DESC LIMIT 3
      `);

      const [timetableRows] = await pool.execute(`
        SELECT t.id, t.class, t.section, t.file_name, t.type, t.created_at
        FROM timetable t
        ORDER BY t.id DESC LIMIT 3
      `);

      const [noticeRows] = await pool.execute(`
        SELECT n.id, n.title, n.created_at
        FROM notices n
        ORDER BY n.id DESC LIMIT 3
      `);

      res.json({
        success: true,
        totalStudents,
        classSectionCounts: classSectionRows,
        recentFees: feeRows,
        recentSMS: smsRows,
        recentTimetables: timetableRows,
        recentNotices: noticeRows
      });
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch dashboard data.' });
    }
  },

  async getTasks(req, res) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM admin_tasks WHERE created_by = ? ORDER BY id DESC',
        [req.user.id]
      );
      res.json({ success: true, tasks: rows });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch tasks.' });
    }
  },

  async createTask(req, res) {
    try {
      const { title } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Task title is required.' });
      }
      const [result] = await pool.execute(
        'INSERT INTO admin_tasks (title, created_by) VALUES (?, ?)',
        [title.trim(), req.user.id]
      );
      res.status(201).json({
        success: true,
        message: 'Task created.',
        task: { id: result.insertId, title: title.trim(), status: 'Pending', created_by: req.user.id }
      });
    } catch (error) {
      console.error('Failed to create task:', error);
      res.status(500).json({ success: false, message: 'Failed to create task.' });
    }
  },

  async deleteTask(req, res) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM admin_tasks WHERE id = ? AND created_by = ?',
        [req.params.id, req.user.id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
      }
      res.json({ success: true, message: 'Task deleted.' });
    } catch (error) {
      console.error('Failed to delete task:', error);
      res.status(500).json({ success: false, message: 'Failed to delete task.' });
    }
  }
};

module.exports = dashboardController;
