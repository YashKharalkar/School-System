const express = require('express');
const router = express.Router();
const smsController = require('../controllers/smsController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);
router.post('/send', roleCheck('admin'), smsController.send);
router.get('/history', roleCheck('admin'), smsController.history);

module.exports = router;
