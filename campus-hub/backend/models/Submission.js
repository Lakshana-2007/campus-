const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
    {
        assignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment',
            required: true,
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fileUrl: {
            type: String,
            required: [true, 'File is required'],
        },
        originalFileName: {
            type: String,
            required: true,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        isLate: {
            type: Boolean,
            default: false,
        },
        similarityScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        extractedText: {
            type: String,
            default: '',
            select: false,
        },
        aiInsights: {
            qualityScore: { type: Number, default: 0 },
            integrityScore: { type: Number, default: 0 },
            riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
            analysisSummary: { type: String, default: '' },
        },
    },
    {
        timestamps: true,
    }
);

// Auto-calculate isLate before saving
submissionSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('submittedAt')) {
        const Assignment = mongoose.model('Assignment');
        const assignment = await Assignment.findById(this.assignmentId);
        if (assignment) {
            this.isLate = this.submittedAt > assignment.deadline;
        }
    }
    next();
});

// Compound index to prevent duplicate submissions
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
