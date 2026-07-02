const pool = require('../config/db');

const applicationController = {
  // GET /api/applications
  async getApplications(req, res) {
    try {
      if (req.user.role === 'admin') {
        const [rows] = await pool.execute(`
          SELECT ca.*, s.name AS student_name, s.admission_no, s.class, s.section, s.gender 
          FROM certificates_applications ca 
          JOIN students s ON ca.student_id = s.id 
          ORDER BY ca.id DESC
        `);
        res.json({ success: true, applications: rows });
      } else {
        // Find student_id
        const [studentRows] = await pool.execute(
          'SELECT id FROM students WHERE user_id = ?',
          [req.user.id]
        );
        if (studentRows.length === 0) {
          return res.status(404).json({ success: false, message: 'Student record not found.' });
        }
        const studentId = studentRows[0].id;

        const [rows] = await pool.execute(
          'SELECT * FROM certificates_applications WHERE student_id = ? ORDER BY id DESC',
          [studentId]
        );
        res.json({ success: true, applications: rows });
      }
    } catch (error) {
      console.error('Fetch applications error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch applications.' });
    }
  },

  // POST /api/applications
  async createApplication(req, res) {
    try {
      const { certificate_type, purpose } = req.body;
      if (!certificate_type) {
        return res.status(400).json({ success: false, message: 'Certificate type is required.' });
      }

      // Find student_id
      const [studentRows] = await pool.execute(
        'SELECT id FROM students WHERE user_id = ?',
        [req.user.id]
      );
      if (studentRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Student record not found.' });
      }
      const studentId = studentRows[0].id;

      const [result] = await pool.execute(
        'INSERT INTO certificates_applications (student_id, certificate_type, purpose) VALUES (?, ?, ?)',
        [studentId, certificate_type, purpose || '']
      );

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully.',
        applicationId: result.insertId
      });
    } catch (error) {
      console.error('Create application error:', error);
      res.status(500).json({ success: false, message: 'Failed to submit application.' });
    }
  },

  // PUT /api/applications/:id/accept
  async acceptApplication(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const [result] = await pool.execute(
        'UPDATE certificates_applications SET status = \'Done\' WHERE id = ?',
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Application request not found.' });
      }

      res.json({ success: true, message: 'Application accepted and processed.' });
    } catch (error) {
      console.error('Accept application error:', error);
      res.status(500).json({ success: false, message: 'Failed to accept application.' });
    }
  }
};

module.exports = applicationController;
