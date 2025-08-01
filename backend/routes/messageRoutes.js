const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getMessages
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/send', sendMessage);
router.get('/', getMessages);

module.exports = router;
