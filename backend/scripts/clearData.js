const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const ChatSession = require('../models/ChatSession');
const Notification = require('../models/Notification');
const ResumeReview = require('../models/ResumeReview');

const connectDB = require('../config/db');

const clearData = async () => {
    try {
        await connectDB();

        console.log('🗑️  Clearing ALL data from the database...\n');

        // Clear all collections
        const results = await Promise.all([
            User.deleteMany({}),
            StudentProfile.deleteMany({}),
            Company.deleteMany({}),
            Drive.deleteMany({}),
            Application.deleteMany({}),
            ChatSession.deleteMany({}),
            Notification.deleteMany({}),
            ResumeReview.deleteMany({}),
        ]);

        const collectionNames = [
            'Users',
            'StudentProfiles',
            'Companies',
            'Drives',
            'Applications',
            'ChatSessions',
            'Notifications',
            'ResumeReviews',
        ];

        console.log('Deleted documents:');
        console.log('─────────────────────────────────────────');
        results.forEach((result, index) => {
            console.log(`  ${collectionNames[index]}: ${result.deletedCount} documents`);
        });
        console.log('─────────────────────────────────────────');

        const totalDeleted = results.reduce((sum, r) => sum + r.deletedCount, 0);
        console.log(`\n✅ Successfully cleared ${totalDeleted} documents from the database!`);
        console.log('🆕 The app is now ready for fresh testing.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing data:', error);
        process.exit(1);
    }
};

clearData();
