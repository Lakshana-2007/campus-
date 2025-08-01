const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const stringSimilarity = require('string-similarity');
const OpenAI = require('openai');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Use AI to generate structured insights about submission quality and integrity.
 */
const generateAIInsights = async (text, assignmentTitle) => {
    try {
        if (!text || text.length < 50) return null;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert academic integrity and quality evaluator. Analyze the provided assignment submission text and return a JSON object with qualityScore (0-100), integrityScore (0-100), riskLevel (Low, Medium, High), and analysisSummary (2 sentences).',
                },
                {
                    role: 'user',
                    content: `Assignment: ${assignmentTitle}\n\nSubmission Text: ${text.substring(0, 4000)}`,
                },
            ],
            response_format: { type: 'json_object' },
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('AI Insight Error:', error);
        return null;
    }
};

/**
 * Extract text from uploaded file.
 * Supports PDF and plain text.
 */
const extractText = async (filePath) => {
    const absolutePath = path.join(__dirname, '..', filePath);

    if (!fs.existsSync(absolutePath)) {
        throw new Error('File not found for text extraction');
    }

    const ext = path.extname(absolutePath).toLowerCase();

    if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(absolutePath);
        const data = await pdfParse(dataBuffer);
        return data.text || '';
    }

    if (ext === '.txt') {
        return fs.readFileSync(absolutePath, 'utf-8');
    }

    // For DOC/DOCX, return empty (would need mammoth or similar in production)
    return '';
};

/**
 * Normalize text for comparison.
 */
const normalizeText = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * @desc    Run plagiarism check on a specific submission
 * @route   POST /api/plagiarism/check/:submissionId
 */
