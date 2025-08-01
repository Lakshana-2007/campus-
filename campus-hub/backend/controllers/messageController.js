const Chat = require('../models/Chat');
const User = require('../models/User');
const ConnectionRequest = require('../models/ConnectionRequest');

/**
 * @desc    Send Message (Student to Faculty OR Alumni)
 * @route   POST /api/messages/send
 */
const sendMessage = async (req, res, next) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user._id;

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ success: false, message: 'Receiver not found' });
        }

        // Access control for Alumni
        if (receiver.role === 'alumni') {
            const connection = await ConnectionRequest.findOne({
                studentId: senderId,
                alumniId: receiverId,
                status: 'Accepted'
            });
            if (!connection) {
                return res.status(403).json({
                    success: false,
                    message: 'You must have an accepted connection request to message alumni.'
                });
            }
        }

        // Find or create chat session
        let chat = await Chat.findOne({
            isP2P: true,
            $or: [
                { userId: senderId, receiverId: receiverId },
                { userId: receiverId, receiverId: senderId }
            ]
        });

        if (!chat) {
            chat = await Chat.create({
                userId: senderId,
                receiverId: receiverId,
                sessionTitle: `Chat: ${req.user.name} & ${receiver.name}`,
                isP2P: true,
                messages: []
            });
        }

        chat.messages.push({
            senderId: senderId,
            role: senderId.toString() === chat.userId.toString() ? 'user' : 'assistant', // Mapping for UI reuse
            content: content
        });

        await chat.save();
        res.status(201).json({ success: true, data: chat });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user's messages
 * @route   GET /api/messages
 */
const getMessages = async (req, res, next) => {
    try {
        const chats = await Chat.find({
            $or: [
                { userId: req.user._id },
                { receiverId: req.user._id }
            ]
        }).sort({ updatedAt: -1 }).populate('userId', 'name email role').populate('receiverId', 'name email role');
        res.json({ success: true, data: chats });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all users available for messaging (excluding current user)
 * @route   GET /api/messages/possible-receivers
 */
const getPossibleReceivers = async (req, res, next) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }).select('name email role');
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendMessage,
    getMessages,
    getPossibleReceivers
};
