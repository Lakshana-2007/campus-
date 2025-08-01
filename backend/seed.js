const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const Job = require('./models/Job');
const Resume = require('./models/Resume');
const Announcement = require('./models/Announcement');
const InterviewList = require('./models/InterviewList');
const fs = require('fs');
const path = require('path');

dotenv.config();

const seedData = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/campushub';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);

        const Attendance = require('./models/Attendance');
        const Chat = require('./models/Chat');
        const ConnectionRequest = require('./models/ConnectionRequest');

        // Clear existing data
        await User.deleteMany({});
        await Assignment.deleteMany({});
        await Submission.deleteMany({});
        await Job.deleteMany({});
        await Resume.deleteMany({});
        await Announcement.deleteMany({});
        await InterviewList.deleteMany({});
        await Attendance.deleteMany({});
        await Chat.deleteMany({});
        await ConnectionRequest.deleteMany({});
        console.log('Cleared existing data (including Attendance, Chat, and Connections).');

        // Create Users
        const faculty = await User.create({
            name: 'Dr. Sarah Smith',
            email: 'faculty@campus.edu',
            password: 'password123',
            role: 'faculty',
            department: 'Computer Science'
        });

        const student = await User.create({
            name: 'John Doe',
            email: 'student@campus.edu',
            password: 'password123',
            role: 'student',
            department: 'Computer Science',
            cgpa: 8.5,
            semester: 6
        });

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@campus.edu',
            password: 'password123',
            role: 'admin',
            department: 'Administration'
        });

        const coordinator = await User.create({
            name: 'Mr. Placement',
            email: 'coordinator@campus.edu',
            password: 'password123',
            role: 'placement_coordinator',
            department: 'Computer Science'
        });

        const alumni = await User.create({
            name: 'Jane Alum',
            email: 'alumni@campus.edu',
            password: 'password123',
            role: 'alumni',
            department: 'Computer Science',
            linkedinURL: 'https://linkedin.com/in/janealum'
        });

        console.log('Created test users (Student, Faculty, Admin, Alumni, Coordinator).');

        // Create Resume for Student
        await Resume.create({
            studentId: student._id,
            skills: ['React', 'Node.js', 'MongoDB', 'Python'],
            projects: [{ title: 'Campus Hub', description: 'A platform for students and faculty.' }],
            certifications: [{ name: 'Full Stack Dev', issuer: 'Meta', date: new Date() }]
        });

        // Create Jobs
        const job1 = await Job.create({
            companyName: 'Tech Corp',
            role: 'Frontend Developer',
            description: 'Work on cutting edge React applications.',
            eligibilityCriteria: {
                minCGPA: 7.5,
                allowedDepartments: ['Computer Science'],
                minSemester: 5
            },
            packageDetails: { salary: 1500000, type: 'CTC' },
            applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            postedBy: admin._id,
            department: 'Computer Science'
        });

        const job2 = await Job.create({
            companyName: 'Data Systems',
            role: 'Backend Intern',
            description: 'Learn Node.js and MongoDB in a fast-paced environment.',
            eligibilityCriteria: {
                minCGPA: 8.0,
                allowedDepartments: ['Computer Science', 'IT'],
                minSemester: 4
            },
            packageDetails: { salary: 25000, type: 'Internship' },
            applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            postedBy: faculty._id,
            department: 'Computer Science'
        });

        // Create Announcement
        await Announcement.create({
            title: 'Welcome to the Placement Hub!',
            content: 'Check out the new job opportunities and daily interview schedules.',
            department: 'Computer Science',
            postedBy: faculty._id
        });

        // Create Interview List
        await InterviewList.create({
            date: new Date(),
            companyName: 'Tech Corp',
            students: [{ studentId: student._id, timeSlot: '10:00 AM', venue: 'Room 302' }],
            department: 'Computer Science',
            postedBy: faculty._id
        });

        console.log('Created placement and alumni seed data.');

        // Create Assignments
        const a1 = await Assignment.create({
            title: 'Modern Web Architectures',
            description: 'Write a 2-page report on the evolution of microservices vs monolithic architectures. Focus on scalability and developer experience.',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            facultyId: faculty._id
        });

        const a2 = await Assignment.create({
            title: 'AI Ethics and Society',
            description: 'Analyze the impact of LLMs on academic integrity. Discuss mitigation strategies and the role of AI in future classrooms.',
            deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (LATE)
            facultyId: faculty._id
        });

        console.log('Created test assignments.');

        // Create Submissions
        // Ensure uploads directory exists
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

        // Create dummy files for text extraction testing
        const dummyPdfPath = path.join(uploadDir, 'demo-submission.txt');
        fs.writeFileSync(dummyPdfPath, 'This is a demo submission about web architectures. Microservices provide scalability and modularity, whereas monolithic architectures are often easier to deploy and test initially. However, as systems grow, the complexity of a monolith can become a bottleneck.');

        const s1 = await Submission.create({
            assignmentId: a1._id,
            studentId: student._id,
            fileUrl: '/uploads/demo-submission.txt',
            originalFileName: 'report_v1.txt',
            submittedAt: new Date(),
            similarityScore: 12,
            aiInsights: {
                qualityScore: 85,
                integrityScore: 95,
                riskLevel: 'Low',
                analysisSummary: 'High quality technical report with clear distinctions between architectural patterns. No signs of plagiarism.'
            }
        });

        const s2 = await Submission.create({
            assignmentId: a2._id,
            studentId: student._id,
            fileUrl: '/uploads/demo-submission.txt',
            originalFileName: 'ai_ethics.txt',
            submittedAt: new Date(), // This will be late since a2 deadline was 2 days ago
            similarityScore: 45, // High similarity
            aiInsights: {
                qualityScore: 40,
                integrityScore: 55,
                riskLevel: 'Medium',
                analysisSummary: 'Report shows high similarity with online sources. Tone is inconsistent with student level.'
            }
        });

        console.log('Created test submissions (including late and high similarity cases).');

        // Create a student at risk for demo
        const riskStudent = await User.create({
            name: 'Risk Student',
            email: 'risk@campus.edu',
            password: 'password123',
            role: 'student',
            department: 'Computer Science',
            cgpa: 5.2,
            semester: 4,
            attendanceRate: 62
        });

        await Submission.create({
            assignmentId: a2._id,
            studentId: riskStudent._id,
            fileUrl: '/uploads/demo-submission.txt',
            originalFileName: 'bad_report.txt',
            submittedAt: new Date(),
            similarityScore: 82, // Very high
            aiInsights: {
                qualityScore: 20,
                integrityScore: 10,
                riskLevel: 'High',
                analysisSummary: 'Plagiarism detected.'
            }
        });

        // Create Attendance Records
        const today = new Date();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

        await Attendance.create([
            { studentId: student._id, facultyId: faculty._id, date: today, status: 'Present' },
            { studentId: student._id, facultyId: faculty._id, date: yesterday, status: 'Present' },
            { studentId: riskStudent._id, facultyId: faculty._id, date: today, status: 'Absent' },
            { studentId: riskStudent._id, facultyId: faculty._id, date: yesterday, status: 'Absent' }
        ]);
        console.log('Created test attendance records.');

        // Create Connection Request (Student to Alumni)
        await ConnectionRequest.create({
            studentId: student._id,
            alumniId: alumni._id,
            status: 'Accepted',
            message: 'I would like to learn about your career path.'
        });

        // Create P2P Chats
        const chat1 = await Chat.create({
            userId: student._id,
            receiverId: faculty._id,
            sessionTitle: `Chat: ${student.name} & ${faculty.name}`,
            isP2P: true,
            messages: [
                { role: 'user', content: 'Hello Professor, I have a question about the assignment.' },
                { role: 'assistant', content: 'Sure, John. What do you need help with?' }
            ]
        });

        const chat2 = await Chat.create({
            userId: student._id,
            receiverId: alumni._id,
            sessionTitle: `Chat: ${student.name} & ${alumni.name}`,
            isP2P: true,
            messages: [
                { role: 'user', content: 'Hi Jane, could you share some tips for placement preparation?' }
            ]
        });
        console.log('Created test P2P chats and connections.');

        console.log('Database seeded successfully! 🎉');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
