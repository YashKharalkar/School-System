const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const StudentModel = require('../models/studentModel');

const AuthService = {
  async login(userId, password) {
    // Find user
    const user = await UserModel.findByUserId(userId);
    if (!user) {
      throw { status: 401, message: 'Invalid User ID or Password.' };
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw { status: 401, message: 'Invalid User ID or Password.' };
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Get additional info based on role
    let userInfo = {
      id: user.id,
      user_id: user.user_id,
      role: user.role
    };

    if (user.role === 'student') {
      const student = await StudentModel.getByUserId(user.id);
      if (student) {
        userInfo.name = student.name;
        userInfo.class = student.class;
        userInfo.section = student.section;
        userInfo.admission_no = student.admission_no;
        userInfo.student_id = student.id;
        userInfo.photo_path = student.photo_path;
      }
    } else {
      userInfo.name = 'Admin User';
    }

    return { token, user: userInfo };
  },

  async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }

    if (user.role === 'student') {
      const student = await StudentModel.getByUserId(user.id);
      return { ...user, ...student, student_id: student.id };
    }

    return { ...user, name: 'Admin User' };
  },

  async changePassword(userId, currentPassword, newPassword) {
    // Get full user with password
    const user = await UserModel.findByIdWithPassword(userId);
    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }

    // Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw { status: 400, message: 'Incorrect current password.' };
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await UserModel.updatePassword(userId, hashedPassword);
  }
};

module.exports = AuthService;
