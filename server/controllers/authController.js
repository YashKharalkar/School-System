const AuthService = require('../services/authService');

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
  }
};

module.exports = authController;
