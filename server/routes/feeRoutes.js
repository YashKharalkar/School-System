const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { uploadFeeStructure, uploadQrCode } = require('../middleware/upload');

router.use(auth);

// Existing routes
router.get('/all', roleCheck('admin'), feeController.getAll);
router.get('/student/:studentId', feeController.getByStudent);
router.post('/update', roleCheck('admin'), feeController.update);
router.post('/payment', roleCheck('admin'), feeController.addPayment);

// Dynamic Fee Structure routes
router.get('/structures', feeController.getStructures);
router.post('/structures', roleCheck('admin'), uploadFeeStructure.single('file'), feeController.uploadStructure);
router.put('/structures/:id/rename', roleCheck('admin'), feeController.renameStructure);
router.delete('/structures/:id', roleCheck('admin'), feeController.deleteStructure);
router.get('/structures/download/:id', feeController.downloadStructure);

// Global Class Fees routes
router.get('/class-fees', feeController.getClassFees);
router.post('/class-fees', roleCheck('admin'), feeController.setClassFee);

// Paid Fees Direct Update
router.post('/update-paid', roleCheck('admin'), feeController.updatePaidFee);

// QR Code routes
router.get('/qr-code', feeController.getQrCode);
router.post('/qr-code', roleCheck('admin'), uploadQrCode.single('file'), feeController.uploadQrCode);

// Student fee payment routes
router.post('/student-payment', roleCheck('student'), feeController.submitStudentPayment);

// Admin fee payment activity routes
router.get('/payments-activity', roleCheck('admin'), feeController.getPaymentsActivity);
router.post('/confirm-payment/:id', roleCheck('admin'), feeController.confirmPayment);

module.exports = router;
