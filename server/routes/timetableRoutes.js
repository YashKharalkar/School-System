const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { uploadTimetable } = require('../middleware/upload');

router.use(auth);
router.get('/', timetableController.getAll);
router.get('/download/:id', timetableController.download);
router.post('/', roleCheck('admin'), uploadTimetable.single('file'), timetableController.upload);
router.delete('/:id', roleCheck('admin'), timetableController.delete);

module.exports = router;
