const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validateLogin } = require('../middleware/validate');

router.post('/login', validateLogin, authController.login);

router.get('/me', auth, authController.getMe);

router.post('/change-password', auth, authController.changePassword);

router.post('/forgot-password/send-otp', authController.sendForgotOtp);

router.post('/forgot-password/reset', authController.resetPassword);

router.get('/admin/dob', auth, authController.getAdminDob);

router.put('/admin/dob', auth, authController.updateAdminDob);

const { uploadStudentPhoto } = require('../middleware/upload');
router.post('/profile-picture', auth, uploadStudentPhoto.single('photo'), authController.uploadProfilePicture);

module.exports = router;
