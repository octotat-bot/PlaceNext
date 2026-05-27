const ChatSession = require('../models/ChatSession');
const { chatWithAssistant } = require('../utils/ai');

// @desc    Send message to AI chatbot
// @route   POST /api/ai/chat
// @access  Private
const chat = async (req, res, next) => {
    try {
        const { message, sessionId } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a message',
            });
        }

        // Get or create chat session
        let session;
        if (sessionId) {
            session = await ChatSession.findOne({
                _id: sessionId,
                userId: req.user.id,
                isActive: true,
            });
        }

        if (!session) {
            session = await ChatSession.create({
                userId: req.user.id,
                messages: [],
            });
        }

        // Add user message to session
        session.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date(),
        });

        // Get AI response
        const result = await chatWithAssistant(session.messages, message);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error,
            });
        }

        // Add assistant response to session
        session.messages.push({
            role: 'assistant',
            content: result.message,
            timestamp: new Date(),
        });

        await session.save();

        res.status(200).json({
            success: true,
            sessionId: session._id,
            response: result.message,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get chat history
// @route   GET /api/ai/chat/history
// @access  Private
const getChatHistory = async (req, res, next) => {
    try {
        const { sessionId } = req.query;

        if (sessionId) {
            const session = await ChatSession.findOne({
                _id: sessionId,
                userId: req.user.id,
            });

            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'Chat session not found',
                });
            }

            return res.status(200).json({
                success: true,
                session,
            });
        }

        // Get all sessions
        const sessions = await ChatSession.find({ userId: req.user.id })
            .select('_id createdAt updatedAt isActive')
            .sort({ updatedAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            sessions,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Start new chat session
// @route   POST /api/ai/chat/new
// @access  Private
const newChatSession = async (req, res, next) => {
    try {
        // Mark all existing sessions as inactive
        await ChatSession.updateMany(
            { userId: req.user.id, isActive: true },
            { isActive: false }
        );

        // Create new session
        const session = await ChatSession.create({
            userId: req.user.id,
            messages: [],
        });

        res.status(201).json({
            success: true,
            sessionId: session._id,
            message: 'New chat session started',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete chat session
// @route   DELETE /api/ai/chat/:sessionId
// @access  Private
const deleteChatSession = async (req, res, next) => {
    try {
        const session = await ChatSession.findOneAndDelete({
            _id: req.params.sessionId,
            userId: req.user.id,
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Chat session deleted',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    chat,
    getChatHistory,
    newChatSession,
    deleteChatSession,
};
