const bcrypt = require('bcryptjs');
const StudentModel = require('../models/studentModel');
const UserModel = require('../models/userModel');
const { generateAdmissionNo, generateLoginId } = require('../utils/helpers');

const studentController = {

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

  async create(req, res) {
    try {
      const { name, class: cls, section, password } = req.body;

      const admission_no = await generateAdmissionNo();

      const loginId = generateLoginId(name, admission_no);

      const userPassword = password || `student@${admission_no}`;
      const hashedPassword = await bcrypt.hash(userPassword, 10);

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

      const userId = await UserModel.create({
        user_id: loginId,
        password: hashedPassword,
        role: 'student'
      });

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

  async update(req, res) {
    try {
      const student = await StudentModel.getById(req.params.id);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

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

  async updateMyProfile(req, res) {
    try {
      const student = await StudentModel.getByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student record not found.' });
      }

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
        limit: 1000
      });
      res.json({ success: true, students: result.students });
    } catch (error) {
      console.error('Get past students error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch past students.' });
    }
  },

  async promoteAll(req, res) {
    try {
      const { statusAcademicYear } = req.body;
      if (!statusAcademicYear || !statusAcademicYear.trim()) {
        return res.status(400).json({ success: false, message: 'Academic year for 12th batch is required.' });
      }

      const CLASS_CHAIN = [
        'Nursery', 'LKG', 'UKG',
        '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'
      ];
      const SECTIONS = ['A', 'B', 'C'];

      let totalMoved = 0;
      const results = [];

      for (let i = CLASS_CHAIN.length - 1; i >= 0; i--) {
        const fromClass = CLASS_CHAIN[i];

        if (fromClass === '12th') {

          for (const section of SECTIONS) {
            const count = await StudentModel.annualUpdate(
              fromClass, section,
              'move to past 12th batch', section,
              statusAcademicYear.trim()
            );
            totalMoved += count;
            if (count > 0) results.push(`${count} students from 12th-${section} → Past 12th Batch`);
          }
        } else {

          const toClass = CLASS_CHAIN[i + 1];
          for (const section of SECTIONS) {
            const count = await StudentModel.annualUpdate(
              fromClass, section,
              toClass, section,
              null
            );
            totalMoved += count;
            if (count > 0) results.push(`${count} students from ${fromClass}-${section} → ${toClass}-${section}`);
          }
        }
      }

      res.json({
        success: true,
        message: `Promotion complete! ${totalMoved} students promoted across all classes.`,
        details: results,
        totalMoved
      });
    } catch (error) {
      console.error('Promote all error:', error);
      res.status(500).json({ success: false, message: 'Failed to promote all classes.' });
    }
  }
};

module.exports = studentController;
