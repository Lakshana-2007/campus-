const Job = require('../models/Job');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Announcement = require('../models/Announcement');
const InterviewList = require('../models/InterviewList');
const { callHuggingFace } = require('../services/aiTutorService');

/**
 * @desc    Create a new job (Admin only)
 * @route   POST /api/placements/job
 */
const createJob = async (req, res, next) => {
    try {
        const { companyName, role, description, eligibilityCriteria, packageDetails, applicationDeadline } = req.body;

        const job = await Job.create({
            companyName,
            role,
            description,
            eligibilityCriteria,
            packageDetails,
            applicationDeadline,
            postedBy: req.user._id,
            department: req.user.department || 'General', // Faculty/Admin department
        });

        res.status(201).json({ success: true, data: job });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get eligible jobs for student
 * @route   GET /api/placements/jobs
 */
const getEligibleJobs = async (req, res, next) => {
    try {
        const student = req.user;

        // Filtering logic: CGPA, Department, Semester
        const jobs = await Job.find({
            department: student.department,
            'eligibilityCriteria.minCGPA': { $lte: student.cgpa || 0 },
            'eligibilityCriteria.minSemester': { $lte: student.semester || 1 },
            'eligibilityCriteria.allowedDepartments': student.department,
            applicationDeadline: { $gte: new Date() },
        }).sort({ createdAt: -1 });

        res.json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Apply for a job
 * @route   POST /api/placements/apply/:jobId
 */
const applyForJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const studentId = req.user._id;

        // Check if already applied
        const existingApp = await Application.findOne({ jobId, studentId });
        if (existingApp) {
            return res.status(400).json({ success: false, message: 'Already applied for this job' });
        }

        // Get student resume
        const resume = await Resume.findOne({ studentId });
        if (!resume) {
            return res.status(400).json({ success: false, message: 'Please upload/create your resume first' });
        }

        const application = await Application.create({
            jobId,
            studentId,
            resumeURL: 'INTERNAL_RESUME_ID', // Using system resume
            status: 'Applied',
        });

        res.status(201).json({ success: true, data: application });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get student applications
 * @route   GET /api/placements/my-applications
 */
const getMyApplications = async (req, res, next) => {
    try {
        const applications = await Application.find({ studentId: req.user._id })
            .populate('jobId')
            .sort({ appliedAt: -1 });

        res.json({ success: true, data: applications });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Post Announcement (Faculty/Admin)
 * @route   POST /api/placements/announcement
 */
const postAnnouncement = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const announcement = await Announcement.create({
            title,
            content,
            department: req.user.department,
            postedBy: req.user._id,
        });
        res.status(201).json({ success: true, data: announcement });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Announcements (Departmental)
 * @route   GET /api/placements/announcements
 */
const getAnnouncements = async (req, res, next) => {
    try {
        const announcements = await Announcement.find({ department: req.user.department })
            .sort({ createdAt: -1 });
        res.json({ success: true, data: announcements });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Post Interview List (Faculty/Admin)
 * @route   POST /api/placements/interview-list
 */
const postInterviewList = async (req, res, next) => {
    try {
        const { date, companyName, students } = req.body;
        const list = await InterviewList.create({
            date,
            companyName,
            students,
            department: req.user.department,
            postedBy: req.user._id,
        });
        res.status(201).json({ success: true, data: list });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Interview Lists (Departmental)
 * @route   GET /api/placements/interview-lists
 */
const getInterviewLists = async (req, res, next) => {
    try {
        const lists = await InterviewList.find({ department: req.user.department })
            .populate('students.studentId', 'name email')
            .sort({ date: 1 });
        res.json({ success: true, data: lists });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get AI Resume Score & Skill Gap
 * @route   GET /api/placements/resume-analysis/:jobId
 */
const getResumeAnalysis = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const studentId = req.user._id;

        const [job, resume] = await Promise.all([
            Job.findById(jobId),
            Resume.findOne({ studentId }),
        ]);

        if (!job || !resume) {
            return res.status(404).json({ success: false, message: 'Job or Resume not found' });
        }

        const prompt = `
            Analyze the following student resume against the job description.
            
            JOB DESCRIPTION:
            Role: ${job.role}
            Description: ${job.description}
            
            STUDENT RESUME:
            Skills: ${resume.skills.join(', ')}
            Projects: ${JSON.stringify(resume.projects)}
            
            Provide a JSON response with:
            1. "score": A number from 0-100 indicating how well the resume matches the job.
            2. "skillGap": An array of important skills mentioned in the job description that are missing from the resume.
            3. "suggestions": A brief string with 2-3 actionable tips for the student.
        `;

        const completionText = await callHuggingFace([
            { role: 'system', content: 'You are an AI placement officer.' },
            { role: 'user', content: prompt },
        ]);

        let analysis = { score: 0, skillGap: [], suggestions: 'Unable to analyze resume at this time.' };
        try {
            analysis = JSON.parse(completionText);
        } catch (err) {
            console.warn('Hugging Face resume analysis parse failed.', err);
        }

        // Update resume with basic score (cumulative/latest)
        resume.resumeScore = analysis.score;
        await resume.save();

        res.json({ success: true, data: analysis });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createJob,
    getEligibleJobs,
    applyForJob,
    getMyApplications,
    postAnnouncement,
    getAnnouncements,
    postInterviewList,
    getInterviewLists,
    getResumeAnalysis,
};
