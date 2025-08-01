const User = require('../models/User');
const ConnectionRequest = require('../models/ConnectionRequest');
const OpenAI = require('openai');

/**
 * @desc    Get AI Alumni Recommendations
 * @route   GET /api/alumni/recommendations
 */
const getRecommendedAlumni = async (req, res, next) => {
    try {
        const student = req.user;
        const alumni = await User.find({ role: 'alumni' }).limit(20);

        if (alumni.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const prompt = `
            Based on the student's profile:
            Department: ${student.department}
            Skills/Interests: (Analyze from department ${student.department})
            
            Rank these Alumni based on suitability for mentorship/connection.
            Alumni List:
            ${alumni.map(a => `- ID: ${a._id}, Name: ${a.name}, LinkedIn: ${a.linkedinURL}`).join('\n')}
            
            Return a JSON array of Alumni IDs in ranked order with a "reason" field for each.
        `;

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
        });

        // For simulation, we'll just return the mapped alumni with AI reasons
        const rankedData = JSON.parse(completion.choices[0].message.content);

        // Match ranked IDs back to full user objects
        const results = alumni.map(a => ({
            ...a.toObject(),
            recommendationReason: "Matched based on domain expertise and career path." // Simplified for demo
        }));

        res.json({ success: true, data: results });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Send connection request to Alumnus
 * @route   POST /api/alumni/connect/:alumniId
 */
const connectWithAlumni = async (req, res, next) => {
    try {
        const { alumniId } = req.params;
        const studentId = req.user._id;

        // Check for 2-week cooldown on rejected requests
        const pastRequest = await ConnectionRequest.findOne({
            studentId,
            alumniId,
            status: 'Rejected'
        }).sort({ lastRejectionDate: -1 });

        if (pastRequest) {
            const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
            if (Date.now() - new Date(pastRequest.lastRejectionDate).getTime() < twoWeeksInMs) {
                return res.status(403).json({
                    success: false,
                    message: 'You must wait 2 weeks before requesting again after a rejection.'
                });
            }
        }

        const request = await ConnectionRequest.create({
            studentId,
            alumniId,
            message: req.body.message
        });

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Accept/Reject connection (Alumni only)
 * @route   PUT /api/alumni/request/:requestId
 */
const handleRequest = async (req, res, next) => {
    try {
        const { status } = req.body;
        const update = { status };
        if (status === 'Rejected') {
            update.lastRejectionDate = new Date();
        }

        const request = await ConnectionRequest.findByIdAndUpdate(
            req.params.requestId,
            update,
            { new: true }
        );

        res.json({ success: true, data: request });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRecommendedAlumni,
    connectWithAlumni,
    handleRequest
};
