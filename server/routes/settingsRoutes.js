const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// GET /api/settings/academic-year (any authenticated user can view)
router.get('/academic-year', auth, settingsController.getAcademicYear);

// PUT /api/settings/academic-year (admin only)
router.put('/academic-year', auth, roleCheck('admin'), settingsController.updateAcademicYear);

module.exports = router;
