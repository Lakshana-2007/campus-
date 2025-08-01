const express = require('express');
const rateLimit = require('express-rate-limit');
const {
    sendMessage,
    getChatSessions,
    getChatMessages,
    deleteChatSession,
} = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Rate limiter: max 20 AI requests per 15 minutes per user
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: {
        success: false,
        message: 'Too many requests. Please wait before sending more messages.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(protect);
router.use(authorize('student')); // Chatbot is student-only

router.post('/', chatLimiter, sendMessage);
router.get('/sessions', getChatSessions);
router.get('/sessions/:chatId', getChatMessages);
router.delete('/sessions/:chatId', deleteChatSession);

module.exports = router;
