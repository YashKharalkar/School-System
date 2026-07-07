const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { uploadDocument } = require('../middleware/upload');

router.use(auth);

// GET documents for a student
router.get('/:studentId', documentController.getByStudent);

// Upload document (admin or student)
router.post('/:studentId', roleCheck('admin', 'student'), uploadDocument.single('file'), documentController.upload);

// Replace document (admin only)
router.put('/:id', roleCheck('admin'), uploadDocument.single('file'), documentController.replace);

// Rename document (admin only)
router.put('/:id/rename', roleCheck('admin'), documentController.rename);

// Download document
router.get('/download/:id', documentController.download);

// Delete document (admin only)
router.delete('/:id', roleCheck('admin'), documentController.delete);

module.exports = router;
