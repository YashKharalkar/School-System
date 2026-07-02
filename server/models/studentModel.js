const pool = require('../config/db');

const StudentModel = {
  // Get all students with filters and pagination
  async getAll({ className, search, page = 1, limit = 10, name, admission_no, section, gender }) {
    let query = `SELECT s.*, u.user_id as login_id FROM students s 
                 JOIN users u ON s.user_id = u.id WHERE 1=1`;
    const params = [];

    if (className && className !== 'All Classes' && className !== 'Everyone') {
      query += ' AND s.class = ?';
      params.push(className);
    }

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }

    if (admission_no) {
      query += ' AND s.admission_no LIKE ?';
      params.push(`%${admission_no}%`);
    }

    if (section && section !== 'Everyone') {
      query += ' AND s.section = ?';
      params.push(section);
    }

    if (gender && gender !== 'Everyone') {
      query += ' AND s.gender = ?';
      params.push(gender);
    }

    if (search) {
      query += ' AND (s.name LIKE ? OR s.admission_no LIKE ? OR u.user_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Get total count
    const countQuery = query.replace('SELECT s.*, u.user_id as login_id', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(String(limit), String(offset));

    const [rows] = await pool.execute(query, params);

    return {
      students: rows,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    };
  },

  // Get student by ID
  async getById(id) {
    const [rows] = await pool.execute(
      `SELECT s.*, u.user_id as login_id FROM students s 
       JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  // Get student by user ID (for logged-in student)
  async getByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT s.*, u.user_id as login_id FROM students s 
       JOIN users u ON s.user_id = u.id WHERE s.user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  },

  // Create student
  async create(studentData) {
    const { user_id, admission_no, name, father_name, mother_name, dob, gender, parent_mobile, address, class: cls, section, photo_path } = studentData;
    const [result] = await pool.execute(
      `INSERT INTO students (user_id, admission_no, name, father_name, mother_name, dob, gender, parent_mobile, address, class, section, photo_path) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, admission_no, name, father_name || null, mother_name || null, dob || null, gender || null, parent_mobile || null, address || null, cls, section || 'A', photo_path || null]
    );
    return result.insertId;
  },

  // Update student
  async update(id, studentData) {
    const { name, father_name, mother_name, dob, gender, parent_mobile, address, class: cls, section, photo_path } = studentData;
    let query = `UPDATE students SET name=?, father_name=?, mother_name=?, dob=?, gender=?, parent_mobile=?, address=?, class=?, section=?`;
    const params = [name, father_name || null, mother_name || null, dob || null, gender || null, parent_mobile || null, address || null, cls, section || 'A'];
    
    if (photo_path !== undefined) {
      query += `, photo_path=?`;
      params.push(photo_path);
    }
    
    query += ` WHERE id=?`;
    params.push(id);

    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  },

  // Delete student
  async delete(id) {
    // Get user_id first to delete user too
    const student = await this.getById(id);
    if (!student) return false;

    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [student.user_id]);
    return result.affectedRows > 0;
  },

  // Get students count by class
  async getCountByClass() {
    const [rows] = await pool.execute(
      `SELECT class, COUNT(*) as count FROM students GROUP BY class ORDER BY CAST(REPLACE(REPLACE(class, 'st', ''), 'nd', '') AS UNSIGNED)`
    );
    return rows;
  },

  // Get total count
  async getTotalCount() {
    const [rows] = await pool.execute('SELECT COUNT(*) as total FROM students');
    return rows[0].total;
  },

  // Check if admission number exists
  async admissionExists(admissionNo) {
    const [rows] = await pool.execute(
      'SELECT id FROM students WHERE admission_no = ?',
      [admissionNo]
    );
    return rows.length > 0;
  }
};

module.exports = StudentModel;
