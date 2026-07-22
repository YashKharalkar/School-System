const pool = require('../config/db');

const StudentModel = {

  async getAll({ className, search, page = 1, limit = 10, name, admission_no, section, gender, status = 'Active', status_academic_year }) {
    let query = `SELECT s.*, u.user_id as login_id FROM students s
                 JOIN users u ON s.user_id = u.id WHERE 1=1`;
    const params = [];

    if (status && status !== 'All') {
      query += ' AND s.status = ?';
      params.push(status);
    }

    if (status_academic_year) {
      query += ' AND s.status_academic_year = ?';
      params.push(status_academic_year);
    }

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

    const countQuery = query.replace('SELECT s.*, u.user_id as login_id', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

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

  async getById(id) {
    const [rows] = await pool.execute(
      `SELECT s.*, u.user_id as login_id FROM students s
       JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async getByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT s.*, u.user_id as login_id FROM students s
       JOIN users u ON s.user_id = u.id WHERE s.user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  },

  async create(studentData) {
    const {
      user_id, admission_no, name, father_name, mother_name, dob, gender, parent_mobile, address, class: cls, section, photo_path,
      roll_no, blood_group, aadhaar_no, birth_reg_no, nationality, religion, caste, category, mother_tongue,
      mobile_no, alt_mobile_no, email_id, current_address, permanent_address, city, district, state, pin_code,
      father_occupation, father_qualification, father_mobile, father_email, father_aadhaar,
      mother_occupation, mother_qualification, mother_mobile, mother_email, mother_aadhaar,
      guardian_name, guardian_relationship, guardian_mobile, guardian_address,
      admission_date, admission_class, house, prev_school_name, prev_school_address, udise_no, medium_of_instruction,
      signature_path, id_mark_1, id_mark_2,
      allergies, medical_conditions, disability, emergency_contact_person, emergency_contact_no
    } = studentData;

    const [result] = await pool.execute(
      `INSERT INTO students (
        user_id, admission_no, name, father_name, mother_name, dob, gender, parent_mobile, address, class, section, photo_path,
        roll_no, blood_group, aadhaar_no, birth_reg_no, nationality, religion, caste, category, mother_tongue,
        mobile_no, alt_mobile_no, email_id, current_address, permanent_address, city, district, state, pin_code,
        father_occupation, father_qualification, father_mobile, father_email, father_aadhaar,
        mother_occupation, mother_qualification, mother_mobile, mother_email, mother_aadhaar,
        guardian_name, guardian_relationship, guardian_mobile, guardian_address,
        admission_date, admission_class, house, prev_school_name, prev_school_address, udise_no, medium_of_instruction,
        signature_path, id_mark_1, id_mark_2,
        allergies, medical_conditions, disability, emergency_contact_person, emergency_contact_no
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, admission_no, name, father_name || null, mother_name || null, dob || null, gender || null, parent_mobile || null, address || null, cls, section || 'A', photo_path || null,
        roll_no || null, blood_group || null, aadhaar_no || null, birth_reg_no || null, nationality || null, religion || null, caste || null, category || null, mother_tongue || null,
        mobile_no || null, alt_mobile_no || null, email_id || null, current_address || null, permanent_address || null, city || null, district || null, state || null, pin_code || null,
        father_occupation || null, father_qualification || null, father_mobile || null, father_email || null, father_aadhaar || null,
        mother_occupation || null, mother_qualification || null, mother_mobile || null, mother_email || null, mother_aadhaar || null,
        guardian_name || null, guardian_relationship || null, guardian_mobile || null, guardian_address || null,
        admission_date || null, admission_class || null, house || null, prev_school_name || null, prev_school_address || null, udise_no || null, medium_of_instruction || null,
        signature_path || null, id_mark_1 || null, id_mark_2 || null,
        allergies || null, medical_conditions || null, disability || null, emergency_contact_person || null, emergency_contact_no || null
      ]
    );
    return result.insertId;
  },

  async update(id, studentData) {
    const existing = await this.getById(id);
    if (!existing) return false;

    const merged = { ...existing, ...studentData };

    const {
      name, father_name, mother_name, dob, gender, parent_mobile, address, class: cls, section, photo_path,
      roll_no, blood_group, aadhaar_no, birth_reg_no, nationality, religion, caste, category, mother_tongue,
      mobile_no, alt_mobile_no, email_id, current_address, permanent_address, city, district, state, pin_code,
      father_occupation, father_qualification, father_mobile, father_email, father_aadhaar,
      mother_occupation, mother_qualification, mother_mobile, mother_email, mother_aadhaar,
      guardian_name, guardian_relationship, guardian_mobile, guardian_address,
      admission_date, admission_class, house, prev_school_name, prev_school_address, udise_no, medium_of_instruction,
      signature_path, id_mark_1, id_mark_2,
      allergies, medical_conditions, disability, emergency_contact_person, emergency_contact_no,
      status, status_academic_year
    } = merged;

    const formatDbDate = (val) => {
      if (!val) return null;
      if (typeof val === 'string') {
        return val.split('T')[0];
      }
      return val;
    };

    let query = `UPDATE students SET
      name=?, father_name=?, mother_name=?, dob=?, gender=?, parent_mobile=?, address=?, class=?, section=?,
      roll_no=?, blood_group=?, aadhaar_no=?, birth_reg_no=?, nationality=?, religion=?, caste=?, category=?, mother_tongue=?,
      mobile_no=?, alt_mobile_no=?, email_id=?, current_address=?, permanent_address=?, city=?, district=?, state=?, pin_code=?,
      father_occupation=?, father_qualification=?, father_mobile=?, father_email=?, father_aadhaar=?,
      mother_occupation=?, mother_qualification=?, mother_mobile=?, mother_email=?, mother_aadhaar=?,
      guardian_name=?, guardian_relationship=?, guardian_mobile=?, guardian_address=?,
      admission_date=?, admission_class=?, house=?, prev_school_name=?, prev_school_address=?, udise_no=?, medium_of_instruction=?,
      id_mark_1=?, id_mark_2=?,
      allergies=?, medical_conditions=?, disability=?, emergency_contact_person=?, emergency_contact_no=?,
      status=?, status_academic_year=?`;

    const params = [
      name, father_name || null, mother_name || null, formatDbDate(dob), gender || null, parent_mobile || null, address || null, cls, section || 'A',
      roll_no || null, blood_group || null, aadhaar_no || null, birth_reg_no || null, nationality || null, religion || null, caste || null, category || null, mother_tongue || null,
      mobile_no || null, alt_mobile_no || null, email_id || null, current_address || null, permanent_address || null, city || null, district || null, state || null, pin_code || null,
      father_occupation || null, father_qualification || null, father_mobile || null, father_email || null, father_aadhaar || null,
      mother_occupation || null, mother_qualification || null, mother_mobile || null, mother_email || null, mother_aadhaar || null,
      guardian_name || null, guardian_relationship || null, guardian_mobile || null, guardian_address || null,
      formatDbDate(admission_date), admission_class || null, house || null, prev_school_name || null, prev_school_address || null, udise_no || null, medium_of_instruction || null,
      id_mark_1 || null, id_mark_2 || null,
      allergies || null, medical_conditions || null, disability || null, emergency_contact_person || null, emergency_contact_no || null,
      status || 'Active', status_academic_year || null
    ];

    if (photo_path !== undefined) {
      query += `, photo_path=?`;
      params.push(photo_path);
    }

    if (signature_path !== undefined) {
      query += `, signature_path=?`;
      params.push(signature_path);
    }

    query += ` WHERE id=?`;
    params.push(id);

    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  },

  async updateStatus(id, status, status_academic_year) {
    const [result] = await pool.execute(
      'UPDATE students SET status = ?, status_academic_year = ? WHERE id = ?',
      [status, status_academic_year || null, id]
    );
    return result.affectedRows > 0;
  },

  async annualUpdate(changeClass, changeSection, toClass, toSection, statusAcademicYear) {
    if (toClass === 'move to past 10th batch' || toClass === 'move to past 12th batch') {
      const status = toClass === 'move to past 10th batch' ? 'Past 10th' : 'Past 12th';
      const [result] = await pool.execute(
        'UPDATE students SET status = ?, status_academic_year = ? WHERE class = ? AND section = ? AND status = \'Active\'',
        [status, statusAcademicYear, changeClass, changeSection]
      );
      return result.affectedRows;
    } else {
      const [result] = await pool.execute(
        'UPDATE students SET class = ?, section = ? WHERE class = ? AND section = ? AND status = \'Active\'',
        [toClass, toSection, changeClass, changeSection]
      );
      return result.affectedRows;
    }
  },

  async getPastAcademicYears(status) {
    const [rows] = await pool.execute(
      'SELECT DISTINCT status_academic_year FROM students WHERE status = ? AND status_academic_year IS NOT NULL ORDER BY status_academic_year DESC',
      [status]
    );
    return rows.map(r => r.status_academic_year);
  },

  async delete(id) {

    const student = await this.getById(id);
    if (!student) return false;

    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [student.user_id]);
    return result.affectedRows > 0;
  },

  async getCountByClass() {
    const [rows] = await pool.execute(
      `SELECT class, COUNT(*) as count FROM students WHERE status = 'Active' GROUP BY class ORDER BY CAST(REPLACE(REPLACE(class, 'st', ''), 'nd', '') AS UNSIGNED)`
    );
    return rows;
  },

  async getTotalCount() {
    const [rows] = await pool.execute(`SELECT COUNT(*) as total FROM students WHERE status = 'Active'`);
    return rows[0].total;
  },

  async admissionExists(admissionNo) {
    const [rows] = await pool.execute(
      'SELECT id FROM students WHERE admission_no = ?',
      [admissionNo]
    );
    return rows.length > 0;
  }
};

module.exports = StudentModel;
