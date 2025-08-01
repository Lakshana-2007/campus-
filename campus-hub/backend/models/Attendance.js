const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['Present', 'Absent'],
            required: true,
        },
        remarks: {
            type: String,
            trim: true,
        }
    },
    {
        timestamps: true,
    }
);

// Index for efficient lookup
attendanceSchema.index({ studentId: 1, date: -1 });
attendanceSchema.index({ facultyId: 1, date: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
