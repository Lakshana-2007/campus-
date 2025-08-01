const express = require('express');
const {
    upload,
    submitAssignment,
    getMySubmissions,
    getAssignmentSubmissions,
    downloadSubmission,
} = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect); // All submission routes require auth

router.post('/:assignmentId', authorize('student'), upload.single('file'), submitAssignment);
router.get('/my', authorize('student'), getMySubmissions);
router.get('/assignment/:assignmentId', authorize('faculty'), getAssignmentSubmissions);
router.get('/:id/download', downloadSubmission);

module.exports = router;
