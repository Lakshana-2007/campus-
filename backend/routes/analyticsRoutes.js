const express = require('express');
const router = express.Router();
const { getRiskAssessment } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/risk-assessment', protect, authorize('faculty', 'admin'), getRiskAssessment);

module.exports = router;
