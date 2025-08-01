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

/**
 * @desc    Predict student attendance for next 4 weeks
 * @route   GET /api/attendance/predict/:studentId
 * @access  Private
 */
const predictAttendance = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Get last 60 days of attendance
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        const historicalRecords = await Attendance.find({
            studentId,
            date: { $gte: sixtyDaysAgo }
        }).sort({ date: 1 });

        if (historicalRecords.length === 0) {
            return res.json({
                success: true,
                data: {
                    studentId,
                    name: student.name,
                    prediction: { absence_risk: 'LOW', confidence: 0.5 },
                    message: 'Insufficient historical data for prediction',
                    forecast: []
                }
            });
        }

        // Calculate attendance pattern metrics
        const totalDays = historicalRecords.length;
        const presentDays = historicalRecords.filter(r => r.status === 'Present').length;
        const absentDays = totalDays - presentDays;
        const attendanceRate = (presentDays / totalDays) * 100;

        // Pattern analysis: Check last 2 weeks trend
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const recentRecords = await Attendance.find({
            studentId,
            date: { $gte: twoWeeksAgo }
        });
        const recentAttendanceRate = recentRecords.length > 0 
            ? (recentRecords.filter(r => r.status === 'Present').length / recentRecords.length) * 100 
            : attendanceRate;

        // Determine risk level
        let riskLevel = 'LOW';
        let confidence = Math.min(100, (totalDays / 30) * 100);
        
        if (attendanceRate < 60) {
            riskLevel = 'CRITICAL';
        } else if (attendanceRate < 75) {
            riskLevel = 'HIGH';
        } else if (attendanceRate < 85) {
            riskLevel = 'MEDIUM';
        }

        // Trend detection
        const trendDeterioration = recentAttendanceRate < attendanceRate - 10;

        // Generate 4-week forecast
        const forecast = [];
        for (let week = 1; week <= 4; week++) {
            const baseProbability = attendanceRate / 100;
            const trendAdjustment = trendDeterioration ? -0.05 : 0.02;
            const predictedRate = Math.max(0, Math.min(100, (baseProbability + trendAdjustment) * 100));
            
            forecast.push({
                week,
                predictedAttendanceRate: Math.round(predictedRate),
                recommendation: predictedRate < 75 ? 'Needs intervention' : 'On track'
            });
        }

        res.json({
            success: true,
            data: {
                studentId,
                name: student.name,
                currentAttendance: Math.round(attendanceRate),
                recentTrend: Math.round(recentAttendanceRate),
                prediction: {
                    absence_risk: riskLevel,
                    confidence: Math.round(confidence),
                    trend: trendDeterioration ? 'DECLINING' : 'STABLE',
                    totalClassesTracked: totalDays,
                    presentCount: presentDays,
                    absentCount: absentDays
                },
                forecast,
                recommendations: riskLevel === 'CRITICAL' 
                    ? ['Immediate intervention required', 'Contact student and parents']
                    : riskLevel === 'HIGH'
                    ? ['Monitor closely', 'Schedule counseling session']
                    : ['Continue monitoring', 'Encourage participation']
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    markAttendance,
    getMyAttendance,
    getFacultyAttendance,
    predictAttendance
};
