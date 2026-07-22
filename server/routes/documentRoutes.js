const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { uploadDocument } = require('../middleware/upload');

router.use(auth);

router.get('/:studentId', documentController.getByStudent);

router.post('/:studentId', roleCheck('admin', 'student'), uploadDocument.single('file'), documentController.upload);

router.put('/:id', roleCheck('admin'), uploadDocument.single('file'), documentController.replace);

router.put('/:id/rename', roleCheck('admin', 'student'), documentController.rename);

router.get('/download/:id', documentController.download);

router.delete('/:id', roleCheck('admin', 'student'), documentController.delete);

module.exports = router;
