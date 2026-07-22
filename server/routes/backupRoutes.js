const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);
router.use(roleCheck('admin'));

router.get('/', backupController.listBackups);

router.post('/create', backupController.createBackup);

router.post('/restore', backupController.restoreBackup);

router.delete('/:filename', backupController.deleteBackup);

module.exports = router;
