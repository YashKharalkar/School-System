const express = require('express');
const router = express.Router();
const examTimetableController = require('../controllers/examTimetableController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { uploadExamTimetable } = require('../middleware/upload');

router.use(auth);
router.get('/', examTimetableController.getAll);
router.get('/download/:id', examTimetableController.download);
router.post('/', roleCheck('admin'), uploadExamTimetable.single('file'), examTimetableController.upload);
router.delete('/:id', roleCheck('admin'), examTimetableController.delete);

module.exports = router;
