const express = require('express');
const {
    checkPlagiarism,
    checkAssignmentPlagiarism,
    getFlaggedSubmissions,
} = require('../controllers/plagiarismController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('faculty')); // Plagiarism routes are faculty-only

router.post('/check/:submissionId', checkPlagiarism);
router.post('/check-assignment/:assignmentId', checkAssignmentPlagiarism);
router.get('/flagged', getFlaggedSubmissions);

module.exports = router;
