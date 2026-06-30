const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validateLogin } = require('../middleware/validate');

// POST /api/auth/login
router.post('/login', validateLogin, authController.login);

// GET /api/auth/me (protected)
router.get('/me', auth, authController.getMe);

// POST /api/auth/change-password (protected)
router.post('/change-password', auth, authController.changePassword);

module.exports = router;
