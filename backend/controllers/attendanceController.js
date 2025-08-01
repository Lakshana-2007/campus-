const Attendance = require('../models/Attendance');
const User = require('../models/User');

/**
 * @desc    Mark attendance for multiple students
 * @route   POST /api/attendance/mark
 */
const markAttendance = async (req, res, next) => {
    try {
        const { date, records } = req.body; // records: [{studentId, status}]
        const facultyId = req.user._id;

        if (!records || !Array.isArray(records)) {
            return res.status(400).json({ success: false, message: 'Invalid records format' });
        }

        const attendancePromises = records.map(async (record) => {
            // Update or create attendance
            const att = await Attendance.findOneAndUpdate(
                { studentId: record.studentId, date: new Date(date), facultyId },
                { status: record.status },
                { upsert: true, new: true }
            );

            // Calculate new attendance rate for student
            const totalClasses = await Attendance.countDocuments({ studentId: record.studentId });
            const presentClasses = await Attendance.countDocuments({ studentId: record.studentId, status: 'Present' });
            const rate = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 100;

            await User.findByIdAndUpdate(record.studentId, { attendanceRate: Math.round(rate) });
            return att;
        });

        const results = await Promise.all(attendancePromises);

        res.status(201).json({ success: true, count: results.length, data: results });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get student's attendance records
 * @route   GET /api/attendance/my-attendance
 */
const getMyAttendance = async (req, res, next) => {
    try {
        const records = await Attendance.find({ studentId: req.user._id })
            .populate('facultyId', 'name')
            .sort({ date: -1 });

        res.json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get attendance records for a class (faculty only)
 * @route   GET /api/attendance/faculty
 */
const getFacultyAttendance = async (req, res, next) => {
    try {
        const records = await Attendance.find({ facultyId: req.user._id })
            .populate('studentId', 'name email department')
            .sort({ date: -1 });

        res.json({ success: true, count: records.length, data: records });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    markAttendance,
    getMyAttendance,
    getFacultyAttendance
};
