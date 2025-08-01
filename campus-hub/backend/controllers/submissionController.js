const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${req.user._id}-${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * @desc    Submit assignment (student only)
 * @route   POST /api/submissions/:assignmentId
 */
const submitAssignment = async (req, res, next) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found',
            });
        }

        // Check for existing submission
        const existing = await Submission.findOne({
            assignmentId,
            studentId: req.user._id,
        });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'You have already submitted this assignment',
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file',
            });
        }

        const submission = await Submission.create({
            assignmentId,
            studentId: req.user._id,
            fileUrl: `/uploads/${req.file.filename}`,
            originalFileName: req.file.originalname,
            submittedAt: new Date(),
        });

        res.status(201).json({ success: true, data: submission });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get student's own submissions
 * @route   GET /api/submissions/my
 */
const getMySubmissions = async (req, res, next) => {
    try {
        const submissions = await Submission.find({ studentId: req.user._id })
            .populate('assignmentId', 'title deadline')
            .sort({ submittedAt: -1 });

        res.json({ success: true, count: submissions.length, data: submissions });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all submissions for an assignment (faculty)
 * @route   GET /api/submissions/assignment/:assignmentId
 */
const getAssignmentSubmissions = async (req, res, next) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found',
            });
        }

        // Only the owning faculty can view submissions
        if (assignment.facultyId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these submissions',
            });
        }

        const submissions = await Submission.find({ assignmentId })
            .populate('studentId', 'name email')
            .sort({ submittedAt: -1 });

        res.json({ success: true, count: submissions.length, data: submissions });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Download a submission file
 * @route   GET /api/submissions/:id/download
 */
const downloadSubmission = async (req, res, next) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found',
            });
        }

        const filePath = path.join(__dirname, '..', submission.fileUrl);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server',
            });
        }

        res.download(filePath, submission.originalFileName);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    upload,
    submitAssignment,
    getMySubmissions,
    getAssignmentSubmissions,
    downloadSubmission,
};
