const mongoose = require('mongoose');

const interviewListSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: [true, 'Interview date is required'],
        },
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
        },
        students: [
            {
                studentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                timeSlot: String,
                venue: String,
            },
        ],
        department: {
            type: String,
            required: [true, 'Department is required'],
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('InterviewList', interviewListSchema);
