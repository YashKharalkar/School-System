const DocumentModel = require('../models/documentModel');
const StudentModel = require('../models/studentModel');
const path = require('path');
const fs = require('fs');

const documentController = {

  async getByStudent(req, res) {
    try {
      if (req.user.role === 'student') {
        const student = await StudentModel.getByUserId(req.user.id);
        if (!student || student.id.toString() !== req.params.studentId.toString()) {
          return res.status(403).json({ success: false, message: 'Access denied.' });
        }
      }
      const docs = await DocumentModel.getByStudentId(req.params.studentId);
      res.json({ success: true, documents: docs });
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch documents.' });
    }
  },

  async upload(req, res) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
      const { document_type } = req.body;
      if (!document_type) return res.status(400).json({ success: false, message: 'Document type is required.' });

      if (req.user.role === 'student') {
        const student = await StudentModel.getByUserId(req.user.id);
        if (!student || student.id.toString() !== req.params.studentId.toString()) {
          return res.status(403).json({ success: false, message: 'Access denied.' });
        }
      } else {
        const student = await StudentModel.getById(req.params.studentId);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      const docId = await DocumentModel.create({
        student_id: req.params.studentId,
        document_type,
        file_name: req.file.originalname,
        file_path: req.file.filename,
        file_size: req.file.size,
        uploaded_by: req.user.id
      });

      res.status(201).json({ success: true, message: 'Document uploaded.', id: docId });
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({ success: false, message: 'Upload failed.' });
    }
  },

  async replace(req, res) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
      const doc = await DocumentModel.getById(req.params.id);
      if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

      const oldPath = path.join(__dirname, '..', 'uploads', 'documents', doc.file_path);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      await DocumentModel.update(req.params.id, {
        file_name: req.file.originalname,
        file_path: req.file.filename,
        file_size: req.file.size
      });

      res.json({ success: true, message: 'Document replaced.' });
    } catch (error) {
      console.error('Replace document error:', error);
      res.status(500).json({ success: false, message: 'Replace failed.' });
    }
  },

  async download(req, res) {
    try {
      const doc = await DocumentModel.getById(req.params.id);
      if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

      if (req.user.role === 'student') {
        const student = await StudentModel.getByUserId(req.user.id);
        if (!student || doc.student_id !== student.id) {
          return res.status(403).json({ success: false, message: 'Access denied.' });
        }
      }

      const filePath = path.join(__dirname, '..', 'uploads', 'documents', doc.file_path);
      if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found.' });
      res.download(filePath, doc.file_name);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ success: false, message: 'Download failed.' });
    }
  },

  async delete(req, res) {
    try {
      const doc = await DocumentModel.getById(req.params.id);
      if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

      if (req.user.role === 'student') {
        const student = await StudentModel.getByUserId(req.user.id);
        if (!student || doc.student_id !== student.id) {
          return res.status(403).json({ success: false, message: 'Access denied.' });
        }
      }

      const filePath = path.join(__dirname, '..', 'uploads', 'documents', doc.file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await DocumentModel.delete(req.params.id);
      res.json({ success: true, message: 'Document deleted.' });
    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({ success: false, message: 'Delete failed.' });
    }
  },

  async rename(req, res) {
    try {
      const { file_name } = req.body;
      if (!file_name) return res.status(400).json({ success: false, message: 'File name is required.' });

      const doc = await DocumentModel.getById(req.params.id);
      if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });

      if (req.user.role === 'student') {
        const student = await StudentModel.getByUserId(req.user.id);
        if (!student || doc.student_id !== student.id) {
          return res.status(403).json({ success: false, message: 'Access denied.' });
        }
      }

      await DocumentModel.updateName(req.params.id, file_name);
      res.json({ success: true, message: 'Document renamed successfully.' });
    } catch (error) {
      console.error('Rename document error:', error);
      res.status(500).json({ success: false, message: 'Rename failed.' });
    }
  }
};

module.exports = documentController;
