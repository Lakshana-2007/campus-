const Chat = require('../models/Chat');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const { generateTutorResponse } = require('../services/aiTutorService');

/**
 * Build context-aware system prompt from student data.
 */
const buildSystemPrompt = (assignments, submissions) => {
    const now = new Date();

    // Build assignment context
    const assignmentContext = assignments
        .map((a) => {
            const deadline = new Date(a.deadline);
            const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
            const submission = submissions.find(
                (s) => s.assignmentId.toString() === a._id.toString()
            );
            const status = submission
                ? submission.isLate
                    ? 'Submitted (Late)'
                    : 'Submitted'
                : daysLeft < 0
                    ? 'Overdue — Not submitted'
                    : `Pending — ${daysLeft} day(s) left`;

            return `  - "${a.title}": ${a.description.substring(0, 150)}... | Deadline: ${deadline.toLocaleDateString()} | Status: ${status}`;
        })
        .join('\n');

    // Identify urgent items
    const urgentAssignments = assignments.filter((a) => {
        const daysLeft = Math.ceil(
            (new Date(a.deadline) - now) / (1000 * 60 * 60 * 24)
        );
        const submitted = submissions.some(
            (s) => s.assignmentId.toString() === a._id.toString()
        );
        return !submitted && daysLeft >= 0 && daysLeft <= 3;
    });

    const urgentNote =
        urgentAssignments.length > 0
            ? `\n⚠️ URGENT: The student has ${urgentAssignments.length} assignment(s) due within 3 days: ${urgentAssignments.map((a) => `"${a.title}"`).join(', ')}. Prioritize helping with these.`
            : '';

    return `You are an AI academic assistant for Campus Hub, an academic productivity platform.

        ROLE: You help students understand assignments, explain concepts, summarize topics, create study plans, and improve academic performance.

CURRENT STUDENT CONTEXT:
    Date: ${now.toLocaleDateString()}
${assignmentContext ? `\nAssignments:\n${assignmentContext}` : '\nNo assignments currently.'}
Attendance Rate: ${submissions[0]?.studentId?.attendanceRate || 'N/A'}%
        CGPA: ${submissions[0]?.studentId?.cgpa || 'N/A'}
${urgentNote}

BEHAVIORAL GUIDELINES:
    1. Be context - aware — reference the student's actual assignments, deadlines, and current academic standing (attendance/CGPA) when relevant.
    2. If attendance or CGPA is low, proactively suggest focus areas or improvement strategies.
3. If a deadline is near, proactively suggest a study plan or time management strategy.
3. Explain concepts clearly with examples.
4. If asked about plagiarism or cheating, redirect toward academic integrity.
5. Format responses with markdown for readability(headers, bullet points, bold text).
6. Be encouraging and supportive, but academically rigorous.
7. Do NOT write assignment solutions.Help students understand concepts so they can write their own.
8. Keep responses focused and actionable.`;
};



/**
 * @desc    Send message to AI chatbot (student only)
 * @route   POST /api/chatbot
 */
const sendMessage = async (req, res, next) => {
    try {
        const { message, chatId } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required',
            });
        }

        // Cost protection: limit message length
        if (message.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Message too long. Please keep it under 1000 characters.',
            });
        }

        // Gather student context
        const [assignments, submissions] = await Promise.all([
            Assignment.find().sort({ deadline: 1 }),
            Submission.find({ studentId: req.user._id }).populate('studentId'),
        ]);

        // Get or create chat session
        let chat;
        if (chatId) {
            chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: 'Chat session not found',
                });
            }
        } else {
            chat = await Chat.create({
                userId: req.user._id,
                sessionTitle:
                    message.length > 50 ? message.substring(0, 50) + '...' : message,
                messages: [],
            });
        }

        // Add user message
        chat.messages.push({ role: 'user', content: message });

        // Build messages for AI
        const systemPrompt = buildSystemPrompt(assignments, submissions);
        const recentMessages = chat.messages.slice(-10); // Reduced history for local LLM performance
        const messages = [
            { role: 'system', content: systemPrompt },
            ...recentMessages.map((m) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content,
            })),
        ];

        // Call AI via service layer
        const aiResponse = await generateTutorResponse(messages);

        // Store AI response
        chat.messages.push({ role: 'assistant', content: aiResponse });
        await chat.save();

        res.json({
            success: true,
            data: {
                chatId: chat._id,
                message: aiResponse,
                sessionTitle: chat.sessionTitle,
            },
        });
    } catch (error) {
        console.error('AI Error:', error.message);

        // Specific handling for Hugging Face errors
        const hfStatus = error.response?.status;
        const hfData = error.response?.data;

        if (hfStatus === 401 || hfStatus === 403) {
            return res.status(500).json({
                success: false,
                message: 'Hugging Face API token is invalid or expired. Please check your .env configuration.',
            });
        }

        if (hfStatus === 503) {
            return res.status(503).json({
                success: false,
                message: 'The AI model is cold-starting. It usually takes 20-30 seconds to wake up. Please wait and try again.',
            });
        }

        if (error.code === 'ECONNREFUSED' && error.config?.url?.includes('11434')) {
            return res.status(503).json({
                success: false,
                message: 'Local AI service (Ollama) is not reachable. Please start it locally.',
            });
        }

        if (error?.status === 401 || error?.code === 'invalid_api_key') {
            return res.status(500).json({
                success: false,
                message: 'AI service configuration error — contact admin',
            });
        }

        next(error);
    }
};

/**
 * @desc    Get user's chat sessions
 * @route   GET /api/chatbot/sessions
 */
const getChatSessions = async (req, res, next) => {
    try {
        const chats = await Chat.find({ userId: req.user._id })
            .select('sessionTitle createdAt updatedAt')
            .sort({ updatedAt: -1 });

        res.json({ success: true, count: chats.length, data: chats });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get a single chat session with messages
 * @route   GET /api/chatbot/sessions/:chatId
 */
const getChatMessages = async (req, res, next) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.chatId,
            userId: req.user._id,
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found',
            });
        }

        res.json({ success: true, data: chat });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a chat session
 * @route   DELETE /api/chatbot/sessions/:chatId
 */
const deleteChatSession = async (req, res, next) => {
    try {
        const chat = await Chat.findOneAndDelete({
            _id: req.params.chatId,
            userId: req.user._id,
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found',
            });
        }

        res.json({ success: true, message: 'Chat session deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendMessage,
    getChatSessions,
    getChatMessages,
    deleteChatSession,
};
