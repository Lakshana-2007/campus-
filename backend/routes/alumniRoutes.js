const express = require('express');
const router = express.Router();
const {
    getRecommendedAlumni,
    connectWithAlumni,
    handleRequest
} = require('../controllers/alumniController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/recommendations', authorize('student'), getRecommendedAlumni);
router.post('/connect/:alumniId', authorize('student'), connectWithAlumni);
router.put('/request/:requestId', authorize('alumni'), handleRequest);

module.exports = router;
