const FeeModel = require('../models/feeModel');
const StudentModel = require('../models/studentModel');
const path = require('path');
const fs = require('fs');

const feeController = {
  // GET /api/fees/student/:studentId
  async getByStudent(req, res) {
    try {
      const fee = await FeeModel.getByStudentId(req.params.studentId);
      let payments = [];
      if (fee && fee.id) payments = await FeeModel.getPayments(fee.id);
      res.json({ success: true, fee, payments });
    } catch (error) {
      console.error('Get student fee error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch fee details.' });
    }
  },

  // POST /api/fees/update
  async update(req, res) {
    try {
      const { student_id, total_fee, paid_amount, academic_year } = req.body;
      if (!student_id || total_fee === undefined) return res.status(400).json({ success: false, message: 'Student and total fee are required.' });

      const student = await StudentModel.getById(student_id);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

      const feeId = await FeeModel.createOrUpdate({ student_id, total_fee, paid_amount, academic_year });
      res.json({ success: true, message: 'Fee updated.', fee_id: feeId });
    } catch (error) {
      console.error('Update fee error:', error);
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
      console.error('Add payment error:', error);
      res.status(500).json({ success: false, message: 'Failed to record payment.' });
    }
  },

  // GET /api/fees/all
  async getAll(req, res) {
    try {
      const { class: cls, search, name, admission_no, section, gender } = req.query;
      const fees = await FeeModel.getAllWithStudents({ cls, search, name, admission_no, section, gender });
      res.json({ success: true, fees });
    } catch (error) {
      console.error('Get all fees error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch fees.' });
    }
  },

  // Global class fees management
  async getClassFees(req, res) {
    try {
      const classFees = await FeeModel.getClassFees();
      res.json({ success: true, classFees });
    } catch (error) {
      console.error('Get class fees error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch class fees.' });
    }
  },

  async setClassFee(req, res) {
    try {
      const { class: cls, amount } = req.body;
      if (!cls || amount === undefined) return res.status(400).json({ success: false, message: 'Class and amount are required.' });
      await FeeModel.setClassFee(cls, parseFloat(amount));
      res.json({ success: true, message: 'Class fee set successfully.' });
    } catch (error) {
      console.error('Set class fee error:', error);
      res.status(500).json({ success: false, message: 'Failed to set class fee.' });
    }
  },

  // Direct paid fee updates
  async updatePaidFee(req, res) {
    try {
      const { student_id, paid_amount } = req.body;
      if (!student_id || paid_amount === undefined) return res.status(400).json({ success: false, message: 'Student ID and paid amount are required.' });
      await FeeModel.updatePaidAmount(student_id, parseFloat(paid_amount));
      res.json({ success: true, message: 'Paid amount updated successfully.' });
    } catch (error) {
      console.error('Update paid fee error:', error);
      res.status(500).json({ success: false, message: 'Failed to update paid amount.' });
    }
  },

  // Fee structure document uploads management
  async getStructures(req, res) {
    try {
      const structures = await FeeModel.getStructures();
      res.json({ success: true, structures });
    } catch (error) {
      console.error('Get structures error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch structures.' });
    }
  },

  async uploadStructure(req, res) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
      const { name } = req.body;
      if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Structure name is required.' });

      const id = await FeeModel.createStructure({
        name: name.trim(),
        file_name: req.file.originalname,
        file_path: req.file.filename,
        uploaded_by: req.user.id
      });
      res.status(201).json({ success: true, message: 'Fee structure uploaded successfully.', id });
    } catch (error) {
      console.error('Upload structure error:', error);
      res.status(500).json({ success: false, message: 'Upload failed.' });
    }
  },

  async renameStructure(req, res) {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Name is required.' });
      const success = await FeeModel.renameStructure(req.params.id, name.trim());
      if (!success) return res.status(404).json({ success: false, message: 'Structure not found.' });
      res.json({ success: true, message: 'Structure renamed successfully.' });
    } catch (error) {
      console.error('Rename structure error:', error);
      res.status(500).json({ success: false, message: 'Rename failed.' });
    }
  },

  async deleteStructure(req, res) {
    try {
      const struct = await FeeModel.getStructureById(req.params.id);
      if (!struct) return res.status(404).json({ success: false, message: 'Not found.' });
      const filePath = path.join(__dirname, '..', 'uploads', 'fee-structures', struct.file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await FeeModel.deleteStructure(req.params.id);
      res.json({ success: true, message: 'Fee structure deleted successfully.' });
    } catch (error) {
      console.error('Delete structure error:', error);
      res.status(500).json({ success: false, message: 'Delete failed.' });
    }
  },

  async downloadStructure(req, res) {
    try {
      const struct = await FeeModel.getStructureById(req.params.id);
      if (!struct) return res.status(404).json({ success: false, message: 'Not found.' });
      const filePath = path.join(__dirname, '..', 'uploads', 'fee-structures', struct.file_path);
      if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found.' });
      res.download(filePath, struct.file_name);
    } catch (error) {
      console.error('Download structure error:', error);
      res.status(500).json({ success: false, message: 'Download failed.' });
    }
  }
};

module.exports = feeController;