const checkPlagiarism = async (req, res, next) => {
    try {
        const submission = await Submission.findById(req.params.submissionId).select(
            '+extractedText'
        );

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found',
            });
        }

        // Verify faculty owns the assignment
        const assignment = await Assignment.findById(submission.assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Related assignment not found',
            });
        }

        if (assignment.facultyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to check this submission',
            });
        }

        // Extract text from the target submission
        let targetText = submission.extractedText;
        if (!targetText) {
            targetText = await extractText(submission.fileUrl);
            submission.extractedText = targetText;
        }

        if (!targetText || targetText.trim().length < 10) {
            submission.similarityScore = 0;
            await submission.save();
            return res.json({
                success: true,
                data: {
                    similarityScore: 0,
                    message: 'Could not extract sufficient text from submission for comparison',
                    comparisons: [],
                },
            });
        }

        const normalizedTarget = normalizeText(targetText);

        // Get all other submissions for the same assignment
        const otherSubmissions = await Submission.find({
            assignmentId: submission.assignmentId,
            _id: { $ne: submission._id },
        })
            .select('+extractedText')
            .populate('studentId', 'name email');

        const comparisons = [];
        let maxSimilarity = 0;

        for (const other of otherSubmissions) {
            let otherText = other.extractedText;
            if (!otherText) {
                otherText = await extractText(other.fileUrl);
                other.extractedText = otherText;
                await other.save();
            }

            if (!otherText || otherText.trim().length < 10) continue;

            const normalizedOther = normalizeText(otherText);
            const similarity = stringSimilarity.compareTwoStrings(
                normalizedTarget,
                normalizedOther
            );

            const similarityPercent = Math.round(similarity * 100);

            if (similarityPercent > maxSimilarity) {
                maxSimilarity = similarityPercent;
            }

            comparisons.push({
                comparedWith: {
                    submissionId: other._id,
                    studentName: other.studentId?.name || 'Unknown',
                    studentEmail: other.studentId?.email || 'Unknown',
                },
                similarityPercent,
                flagged: similarityPercent > 40,
            });
        }

        // Update the submission's similarity score
        submission.similarityScore = maxSimilarity;

        // NEW: Generate AI Insights
        const aiResults = await generateAIInsights(targetText, assignment.title);
        if (aiResults) {
            submission.aiInsights = {
                qualityScore: aiResults.qualityScore || 0,
                integrityScore: aiResults.integrityScore || 0,
                riskLevel: aiResults.riskLevel || 'Low',
                analysisSummary: aiResults.analysisSummary || '',
            };
        }

        await submission.save();

        // Sort by highest similarity first
        comparisons.sort((a, b) => b.similarityPercent - a.similarityPercent);

        res.json({
            success: true,
            data: {
                submissionId: submission._id,
                assignmentTitle: assignment.title,
                similarityScore: maxSimilarity,
                flagged: maxSimilarity > 40,
                totalComparisons: comparisons.length,
                comparisons,
                aiInsights: submission.aiInsights,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Batch check all submissions for an assignment
 * @route   POST /api/plagiarism/check-assignment/:assignmentId
 */
const checkAssignmentPlagiarism = async (req, res, next) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found',
            });
        }

        if (assignment.facultyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
        }

        const submissions = await Submission.find({ assignmentId })
            .select('+extractedText')
            .populate('studentId', 'name email');

        // Extract text for all submissions
        for (const sub of submissions) {
            if (!sub.extractedText) {
                sub.extractedText = await extractText(sub.fileUrl);
                await sub.save();
            }
        }

        // Pairwise comparison
        const results = [];
        for (let i = 0; i < submissions.length; i++) {
            const textA = normalizeText(submissions[i].extractedText || '');
            if (textA.length < 10) continue;

            let maxSim = 0;
            const pairResults = [];

            for (let j = 0; j < submissions.length; j++) {
                if (i === j) continue;
                const textB = normalizeText(submissions[j].extractedText || '');
                if (textB.length < 10) continue;

                const sim = Math.round(
                    stringSimilarity.compareTwoStrings(textA, textB) * 100
                );

                if (sim > maxSim) maxSim = sim;

                if (sim > 20) {
                    pairResults.push({
                        comparedWith: submissions[j].studentId?.name || 'Unknown',
                        similarity: sim,
                    });
                }
            }

            submissions[i].similarityScore = maxSim;

            // NEW: Generate AI Insights for each during batch (only if not already analyzed)
            if (!submissions[i].aiInsights || submissions[i].aiInsights.qualityScore === 0) {
                const aiResults = await generateAIInsights(submissions[i].extractedText, assignment.title);
                if (aiResults) {
                    submissions[i].aiInsights = {
                        qualityScore: aiResults.qualityScore || 0,
                        integrityScore: aiResults.integrityScore || 0,
                        riskLevel: aiResults.riskLevel || 'Low',
                        analysisSummary: aiResults.analysisSummary || '',
                    };
                }
            }

            await submissions[i].save();

            results.push({
                submissionId: submissions[i]._id,
                studentName: submissions[i].studentId?.name || 'Unknown',
                studentEmail: submissions[i].studentId?.email || 'Unknown',
                similarityScore: maxSim,
                flagged: maxSim > 40,
                topMatches: pairResults.sort((a, b) => b.similarity - a.similarity).slice(0, 3),
                aiInsights: submissions[i].aiInsights,
            });
        }

        // Sort by highest similarity
        results.sort((a, b) => b.similarityScore - a.similarityScore);

        res.json({
            success: true,
            data: {
                assignmentTitle: assignment.title,
                totalSubmissions: submissions.length,
                flaggedCount: results.filter((r) => r.flagged).length,
                results,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get flagged submissions report for faculty's assignments
 * @route   GET /api/plagiarism/flagged
 */
const getFlaggedSubmissions = async (req, res, next) => {
    try {
        const assignments = await Assignment.find({ facultyId: req.user._id });
        const assignmentIds = assignments.map((a) => a._id);

        const flagged = await Submission.find({
            assignmentId: { $in: assignmentIds },
            similarityScore: { $gt: 40 },
        })
            .populate('studentId', 'name email')
            .populate('assignmentId', 'title deadline')
            .sort({ similarityScore: -1 });

        res.json({
            success: true,
            count: flagged.length,
            data: flagged,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    checkPlagiarism,
    checkAssignmentPlagiarism,
    getFlaggedSubmissions,
};
