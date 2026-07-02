const NoticeModel = require('../models/noticeModel');
const StudentModel = require('../models/studentModel');

const noticeController = {
  async getAll(req, res) {
    try {
      let notices;
      if (req.user.role === 'student') {
        const student = await StudentModel.getByUserId(req.user.id);
        if (student) {
          notices = await NoticeModel.getForStudent(student.class, student.section);
        } else {
          notices = [];
        }
      } else {
        notices = await NoticeModel.getAll();
      }
      res.json({ success: true, notices });
    } catch (error) {
      console.error('Get notices error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch notices.' });
    }
  },

  async create(req, res) {
    try {
      const { title, content, is_pinned, target_classes, target_sections, duration_days } = req.body;
      if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content are required.' });
      
      let expires_at = null;
      if (duration_days) {
        const days = Number(duration_days);
        if (!isNaN(days) && days > 0) {
          const date = new Date();
          date.setDate(date.getDate() + days);
          expires_at = date.toISOString().slice(0, 19).replace('T', ' ');
        }
      }

      const id = await NoticeModel.create({
        title,
        content,
        is_pinned: is_pinned || false,
        created_by: req.user.id,
        target_classes: target_classes ? JSON.stringify(target_classes) : null,
        target_sections: target_sections ? JSON.stringify(target_sections) : null,
        expires_at
      });
      res.status(201).json({ success: true, message: 'Notice created.', id });
    } catch (error) {
      console.error('Create notice error:', error);
      res.status(500).json({ success: false, message: 'Failed to create notice.' });
    }
  },

  async update(req, res) {
    try {
      const { title, content, is_pinned } = req.body;
      const notice = await NoticeModel.getById(req.params.id);
      if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });
      await NoticeModel.update(req.params.id, { title, content, is_pinned });
      res.json({ success: true, message: 'Notice updated.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update notice.' });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await NoticeModel.delete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Notice not found.' });
      res.json({ success: true, message: 'Notice deleted.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete notice.' });
    }
  }
};

module.exports = noticeController;
