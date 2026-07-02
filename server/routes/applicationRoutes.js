const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);

router.get('/', applicationController.getApplications);
router.post('/', roleCheck('student'), applicationController.createApplication);
router.put('/:id/accept', roleCheck('admin'), applicationController.acceptApplication);

module.exports = router;
