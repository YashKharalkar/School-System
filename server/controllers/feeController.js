const FeeModel = require('../models/feeModel');
const StudentModel = require('../models/studentModel');

const feeController = {
  // GET /api/fees/student/:studentId
  async getByStudent(req, res) {
    try {
      const fee = await FeeModel.getByStudentId(req.params.studentId);
      let payments = [];
      if (fee) payments = await FeeModel.getPayments(fee.id);
      res.json({ success: true, fee, payments });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch fee details.' });
    }
  },

  // POST /api/fees/update
  async update(req, res) {
    try {
      const { student_id, total_fee, paid_amount, academic_year } = req.body;
      if (!student_id || !total_fee) return res.status(400).json({ success: false, message: 'Student and total fee are required.' });

      const student = await StudentModel.getById(student_id);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

      const feeId = await FeeModel.createOrUpdate({ student_id, total_fee, paid_amount, academic_year });
      res.json({ success: true, message: 'Fee updated.', fee_id: feeId });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update fees.' });
    }
  },

  // POST /api/fees/payment
  async addPayment(req, res) {
    try {
      const { fee_id, amount, payment_date, payment_method, receipt_no, remarks } = req.body;
      if (!fee_id || !amount || !payment_date) return res.status(400).json({ success: false, message: 'Fee ID, amount and date are required.' });

      await FeeModel.addPayment({ fee_id, amount, payment_date, payment_method, receipt_no, remarks });
      res.json({ success: true, message: 'Payment recorded.' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to record payment.' });
    }
  },

  // GET /api/fees/all
  async getAll(req, res) {
    try {
      const { class: cls, search } = req.query;
      const fees = await FeeModel.getAllWithStudents({ cls, search });
      res.json({ success: true, fees });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch fees.' });
    }
  }
};

module.exports = feeController;
