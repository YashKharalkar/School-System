const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const StudentModel = require('../models/studentModel');
const AuthService = require('../services/authService');

// In-memory OTP store (production should use Redis or DB)
const otpStore = new Map();

const authController = {
  // POST /api/auth/login
  async login(req, res) {
    try {
      const { user_id, password } = req.body;
      const result = await AuthService.login(user_id, password);
      res.json({ success: true, ...result });
    } catch (error) {
      const status = error.status || 500;
      res.status(status).json({ success: false, message: error.message || 'Login failed.' });
    }
  },

  // GET /api/auth/me
  async getMe(req, res) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      res.json({ success: true, user });
    } catch (error) {
      const status = error.status || 500;
      res.status(status).json({ success: false, message: error.message || 'Server error.' });
    }
  },

  // POST /api/auth/change-password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current and new password are required.' });
      }
      await AuthService.changePassword(req.user.id, currentPassword, newPassword);
      res.json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
      const status = error.status || 500;
      res.status(status).json({ success: false, message: error.message || 'Failed to change password.' });
    }
  },

  // POST /api/auth/forgot-password/send-otp
  async sendForgotOtp(req, res) {
    try {
      const { user_id, dob } = req.body;
      if (!user_id || !dob) {
        return res.status(400).json({ success: false, message: 'User ID and Date of Birth are required.' });
      }

      // Find user
      const user = await UserModel.findByUserId(user_id.trim());
      if (!user) {
        return res.status(404).json({ success: false, message: 'No account found with this User ID.' });
      }

      let maskedMobile = 'XXXXXX0000';

      if (user.role === 'student') {
        const student = await StudentModel.getByUserId(user.id);
        if (!student) {
          return res.status(404).json({ success: false, message: 'Student profile not found.' });
        }
        // Compare DOB
        const dbDob = student.dob ? new Date(student.dob).toISOString().split('T')[0] : null;
        if (!dbDob || dbDob !== dob) {
          return res.status(400).json({ success: false, message: 'Date of Birth does not match our records.' });
        }
        // Get masked mobile
        const mobile = student.parent_mobile || student.mobile_no || '';
        maskedMobile = mobile ? `XXXXXX${mobile.slice(-4)}` : 'XXXXXX0000';
      }
      // For admin: DOB check is skipped (admin has no student profile)
      // In production, store admin DOB separately or use email verification

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP with 10 min expiry
      otpStore.set(user_id.trim(), {
        otp,
        dob,
        expires: Date.now() + 10 * 60 * 1000
      });

      console.log(`[OTP] User: ${user_id}, OTP: ${otp} (simulated - no SMS sent)`);

      // In production, send SMS here using Twilio / MSG91 etc.
      res.json({
        success: true,
        maskedMobile,
        otp, // Only for demo/dev - remove in production
        message: 'OTP sent to registered mobile number.'
      });
    } catch (error) {
      console.error('Forgot OTP error:', error);
      res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
    }
  },

  // POST /api/auth/forgot-password/reset
  async resetPassword(req, res) {
    try {
      const { user_id, dob, otp, newPassword } = req.body;
      if (!user_id || !dob || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
      }

      // Verify OTP from store
      const stored = otpStore.get(user_id.trim());
      if (!stored) {
        return res.status(400).json({ success: false, message: 'OTP expired or not requested. Please start over.' });
      }
      if (Date.now() > stored.expires) {
        otpStore.delete(user_id.trim());
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
      }
      if (stored.otp !== otp.trim()) {
        return res.status(400).json({ success: false, message: 'Invalid OTP.' });
      }
      if (stored.dob !== dob) {
        return res.status(400).json({ success: false, message: 'DOB mismatch.' });
      }
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }

      // Find user and update password
      const user = await UserModel.findByUserId(user_id.trim());
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await UserModel.updatePassword(user.id, hashedPassword);

      // Clear OTP
      otpStore.delete(user_id.trim());

      res.json({ success: true, message: 'Password reset successfully.' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
    }
  },

  // GET /api/auth/admin/dob - get admin DOB
  async getAdminDob(req, res) {
    try {
      const [rows] = await require('../config/db').execute(
        'SELECT dob FROM users WHERE id = ? AND role = ?',
        [req.user.id, 'admin']
      );
      if (!rows.length) return res.status(404).json({ success: false, message: 'Admin not found.' });
      res.json({ success: true, dob: rows[0].dob });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get DOB.' });
    }
  },

  // PUT /api/auth/admin/dob - update admin DOB
  async updateAdminDob(req, res) {
    try {
      const { dob } = req.body;
      if (!dob) return res.status(400).json({ success: false, message: 'Date of Birth is required.' });
      await require('../config/db').execute(
        'UPDATE users SET dob = ? WHERE id = ? AND role = ?',
        [dob, req.user.id, 'admin']
      );
      res.json({ success: true, message: 'Date of Birth updated successfully.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update DOB.' });
    }
  }
};

module.exports = authController;
