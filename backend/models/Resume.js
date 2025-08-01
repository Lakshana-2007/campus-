const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        skills: {
            type: [String],
            default: [],
        },
        projects: [
            {
                title: String,
                description: String,
                link: String,
            },
        ],
        certifications: [
            {
                name: String,
                issuer: String,
                date: Date,
            },
        ],
        resumeScore: {
            type: Number,
            default: 0,
        },
        aiFeedback: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Resume', resumeSchema);
