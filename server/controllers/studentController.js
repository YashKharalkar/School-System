const bcrypt = require('bcryptjs');
const StudentModel = require('../models/studentModel');
const UserModel = require('../models/userModel');
const { generateAdmissionNo, generateLoginId } = require('../utils/helpers');

const studentController = {
  // GET /api/students
  async getAll(req, res) {
    try {
      const { class: className, search, page = 1, limit = 10 } = req.query;
      const result = await StudentModel.getAll({ className, search, page: Number(page), limit: Number(limit) });
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Get students error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch students.' });
    }
  },

  // GET /api/students/stats
  async getStats(req, res) {
    try {
      const total = await StudentModel.getTotalCount();
      const byClass = await StudentModel.getCountByClass();
      res.json({ success: true, total, byClass });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch statistics.' });
    }
  },

  // GET /api/students/:id
  async getById(req, res) {
    try {
      const student = await StudentModel.getById(req.params.id);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }
      res.json({ success: true, student });
    } catch (error) {
      console.error('Get student error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch student.' });
    }
  },

  // POST /api/students
  async create(req, res) {
    try {
      const { name, father_name, mother_name, dob, gender, parent_mobile, address, class: cls, section, password } = req.body;

      // Auto-generate admission number
      const admission_no = await generateAdmissionNo();

      // Generate login ID
      const loginId = generateLoginId(name, admission_no);

      // Hash password (default password or provided)
      const userPassword = password || `student@${admission_no}`;
      const hashedPassword = await bcrypt.hash(userPassword, 10);

      // Handle photo path
      const photo_path = req.file ? `/uploads/photos/${req.file.filename}` : null;

      // Create user account
      const userId = await UserModel.create({
        user_id: loginId,
        password: hashedPassword,
        role: 'student'
      });

      // Create student record
      const studentId = await StudentModel.create({
        user_id: userId,
        admission_no,
        name,
        father_name,
        mother_name,
        dob,
        gender,
        parent_mobile,
        address,
        class: cls,
        section,
        photo_path
      });

      res.status(201).json({
        success: true,
        message: 'Student added successfully.',
        student: {
          id: studentId,
          admission_no,
          login_id: loginId,
          password: userPassword,
          name,
          photo_path
        }
      });
    } catch (error) {
      console.error('Create student error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'Duplicate entry. Please try again.' });
      }
      res.status(500).json({ success: false, message: 'Failed to add student.' });
    }
  },

  // PUT /api/students/:id
  async update(req, res) {
    try {
      const { name, father_name, mother_name, dob, gender, parent_mobile, address, class: cls, section } = req.body;

      const student = await StudentModel.getById(req.params.id);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      // Handle photo path: only update if a new photo is uploaded
      const photo_path = req.file ? `/uploads/photos/${req.file.filename}` : undefined;

      await StudentModel.update(req.params.id, {
        name, father_name, mother_name, dob, gender,
        parent_mobile, address, class: cls, section, photo_path
      });

      res.json({ success: true, message: 'Student updated successfully.' });
    } catch (error) {
      console.error('Update student error:', error);
      res.status(500).json({ success: false, message: 'Failed to update student.' });
    }
  },

  // DELETE /api/students/:id
  async delete(req, res) {
    try {
      const deleted = await StudentModel.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }
      res.json({ success: true, message: 'Student deleted successfully.' });
    } catch (error) {
      console.error('Delete student error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete student.' });
    }
  }
};

module.exports = studentController;
