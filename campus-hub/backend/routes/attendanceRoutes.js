const express = require('express');
const router = express.Router();
const { markAttendance, getMyAttendance, getFacultyAttendance, predictAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/mark', authorize('faculty', 'admin'), markAttendance);
router.get('/my-attendance', authorize('student'), getMyAttendance);
router.get('/faculty', authorize('faculty', 'admin'), getFacultyAttendance);
router.get('/predict/:studentId', authorize('faculty', 'admin'), predictAttendance);

module.exports = router;
