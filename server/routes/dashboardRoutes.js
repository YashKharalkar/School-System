const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);

router.get('/stats', dashboardController.getStats);
router.get('/tasks', roleCheck('admin'), dashboardController.getTasks);
router.post('/tasks', roleCheck('admin'), dashboardController.createTask);
router.delete('/tasks/:id', roleCheck('admin'), dashboardController.deleteTask);

module.exports = router;
