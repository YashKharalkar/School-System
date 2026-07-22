const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { validateStudent, sanitizeQuery } = require('../middleware/validate');

const { uploadStudentPhoto, uploadProfileFiles } = require('../middleware/upload');

router.use(auth);

router.get('/stats', studentController.getStats);

router.get('/', sanitizeQuery, studentController.getAll);

router.put('/profile/my', roleCheck('student'), uploadProfileFiles, studentController.updateMyProfile);

router.get('/past-years/:status', roleCheck('admin'), studentController.getPastAcademicYears);

router.get('/past/:status/:year', roleCheck('admin'), studentController.getPastStudents);

router.post('/annual-update', roleCheck('admin'), studentController.annualUpdate);

router.post('/promote-all', roleCheck('admin'), studentController.promoteAll);

router.put('/:id/status', roleCheck('admin'), studentController.updateStatus);

router.get('/:id', studentController.getById);

router.post('/', roleCheck('admin'), uploadProfileFiles, validateStudent, studentController.create);

router.put('/:id', roleCheck('admin'), uploadProfileFiles, validateStudent, studentController.update);

router.delete('/:id', roleCheck('admin'), studentController.delete);

module.exports = router;
