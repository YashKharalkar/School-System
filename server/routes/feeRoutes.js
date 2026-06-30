const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);
router.get('/all', roleCheck('admin'), feeController.getAll);
router.get('/student/:studentId', feeController.getByStudent);
router.post('/update', roleCheck('admin'), feeController.update);
router.post('/payment', roleCheck('admin'), feeController.addPayment);

module.exports = router;
