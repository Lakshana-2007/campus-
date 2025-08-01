const Job = require('../models/Job');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Announcement = require('../models/Announcement');
const InterviewList = require('../models/InterviewList');
const OpenAI = require('openai');

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

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'system', content: 'You are an AI placement officer.' }, { role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
        });

        const analysis = JSON.parse(completion.choices[0].message.content);

        // Update resume with basic score (cumulative/latest)
        resume.resumeScore = analysis.score;
        await resume.save();

        res.json({ success: true, data: analysis });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    AI-powered job recommendations for a student
 * @route   GET /api/placements/ai-recommendations
 * @access  Private/Student
 */
const getJobRecommendations = async (req, res, next) => {
    try {
        const student = req.user;
        const studentId = student._id;

        // Get student resume
        const resume = await Resume.findOne({ studentId });
        if (!resume) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please upload your resume first'
            });
        }

        // Get all eligible jobs
        const jobs = await Job.find({
            'eligibilityCriteria.minCGPA': { $lte: student.cgpa || 0 },
            'eligibilityCriteria.minSemester': { $lte: student.semester || 1 },
            applicationDeadline: { $gte: new Date() }
        }).populate('postedBy', 'name');

        if (jobs.length === 0) {
            return res.json({
                success: true,
                data: {
                    recommendations: [],
                    message: 'No jobs matching your eligibility criteria at this time'
                }
            });
        }

        // Calculate match score for each job using simple keyword matching
        const recommendations = jobs.map(job => {
            // Extract skills from job description
            const skillKeywords = ['react', 'node', 'javascript', 'python', 'java', 'sql', 'backend', 'frontend', 'full stack', 'mongodb', 'aws', 'docker', 'kubernetes', 'c++', 'data structures', 'algorithms'];
            const jobDescription = (job.description + ' ' + job.role).toLowerCase();
            
            // Find matching skills
            const resumeSkillsLower = resume.skills.map(s => s.toLowerCase());
            const jobRequiredSkills = skillKeywords.filter(keyword => 
                jobDescription.includes(keyword)
            );
            
            const matchedSkills = jobRequiredSkills.filter(skill => 
                resumeSkillsLower.some(r => r.includes(skill) || skill.includes(r))
            );

            // Calculate matching percentage
            const matchPercentage = jobRequiredSkills.length > 0 
                ? Math.round((matchedSkills.length / jobRequiredSkills.length) * 100)
                : 50;

            // Calculate CGPA match
            const cgpaScore = student.cgpa ? Math.max(0, Math.min(100, (student.cgpa / 10) * 100)) : 70;

            // Combined score
            const finalScore = Math.round((matchPercentage * 0.6) + (cgpaScore * 0.4));

            // Determine recommendation rank
            let rank = 'Not Recommended';
            if (finalScore >= 80) rank = 'Highly Recommended';
            else if (finalScore >= 65) rank = 'Recommended';
            else if (finalScore >= 50) rank = 'Possible Match';

            return {
                jobId: job._id,
                companyName: job.companyName,
                role: job.role,
                department: job.department,
                salary: job.packageDetails?.salary,
                matchScore: finalScore,
                rank,
                matchedSkills,
                missingSkills: jobRequiredSkills.filter(s => !matchedSkills.includes(s)),
                cgpaRequirement: job.eligibilityCriteria.minCGPA,
                applicationDeadline: job.applicationDeadline
            };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10); // Top 10 recommendations

        res.json({
            success: true,
            data: {
                studentId,
                studentName: student.name,
                studentCGPA: student.cgpa,
                studentSkills: resume.skills,
                recommendations,
                summary: `Found ${recommendations.length} job opportunities. ${recommendations.filter(r => r.rank === 'Highly Recommended').length} are highly recommended for you.`
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get eligible students for placement (with filters)
 * @route   GET /api/placements/students?minCGPA=7&semester=5&department=CS&status=Applied
 * @access  Private/Coordinator
 */
const getEligibleStudents = async (req, res, next) => {
    try {
        const User = require('../models/User');
        const { minCGPA, semester, department, status } = req.query;

        // Build query
        let query = { role: 'student' };

        if (minCGPA) {
            query.cgpa = { $gte: parseFloat(minCGPA) };
        }

        if (semester) {
            query.semester = { $gte: parseInt(semester) };
        }

        if (department) {
            query.department = department;
        }

        // Get students
        let students = await User.find(query).select('name email department cgpa semester attendanceRate');

        // If status filter, get students with applications
        if (status) {
            const applications = await Application.find({ status }).populate('studentId');
            const studentIds = applications.map(app => app.studentId._id.toString());
            students = students.filter(s => studentIds.includes(s._id.toString()));
        }

        // Add resume info to each student
        const enrichedStudents = await Promise.all(
            students.map(async (student) => {
                const resume = await Resume.findOne({ studentId: student._id });
                return {
                    _id: student._id,
                    name: student.name,
                    email: student.email,
                    department: student.department,
                    cgpa: student.cgpa,
                    semester: student.semester,
                    attendanceRate: student.attendanceRate,
                    skills: resume?.skills || [],
                    hasResume: !!resume
                };
            })
        );

        res.json({
            success: true,
            count: enrichedStudents.length,
            filters: {
                minCGPA: minCGPA || 'None',
                semester: semester || 'None',
                department: department || 'None',
                status: status || 'None'
            },
            data: enrichedStudents
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Post interview announcement/round
 * @route   POST /api/placements/interview-announcement
 * @access  Private/Coordinator
 */
const postInterviewAnnouncement = async (req, res, next) => {
    try {
        const { title, description, roundNumber, date, venue, companies } = req.body;

        const announcement = await Announcement.create({
            title: `Interview Round ${roundNumber || 1}: ${title}`,
            content: description,
            department: req.user.department,
            postedBy: req.user._id,
            type: 'interview',
            metadata: {
                roundNumber: roundNumber || 1,
                interviewDate: date,
                venue,
                companies: companies || [],
                startTime: new Date(date)
            }
        });

        res.status(201).json({ 
            success: true, 
            message: `Interview Round ${roundNumber || 1} announced successfully`,
            data: announcement 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get interview announcements
 * @route   GET /api/placements/interview-announcements
 * @access  Private
 */
const getInterviewAnnouncements = async (req, res, next) => {
    try {
        const announcements = await Announcement.find({ type: 'interview' })
            .populate('postedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: announcements.length,
            data: announcements
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update student placement eligibility status
 * @route   PUT /api/placements/student/:studentId/eligibility
 * @access  Private/Coordinator
 */
const updateStudentEligibility = async (req, res, next) => {
    try {
        const User = require('../models/User');
        const { studentId } = req.params;
        const { isPlacementEligible, notes } = req.body;

        const student = await User.findByIdAndUpdate(
            studentId,
            { 
                isPlacementEligible,
                placementNotes: notes 
            },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({
            success: true,
            message: `Student eligibility status updated: ${isPlacementEligible ? 'Eligible' : 'Not Eligible'}`,
            data: student
        });
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
    getJobRecommendations,
    getEligibleStudents,
    postInterviewAnnouncement,
    getInterviewAnnouncements,
    updateStudentEligibility
};
