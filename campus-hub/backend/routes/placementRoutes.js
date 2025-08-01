const express = require('express');
const router = express.Router();
const {
    createJob,
    getEligibleJobs,
    applyForJob,
    getMyApplications,
    postAnnouncement,
    getAnnouncements,
    postInterviewList,
    getInterviewLists,
    getResumeAnalysis,
    getJobRecommendations,
    getEligibleStudents,
    postInterviewAnnouncement,
    getInterviewAnnouncements,
    updateStudentEligibility
} = require('../controllers/placementController');
const { getPlacementAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Admin/Faculty/Coordinator routes
router.post('/job', authorize('admin', 'placement_coordinator'), createJob);
router.post('/announcement', authorize('admin', 'placement_coordinator'), postAnnouncement);
router.post('/interview-list', authorize('admin', 'placement_coordinator'), postInterviewList);
router.post('/interview-announcement', authorize('placement_coordinator', 'admin'), postInterviewAnnouncement);
router.get('/students', authorize('placement_coordinator', 'admin'), getEligibleStudents);
router.put('/student/:studentId/eligibility', authorize('placement_coordinator', 'admin'), updateStudentEligibility);

// Student routes
router.get('/jobs', authorize('student'), getEligibleJobs);
router.post('/apply/:jobId', authorize('student'), applyForJob);
router.get('/my-applications', authorize('student'), getMyApplications);
router.get('/ai-recommendations', authorize('student'), getJobRecommendations);
router.get('/announcements', getAnnouncements);
router.get('/interview-lists', getInterviewLists);
router.get('/interview-announcements', getInterviewAnnouncements);
router.get('/analytics', authorize('admin', 'placement_coordinator'), getPlacementAnalytics);

module.exports = router;
