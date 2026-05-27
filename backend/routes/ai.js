const express = require('express');
const router = express.Router();
const {
    chat,
    getChatHistory,
    newChatSession,
    deleteChatSession,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
    message: {
        success: false,
        message: 'Too many requests to AI service. Please wait a moment.',
    },
});

// All routes are protected
router.use(protect);

// Chat routes
router.post('/chat', aiLimiter, chat);
router.get('/chat/history', getChatHistory);
router.post('/chat/new', newChatSession);
router.delete('/chat/:sessionId', deleteChatSession);

module.exports = router;
