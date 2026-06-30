const NoticeModel = require('../models/noticeModel');

const noticeController = {
  async getAll(req, res) {
    try {
      const notices = await NoticeModel.getAll();
      res.json({ success: true, notices });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch notices.' });
    }
  },

  async create(req, res) {
    try {
      const { title, content, is_pinned } = req.body;
      if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content are required.' });
      const id = await NoticeModel.create({ title, content, is_pinned, created_by: req.user.id });
      res.status(201).json({ success: true, message: 'Notice created.', id });
    } catch (error) {
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
