const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Require authentication and admin role for all backup operations
router.use(auth);
router.use(roleCheck('admin'));

// GET /api/backup - List all backups
router.get('/', backupController.listBackups);

// POST /api/backup/create - Create a backup
router.post('/create', backupController.createBackup);

// POST /api/backup/restore - Restore from a backup
router.post('/restore', backupController.restoreBackup);

// DELETE /api/backup/:filename - Delete a backup
router.delete('/:filename', backupController.deleteBackup);

module.exports = router;
