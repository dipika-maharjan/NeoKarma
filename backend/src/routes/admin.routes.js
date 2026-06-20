const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/requireRole');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.use(authMiddleware, requireRole('school_admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/students', adminController.getStudents);
router.get('/students/:id', adminController.getStudentById);
router.post('/classes', adminController.createClass);
router.get('/classes', adminController.listClasses);
router.put('/students/:id/marks', adminController.updateStudentMarks);
router.get('/reports', adminController.getReports);
router.get('/reports/emissions', adminController.getEmissionsReport);
router.get('/reports/streaks', adminController.getStreakReport);
router.post('/sync-marks', adminController.syncMarks);

module.exports = router;
