const mongoose = require('mongoose');

const resumeReviewSchema = new mongoose.Schema(
    {
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
        resumeUrl: {
            type: String,
            required: true,
        },
        atsScore: {
            type: Number,
            min: 0,
            max: 100,
        },
        aiAnalysis: {
            strengths: [String],
            weaknesses: [String],
            suggestions: [String],
            missingKeywords: [String],
            improvedBullets: [String],
        },
        analyzedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('ResumeReview', resumeReviewSchema);
