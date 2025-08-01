const express = require('express');
const {
    createAssignment,
    getAssignments,
    getAssignment,
    updateAssignment,
    deleteAssignment,
    getFacultyAnalytics,
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect); // All assignment routes require auth

router.get('/analytics/overview', authorize('faculty'), getFacultyAnalytics);
router.post('/', authorize('faculty'), createAssignment);
router.get('/', getAssignments);
router.get('/:id', getAssignment);
router.put('/:id', authorize('faculty'), updateAssignment);
router.delete('/:id', authorize('faculty'), deleteAssignment);

module.exports = router;
