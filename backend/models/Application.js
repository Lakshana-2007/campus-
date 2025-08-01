const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: true,
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        resumeURL: {
            type: String,
            required: [true, 'Resume URL is required'],
        },
        status: {
            type: String,
            enum: ['Applied', 'Shortlisted', 'Rejected', 'Selected'],
            default: 'Applied',
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Application', applicationSchema);
