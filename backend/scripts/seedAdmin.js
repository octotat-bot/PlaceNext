/**
 * Admin Seeder Script
 * 
 * Use this script to create the initial super admin account.
 * Run with: node scripts/seedAdmin.js
 * 
 * The admin credentials can be set via environment variables or will use defaults.
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import the actual User model
const User = require('../models/User');

// Default admin credentials (can be overridden via environment)
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@placementcell.edu';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@123!';
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Placement Cell Admin';

async function seedAdmin() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

        if (existingAdmin) {
            console.log('⚠️  Admin account already exists!');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Role: ${existingAdmin.role}`);
            console.log('\n   To create a new admin, either:');
            console.log('   1. Delete the existing admin first');
            console.log('   2. Set SEED_ADMIN_EMAIL environment variable to a different email');
            process.exit(0);
        }


        // Create admin user (password will be hashed by the User model pre-save hook)
        const admin = await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin',
            accountStatus: 'approved',
            emailVerified: true,
            isActive: true,
        });

        console.log('\n🎉 Super Admin created successfully!\n');
        console.log('   ╔════════════════════════════════════════════╗');
        console.log('   ║         ADMIN LOGIN CREDENTIALS            ║');
        console.log('   ╠════════════════════════════════════════════╣');
        console.log(`   ║  Email:    ${ADMIN_EMAIL.padEnd(29)}║`);
        console.log(`   ║  Password: ${ADMIN_PASSWORD.padEnd(29)}║`);
        console.log('   ╚════════════════════════════════════════════╝');
        console.log('\n   ⚠️  IMPORTANT: Change the password after first login!\n');

    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('📤 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the seeder
seedAdmin();
