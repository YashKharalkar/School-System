const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);
router.get('/', noticeController.getAll);
router.post('/', roleCheck('admin'), noticeController.create);
router.put('/:id', roleCheck('admin'), noticeController.update);
router.delete('/:id', roleCheck('admin'), noticeController.delete);

module.exports = router;
