const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { uploadFeeStructure, uploadQrCode, uploadPaymentScreenshot } = require('../middleware/upload');

router.use(auth);

router.get('/all', roleCheck('admin'), feeController.getAll);
router.get('/student/:studentId', feeController.getByStudent);
router.post('/update', roleCheck('admin'), feeController.update);
router.post('/payment', roleCheck('admin'), feeController.addPayment);

router.get('/structures', feeController.getStructures);
router.post('/structures', roleCheck('admin'), uploadFeeStructure.single('file'), feeController.uploadStructure);
router.put('/structures/:id/rename', roleCheck('admin'), feeController.renameStructure);
router.delete('/structures/:id', roleCheck('admin'), feeController.deleteStructure);
router.get('/structures/download/:id', feeController.downloadStructure);

router.get('/class-fees', feeController.getClassFees);
router.post('/class-fees', roleCheck('admin'), feeController.setClassFee);

router.post('/update-paid', roleCheck('admin'), feeController.updatePaidFee);

router.get('/qr-code', feeController.getQrCode);
router.post('/qr-code', roleCheck('admin'), uploadQrCode.single('file'), feeController.uploadQrCode);

router.post('/student-payment', roleCheck('student'), uploadPaymentScreenshot.single('screenshot'), feeController.submitStudentPayment);
router.get('/my-payments', roleCheck('student'), feeController.getMyPayments);

router.get('/payments-activity', roleCheck('admin'), feeController.getPaymentsActivity);
router.post('/confirm-payment/:id', roleCheck('admin'), feeController.confirmPayment);
router.post('/deny-payment/:id', roleCheck('admin'), feeController.denyPayment);

router.get('/next-receipt-no', roleCheck('admin'), feeController.getNextReceiptNo);
router.post('/increment-receipt-no', roleCheck('admin'), feeController.incrementReceiptNo);

module.exports = router;
