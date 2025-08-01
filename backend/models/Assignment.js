const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Assignment title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Assignment description is required'],
            maxlength: [5000, 'Description cannot exceed 5000 characters'],
        },
        deadline: {
            type: Date,
            required: [true, 'Deadline is required'],
        },
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Virtual for submission count (populated on query)
assignmentSchema.virtual('submissions', {
    ref: 'Submission',
    localField: '_id',
    foreignField: 'assignmentId',
});

assignmentSchema.set('toJSON', { virtuals: true });
assignmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
