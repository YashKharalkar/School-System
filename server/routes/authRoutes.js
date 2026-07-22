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

// POST /api/auth/forgot-password/send-otp (public)
router.post('/forgot-password/send-otp', authController.sendForgotOtp);

// POST /api/auth/forgot-password/reset (public)
router.post('/forgot-password/reset', authController.resetPassword);

// GET /api/auth/admin/dob (protected, admin only)
router.get('/admin/dob', auth, authController.getAdminDob);

// PUT /api/auth/admin/dob (protected, admin only)
router.put('/admin/dob', auth, authController.updateAdminDob);

// POST /api/auth/profile-picture (protected)
const { uploadStudentPhoto } = require('../middleware/upload');
router.post('/profile-picture', auth, uploadStudentPhoto.single('photo'), authController.uploadProfilePicture);

module.exports = router;
