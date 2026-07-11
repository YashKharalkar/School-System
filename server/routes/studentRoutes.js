const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { validateStudent, sanitizeQuery } = require('../middleware/validate');

const { uploadStudentPhoto, uploadProfileFiles } = require('../middleware/upload');

// All routes require authentication
router.use(auth);

// GET /api/students/stats - Get student statistics
router.get('/stats', studentController.getStats);

// GET /api/students - List students (admin: all, student: own)
router.get('/', sanitizeQuery, studentController.getAll);

// PUT /api/students/profile/my - Update own profile details (student only)
router.put('/profile/my', roleCheck('student'), uploadProfileFiles, studentController.updateMyProfile);

// GET /api/students/past-years/:status - Get distinct years for a past status
router.get('/past-years/:status', roleCheck('admin'), studentController.getPastAcademicYears);

// GET /api/students/past/:status/:year - Get students by status and academic year
router.get('/past/:status/:year', roleCheck('admin'), studentController.getPastStudents);

// POST /api/students/annual-update - Bulk transition class/sections or batch move to past batches
router.post('/annual-update', roleCheck('admin'), studentController.annualUpdate);

// POST /api/students/promote-all - Promote ALL classes at once (full annual promotion)
router.post('/promote-all', roleCheck('admin'), studentController.promoteAll);

// PUT /api/students/:id/status - Update specific student status
router.put('/:id/status', roleCheck('admin'), studentController.updateStatus);

// GET /api/students/:id - Get single student
router.get('/:id', studentController.getById);

// POST /api/students - Add student (admin only)
router.post('/', roleCheck('admin'), uploadProfileFiles, validateStudent, studentController.create);

// PUT /api/students/:id - Update student (admin only)
router.put('/:id', roleCheck('admin'), uploadProfileFiles, validateStudent, studentController.update);

// DELETE /api/students/:id - Delete student (admin only)
router.delete('/:id', roleCheck('admin'), studentController.delete);

module.exports = router;
