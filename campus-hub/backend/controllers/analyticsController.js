const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');

/**
 * @desc    Get risk assessment for all students based on submission patterns
 * @route   GET /api/analytics/risk-assessment
 */
const getRiskAssessment = async (req, res, next) => {
    try {
        // Only faculty/admin can see risk assessments
        const students = await User.find({ role: 'student' }).select('name email');

        const riskProfiles = [];

        for (const student of students) {
            const submissions = await Submission.find({ studentId: student._id });

            if (submissions.length === 0) continue;

            const lateCount = submissions.filter(s => s.isLate).length;
            const avgSimilarity = submissions.reduce((acc, s) => acc + s.similarityScore, 0) / submissions.length;
            const flaggedCount = submissions.filter(s => s.similarityScore > 40).length;

            // AI-derived scores (if any)
            const avgQuality = submissions.reduce((acc, s) => acc + (s.aiInsights?.qualityScore || 0), 0) / submissions.length;
            const avgIntegrity = submissions.reduce((acc, s) => acc + (s.aiInsights?.integrityScore || 0), 0) / submissions.length;

            // Weighting: attendance (40%), flags (30%), late% (20%), similarity (10%)
            const lateRate = (lateCount / submissions.length) * 100;
            const flagRate = (flaggedCount / submissions.length) * 100;
            const attendanceRisk = 100 - (student.attendanceRate || 100);

            let riskScore = (attendanceRisk * 0.4) + (flagRate * 0.3) + (lateRate * 0.2) + (avgSimilarity * 0.1);
            if (avgQuality > 0 && avgQuality < 40) riskScore += 5;

            riskScore = Math.min(Math.round(riskScore), 100);

            riskProfiles.push({
                studentId: student._id,
                name: student.name,
                email: student.email,
                attendanceRate: student.attendanceRate || 100,
                stats: {
                    totalSubmissions: submissions.length,
                    lateCount,
                    flaggedCount,
                    avgSimilarity: Math.round(avgSimilarity),
                    avgQuality: Math.round(avgQuality),
                    avgIntegrity: Math.round(avgIntegrity)
                },
                riskScore,
                riskLevel: riskScore > 60 ? 'High' : riskScore > 30 ? 'Medium' : 'Low'
            });
        }

        // Sort by highest risk first
        riskProfiles.sort((a, b) => b.riskScore - a.riskScore);

        res.json({
            success: true,
            count: riskProfiles.length,
            data: riskProfiles
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get placement analytics
 * @route   GET /api/placements/analytics
 */
const getPlacementAnalytics = async (req, res, next) => {
    try {
        const stats = await Application.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const jobStats = await Job.aggregate([
            {
                $lookup: {
                    from: 'applications',
                    localField: '_id',
                    foreignField: 'jobId',
                    as: 'apps',
                },
            },
            {
                $project: {
                    companyName: 1,
                    role: 1,
                    appCount: { $size: '$apps' },
                },
            },
        ]);

        const selectedStudents = await Application.find({ status: 'Selected' }).populate('studentId');
        const avgCGPA = selectedStudents.length > 0
            ? selectedStudents.reduce((acc, curr) => acc + (curr.studentId.cgpa || 0), 0) / selectedStudents.length
            : 0;

        res.json({
            success: true,
            data: {
                applicationStats: stats,
                jobCompetition: jobStats,
                averageCGPAOfSelected: avgCGPA.toFixed(2),
                selectionRate: stats.find(s => s._id === 'Selected')?.count / stats.reduce((a, b) => a + b.count, 0) || 0
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRiskAssessment,
    getPlacementAnalytics,
};
