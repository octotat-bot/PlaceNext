const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

/**
 * Create database indexes for optimal query performance
 */
const createIndexes = async () => {
    try {
        logger.info('Creating database indexes...');

        // User indexes
        const User = mongoose.model('User');
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ role: 1 });
        await User.collection.createIndex({ accountStatus: 1 });
        await User.collection.createIndex({ emailVerified: 1 });
        await User.collection.createIndex({ createdAt: -1 });

        // StudentProfile indexes
        const StudentProfile = mongoose.model('StudentProfile');
        await StudentProfile.collection.createIndex({ userId: 1 }, { unique: true });
        // rollNumber index is auto-created by Mongoose schema (unique: true) — do not redefine here
        await StudentProfile.collection.createIndex({ branch: 1 });
        await StudentProfile.collection.createIndex({ semester: 1 });
        await StudentProfile.collection.createIndex({ cgpa: -1 });
        await StudentProfile.collection.createIndex({ skills: 1 });

        // Company indexes
        const Company = mongoose.model('Company');
        await Company.collection.createIndex({ companyName: 1 });
        await Company.collection.createIndex({ industry: 1 });
        await Company.collection.createIndex({ createdAt: -1 });

        // Drive indexes
        const Drive = mongoose.model('Drive');
        await Drive.collection.createIndex({ companyId: 1 });
        await Drive.collection.createIndex({ driveStatus: 1 });
        await Drive.collection.createIndex({ jobType: 1 });
        await Drive.collection.createIndex({ applicationDeadline: 1 });
        await Drive.collection.createIndex({ createdAt: -1 });
        await Drive.collection.createIndex({ 'eligibilityCriteria.allowedBranches': 1 });
        await Drive.collection.createIndex({ 'eligibilityCriteria.minCGPA': 1 });

        // Application indexes
        const Application = mongoose.model('Application');
        await Application.collection.createIndex({ studentId: 1 });
        await Application.collection.createIndex({ driveId: 1 });
        await Application.collection.createIndex({ userId: 1 });
        await Application.collection.createIndex({ applicationStatus: 1 });
        await Application.collection.createIndex({ createdAt: -1 });
        await Application.collection.createIndex(
            { studentId: 1, driveId: 1 },
            { unique: true }
        );

        // Notification indexes
        try {
            const Notification = mongoose.model('Notification');
            await Notification.collection.createIndex({ userId: 1 });
            await Notification.collection.createIndex({ isRead: 1 });
            await Notification.collection.createIndex({ createdAt: -1 });
            await Notification.collection.createIndex(
                { createdAt: 1 },
                { expireAfterSeconds: 30 * 24 * 60 * 60 } // Auto-delete after 30 days
            );
        } catch (e) {
            // Notification model might not exist yet
        }

        logger.info('Database indexes created successfully');
    } catch (error) {
        logger.error('Error creating database indexes', { error: error.message });
        // Don't throw - indexes are optimizations, not critical
    }
};

module.exports = createIndexes;
