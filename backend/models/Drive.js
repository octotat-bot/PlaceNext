const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
        },
        roleTitle: {
            type: String,
            required: [true, 'Please provide role title'],
            trim: true,
        },
        roleDescription: {
            type: String,
            required: [true, 'Please provide role description'],
        },
        jobType: {
            type: String,
            required: true,
            enum: ['internship', 'full-time', 'both'],
        },
        package: {
            type: Number, // LPA for full-time
        },
        stipend: {
            type: Number, // Monthly for internship
        },
        location: {
            type: String,
            required: true,
        },
        workMode: {
            type: String,
            enum: ['onsite', 'remote', 'hybrid'],
            default: 'onsite',
        },
        eligibilityCriteria: {
            minCGPA: {
                type: Number,
                required: true,
                min: 0,
                max: 10,
            },
            allowedBranches: [
                {
                    type: String,
                    enum: [
                        'Computer Science',
                        'Information Technology',
                        'Electronics',
                        'Electrical',
                        'Mechanical',
                        'Civil',
                        'Chemical',
                        'Biotechnology',
                        'Other',
                        'All',
                    ],
                },
            ],
            requiredSkills: [String],
            maxBacklogs: {
                type: Number,
                default: 0,
            },
            minSemester: {
                type: Number,
                default: 1,
            },
        },
        applicationDeadline: {
            type: Date,
            required: true,
        },
        driveDate: {
            type: Date,
        },
        driveStatus: {
            type: String,
            enum: ['active', 'closed', 'completed', 'cancelled'],
            default: 'active',
        },
        selectionProcess: [
            {
                round: Number,
                name: String, // e.g., "Online Test", "Technical Interview", "HR Interview"
                description: String,
            },
        ],
        numberOfOpenings: {
            type: Number,
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        applicantCount: {
            type: Number,
            default: 0,
        },
        selectedCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for searching
driveSchema.index({ roleTitle: 'text', roleDescription: 'text' });

module.exports = mongoose.model('Drive', driveSchema);
