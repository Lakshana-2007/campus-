const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getMessages,
    getPossibleReceivers
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/send', sendMessage);
router.get('/possible-receivers', getPossibleReceivers);
router.get('/', getMessages);

module.exports = router;
