const bcrypt = require('bcryptjs');
const StudentModel = require('../models/studentModel');
const UserModel = require('../models/userModel');
const { generateAdmissionNo, generateLoginId } = require('../utils/helpers');

const studentController = {
  // GET /api/students
  async getAll(req, res) {
    try {
      const { class: className, search, page = 1, limit = 10, name, admission_no, section, gender, status, status_academic_year } = req.query;
      const result = await StudentModel.getAll({ 
        className, 
        search, 
        page: Number(page), 
        limit: Number(limit),
        name,
        admission_no,
        section,
        gender,
        status,
        status_academic_year
      });
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
      const { name, class: cls, section, password } = req.body;

      // Auto-generate admission number
      const admission_no = await generateAdmissionNo();

      // Generate login ID
      const loginId = generateLoginId(name, admission_no);

      // Hash password (default password or provided)
      const userPassword = password || `student@${admission_no}`;
      const hashedPassword = await bcrypt.hash(userPassword, 10);

      // Handle photo and signature paths
      let photo_path = null;
      let signature_path = null;
      if (req.files) {
        if (req.files.photo && req.files.photo[0]) {
          photo_path = `/uploads/photos/${req.files.photo[0].filename}`;
        }
        if (req.files.signature && req.files.signature[0]) {
          signature_path = `/uploads/photos/${req.files.signature[0].filename}`;
        }
      } else if (req.file) {
        photo_path = `/uploads/photos/${req.file.filename}`;
      }

      // Create user account
      const userId = await UserModel.create({
        user_id: loginId,
        password: hashedPassword,
        role: 'student'
      });

      // Create student record
      const studentId = await StudentModel.create({
        ...req.body,
        user_id: userId,
        admission_no,
        photo_path,
        signature_path
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

  // PUT /api/students/:id (Admin update)
  async update(req, res) {
    try {
      const student = await StudentModel.getById(req.params.id);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      // Handle photo and signature paths
      let photo_path = undefined;
      let signature_path = undefined;
      if (req.files) {
        if (req.files.photo && req.files.photo[0]) {
          photo_path = `/uploads/photos/${req.files.photo[0].filename}`;
        }
        if (req.files.signature && req.files.signature[0]) {
          signature_path = `/uploads/photos/${req.files.signature[0].filename}`;
        }
      } else if (req.file) {
        photo_path = `/uploads/photos/${req.file.filename}`;
      }

      await StudentModel.update(req.params.id, {
        ...req.body,
        photo_path,
        signature_path
      });

      res.json({ success: true, message: 'Student updated successfully.' });
    } catch (error) {
      console.error('Update student error:', error);
      res.status(500).json({ success: false, message: 'Failed to update student.' });
    }
  },

  // PUT /api/students/profile/my (Student self-update)
  async updateMyProfile(req, res) {
    try {
      const student = await StudentModel.getByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student record not found.' });
      }

      // Enforce read-only fields
      const updateData = {
        ...req.body,
        name: student.name,
        class: student.class,
        section: student.section,
        admission_no: student.admission_no
      };

      if (req.files) {
        if (req.files.photo && req.files.photo[0]) {
          updateData.photo_path = `/uploads/photos/${req.files.photo[0].filename}`;
        }
        if (req.files.signature && req.files.signature[0]) {
          updateData.signature_path = `/uploads/photos/${req.files.signature[0].filename}`;
        }
      }

      await StudentModel.update(student.id, updateData);
      res.json({ success: true, message: 'Profile updated successfully.' });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ success: false, message: 'Failed to update profile.' });
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
  },

  // POST /api/students/annual-update
  async annualUpdate(req, res) {
    try {
      const { changeClass, changeSection, toClass, toSection, statusAcademicYear } = req.body;
      if (!changeClass || !changeSection || !toClass || !toSection) {
        return res.status(400).json({ success: false, message: 'Missing transition parameters.' });
      }

      const affectedRows = await StudentModel.annualUpdate(
        changeClass,
        changeSection,
        toClass,
        toSection,
        statusAcademicYear
      );

      res.json({ success: true, message: `Transition complete. ${affectedRows} students updated.` });
    } catch (error) {
      console.error('Annual update error:', error);
      res.status(500).json({ success: false, message: 'Failed to execute annual update.' });
    }
  },

  // PUT /api/students/:id/status
  async updateStatus(req, res) {
    try {
      const { status, statusAcademicYear } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'status parameter is required.' });
      }

      const success = await StudentModel.updateStatus(req.params.id, status, statusAcademicYear);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      res.json({ success: true, message: 'Student status updated successfully.' });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ success: false, message: 'Failed to update student status.' });
    }
  },

  // GET /api/students/past-years/:status
  async getPastAcademicYears(req, res) {
    try {
      const { status } = req.params;
      let mappedStatus = 'Left';
      if (status === 'past-left' || status === 'Left') mappedStatus = 'Left';
      else if (status === 'past-10th' || status === 'Past 10th') mappedStatus = 'Past 10th';
      else if (status === 'past-12th' || status === 'Past 12th') mappedStatus = 'Past 12th';

      const years = await StudentModel.getPastAcademicYears(mappedStatus);
      res.json({ success: true, years });
    } catch (error) {
      console.error('Get past academic years error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch past academic years.' });
    }
  },

  // GET /api/students/past/:status/:year
  async getPastStudents(req, res) {
    try {
      const { status, year } = req.params;
      let mappedStatus = 'Left';
      if (status === 'past-left' || status === 'Left') mappedStatus = 'Left';
      else if (status === 'past-10th' || status === 'Past 10th') mappedStatus = 'Past 10th';
      else if (status === 'past-12th' || status === 'Past 12th') mappedStatus = 'Past 12th';

      const result = await StudentModel.getAll({
        status: mappedStatus,
        status_academic_year: year,
        limit: 1000 // get all without heavy pagination
      });
      res.json({ success: true, students: result.students });
    } catch (error) {
      console.error('Get past students error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch past students.' });
    }
  }
};

module.exports = studentController;
