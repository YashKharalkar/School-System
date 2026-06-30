const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { validateStudent, sanitizeQuery } = require('../middleware/validate');

const { uploadStudentPhoto } = require('../middleware/upload');

// All routes require authentication
router.use(auth);

// GET /api/students/stats - Get student statistics
router.get('/stats', studentController.getStats);

// GET /api/students - List students (admin: all, student: own)
router.get('/', sanitizeQuery, studentController.getAll);

// GET /api/students/:id - Get single student
router.get('/:id', studentController.getById);

// POST /api/students - Add student (admin only)
router.post('/', roleCheck('admin'), uploadStudentPhoto.single('photo'), validateStudent, studentController.create);

// PUT /api/students/:id - Update student (admin only)
router.put('/:id', roleCheck('admin'), uploadStudentPhoto.single('photo'), validateStudent, studentController.update);

// DELETE /api/students/:id - Delete student (admin only)
router.delete('/:id', roleCheck('admin'), studentController.delete);

module.exports = router;
