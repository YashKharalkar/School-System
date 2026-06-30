const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);
router.post('/mark', roleCheck('admin'), attendanceController.mark);
router.get('/class', roleCheck('admin'), attendanceController.getByClass);
router.get('/student/:studentId', attendanceController.getByStudent);

module.exports = router;
