const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/academic-year', auth, settingsController.getAcademicYear);

router.put('/academic-year', auth, roleCheck('admin'), settingsController.updateAcademicYear);

module.exports = router;
