const AttendanceModel = require('../models/attendanceModel');
const StudentModel = require('../models/studentModel');

const attendanceController = {

  async mark(req, res) {
    try {
      const { date, records } = req.body;
      if (!date || !records || records.length === 0) {
        return res.status(400).json({ success: false, message: 'Date and attendance records are required.' });
      }
      const formatted = records.map(r => ({
        student_id: r.student_id, date, status: r.status, marked_by: req.user.id
      }));
      await AttendanceModel.markBulk(formatted);
      res.json({ success: true, message: `Attendance marked for ${records.length} students.` });
    } catch (error) {
      console.error('Mark attendance error:', error);
      res.status(500).json({ success: false, message: 'Failed to mark attendance.' });
    }
  },

  async getByClass(req, res) {
    try {
      const { class: cls, section = 'A', date } = req.query;
      if (!cls || !date) return res.status(400).json({ success: false, message: 'Class and date are required.' });

      const result = await StudentModel.getAll({ className: cls, page: 1, limit: 100 });
      const attendance = await AttendanceModel.getByClassAndDate(cls, section, date);
      const attendanceMap = {};
      attendance.forEach(a => { attendanceMap[a.student_id] = a.status; });

      const studentsWithAttendance = result.students.map(s => ({
        ...s, attendance_status: attendanceMap[s.id] || null
      }));

      res.json({ success: true, students: studentsWithAttendance, date });
    } catch (error) {
      console.error('Get class attendance error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch attendance.' });
    }
  },

  async getByStudent(req, res) {
    try {
      const records = await AttendanceModel.getByStudent(req.params.studentId);
      const summary = await AttendanceModel.getStudentSummary(req.params.studentId);
      res.json({ success: true, records, summary });
    } catch (error) {
      console.error('Get student attendance error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch attendance.' });
    }
  }
};

module.exports = attendanceController;
