const TimetableModel = require('../models/timetableModel');
const path = require('path');
const fs = require('fs');

const timetableController = {

  async getAll(req, res) {
    try {
      const { class: cls, section } = req.query;
      const timetables = await TimetableModel.getAll({ cls, section });
      res.json({ success: true, timetables });
    } catch (error) {
      console.error('Get timetables error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch timetables.' });
    }
  },

  async upload(req, res) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
      const { class: cls, section, type, effective_from } = req.body;
      if (!cls) return res.status(400).json({ success: false, message: 'Class is required.' });

      const id = await TimetableModel.create({
        class: cls, section, type, file_name: req.file.originalname,
        file_path: req.file.filename, effective_from, uploaded_by: req.user.id
      });
      res.status(201).json({ success: true, message: 'Timetable uploaded.', id });
    } catch (error) {
      console.error('Upload timetable error:', error);
      res.status(500).json({ success: false, message: 'Upload failed.' });
    }
  },

  async download(req, res) {
    try {
      const tt = await TimetableModel.getById(req.params.id);
      if (!tt) return res.status(404).json({ success: false, message: 'Not found.' });
      const filePath = path.join(__dirname, '..', 'uploads', 'timetables', tt.file_path);
      if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found.' });
      res.download(filePath, tt.file_name);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Download failed.' });
    }
  },

  async delete(req, res) {
    try {
      const tt = await TimetableModel.getById(req.params.id);
      if (!tt) return res.status(404).json({ success: false, message: 'Not found.' });
      const filePath = path.join(__dirname, '..', 'uploads', 'timetables', tt.file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await TimetableModel.delete(req.params.id);
      res.json({ success: true, message: 'Timetable deleted.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Delete failed.' });
    }
  }
};

module.exports = timetableController;
