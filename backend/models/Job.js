const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        role: {
            type: String,
            required: [true, 'Job role is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Job description is required'],
        },
        eligibilityCriteria: {
            minCGPA: {
                type: Number,
                default: 0,
            },
            allowedDepartments: {
                type: [String],
                required: [true, 'At least one department must be specified'],
            },
            minSemester: {
                type: Number,
                default: 1,
            },
        },
        packageDetails: {
            salary: {
                type: Number,
                required: [true, 'Salary/Package is required'],
            },
            type: {
                type: String,
                enum: ['CTC', 'Internship', 'PPO'],
                default: 'CTC',
            },
        },
        applicationDeadline: {
            type: Date,
            required: [true, 'Application deadline is required'],
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        department: {
            type: String,
            required: [true, 'Department is required for routing'],
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Job', jobSchema);
