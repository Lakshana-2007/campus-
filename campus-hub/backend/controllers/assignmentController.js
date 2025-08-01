const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

/**
 * @desc    Create a new assignment (faculty only)
 * @route   POST /api/assignments
 */
const createAssignment = async (req, res, next) => {
    try {
        const { title, description, deadline } = req.body;

        if (!title || !description || !deadline) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, description, and deadline',
            });
        }

        if (new Date(deadline) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Deadline must be in the future',
            });
        }

        const assignment = await Assignment.create({
            title,
            description,
            deadline,
            facultyId: req.user._id,
        });

        res.status(201).json({ success: true, data: assignment });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all assignments
 * @route   GET /api/assignments
 */
const getAssignments = async (req, res, next) => {
    try {
        let query = {};

        // Faculty sees only their own assignments
        if (req.user.role === 'faculty') {
            query.facultyId = req.user._id;
        }

        const assignments = await Assignment.find(query)
            .populate('facultyId', 'name email')
            .sort({ createdAt: -1 });

        // Enrich with submission counts and analytics for faculty
        const enrichedAssignments = await Promise.all(
            assignments.map(async (a) => {
                const obj = a.toObject();
                const submissions = await Submission.find({ assignmentId: a._id });
                obj.submissionCount = submissions.length;
                obj.isExpired = new Date() > a.deadline;

                if (req.user.role === 'faculty') {
                    const lateCount = submissions.filter((s) => s.isLate).length;
                    const flaggedCount = submissions.filter((s) => s.similarityScore > 40).length;
                    const avgSimilarity =
                        submissions.length > 0
                            ? Math.round(
                                submissions.reduce((sum, s) => sum + s.similarityScore, 0) /
                                submissions.length
                            )
                            : 0;

                    obj.analytics = {
                        totalSubmissions: submissions.length,
                        lateSubmissions: lateCount,
                        latePercentage:
                            submissions.length > 0
                                ? Math.round((lateCount / submissions.length) * 100)
                                : 0,
                        flaggedSubmissions: flaggedCount,
                        averageSimilarity: avgSimilarity,
                    };
                }

                // For students, check if they have submitted
                if (req.user.role === 'student') {
                    const mySubmission = submissions.find(
                        (s) => s.studentId.toString() === req.user._id.toString()
                    );
                    obj.hasSubmitted = !!mySubmission;
                    obj.mySubmission = mySubmission || null;
                }

                return obj;
            })
        );

        res.json({ success: true, count: enrichedAssignments.length, data: enrichedAssignments });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single assignment
 * @route   GET /api/assignments/:id
 */
const getAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.findById(req.params.id).populate(
            'facultyId',
            'name email'
        );

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found',
            });
        }

        res.json({ success: true, data: assignment });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update assignment (faculty only, own assignments)
 * @route   PUT /api/assignments/:id
 */
const updateAssignment = async (req, res, next) => {
    try {
        let assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found',
            });
        }

        if (assignment.facultyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this assignment',
            });
        }

        assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json({ success: true, data: assignment });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete assignment (faculty only, own assignments)
 * @route   DELETE /api/assignments/:id
 */
const deleteAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found',
            });
        }

        if (assignment.facultyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this assignment',
            });
        }

        await Assignment.findByIdAndDelete(req.params.id);
        await Submission.deleteMany({ assignmentId: req.params.id });

        res.json({ success: true, message: 'Assignment and related submissions deleted' });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get faculty analytics overview
 * @route   GET /api/assignments/analytics/overview
 */
const getFacultyAnalytics = async (req, res, next) => {
    try {
        const assignments = await Assignment.find({ facultyId: req.user._id });
        const assignmentIds = assignments.map((a) => a._id);
        const submissions = await Submission.find({
            assignmentId: { $in: assignmentIds },
        });

        const totalSubmissions = submissions.length;
        const lateSubmissions = submissions.filter((s) => s.isLate).length;
        const flaggedSubmissions = submissions.filter((s) => s.similarityScore > 40).length;
        const avgSimilarity =
            totalSubmissions > 0
                ? Math.round(
                    submissions.reduce((sum, s) => sum + s.similarityScore, 0) / totalSubmissions
                )
                : 0;

        // Most problematic assignment (highest avg similarity)
        const assignmentSimilarity = {};
        submissions.forEach((s) => {
            const key = s.assignmentId.toString();
            if (!assignmentSimilarity[key]) {
                assignmentSimilarity[key] = { total: 0, count: 0 };
            }
            assignmentSimilarity[key].total += s.similarityScore;
            assignmentSimilarity[key].count += 1;
        });

        let mostProblematic = null;
        let highestAvg = 0;
        for (const [id, data] of Object.entries(assignmentSimilarity)) {
            const avg = data.total / data.count;
            if (avg > highestAvg) {
                highestAvg = avg;
                mostProblematic = id;
            }
        }

        const problematicAssignment = mostProblematic
            ? await Assignment.findById(mostProblematic).select('title')
            : null;

        // Submission time distribution (hour of day)
        const timeDistribution = new Array(24).fill(0);
        submissions.forEach((s) => {
            const hour = new Date(s.submittedAt).getHours();
            timeDistribution[hour]++;
        });

        res.json({
            success: true,
            data: {
                totalAssignments: assignments.length,
                totalSubmissions,
                lateSubmissions,
                latePercentage:
                    totalSubmissions > 0 ? Math.round((lateSubmissions / totalSubmissions) * 100) : 0,
                flaggedSubmissions,
                averageSimilarity: avgSimilarity,
                mostProblematicAssignment: problematicAssignment
                    ? { title: problematicAssignment.title, avgSimilarity: Math.round(highestAvg) }
                    : null,
                submissionTimeDistribution: timeDistribution,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAssignment,
    getAssignments,
    getAssignment,
    updateAssignment,
    deleteAssignment,
    getFacultyAnalytics,
};
