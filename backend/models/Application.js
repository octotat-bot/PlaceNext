const mongoose = require('mongoose');

const interviewDetailsSchema = new mongoose.Schema({
    date: Date,
    time: String,
    venue: String,
    meetingLink: String,
    round: {
        type: Number,
        default: 1,
    },
    roundName: String,
});

const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['applied', 'under-review', 'shortlisted', 'interview-scheduled', 'selected', 'rejected', 'withdrawn'],
    },
    changedAt: {
        type: Date,
        default: Date.now,
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    notes: String,
});

const applicationSchema = new mongoose.Schema(
    {
        driveId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Drive',
            required: true,
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StudentProfile',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        applicationStatus: {
            type: String,
            enum: ['applied', 'under-review', 'shortlisted', 'interview-scheduled', 'selected', 'rejected', 'withdrawn'],
            default: 'applied',
        },
        resumeUrl: {
            type: String,
            required: true,
        },
        resumeScore: {
            type: Number,
            min: 0,
            max: 100,
        },
        coverLetter: {
            type: String,
            maxlength: 1000,
        },
        interviewDetails: [interviewDetailsSchema],
        statusHistory: [statusHistorySchema],
        adminNotes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate applications
applicationSchema.index({ driveId: 1, studentId: 1 }, { unique: true });

// Only auto-add to status history for new documents without existing history.
// Controllers handle adding detailed history entries (with changedBy, notes) themselves.
applicationSchema.pre('save', function () {
    if (this.isNew && this.statusHistory.length === 0) {
        this.statusHistory.push({
            status: this.applicationStatus,
            changedAt: new Date(),
        });
    }
});

module.exports = mongoose.model('Application', applicationSchema);
