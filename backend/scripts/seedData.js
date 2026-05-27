/**
 * Seed Script - Generates sample data for testing
 * Run with: node scripts/seedData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Drive = require('../models/Drive');
const Application = require('../models/Application');

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

// Sample data
const studentData = [
    { name: 'Rahul Sharma', email: 'rahul@student.edu', branch: 'Computer Science', cgpa: 8.5, skills: ['JavaScript', 'React', 'Node.js', 'Python'] },
    { name: 'Priya Patel', email: 'priya@student.edu', branch: 'Computer Science', cgpa: 9.2, skills: ['Java', 'Spring Boot', 'MySQL', 'AWS'] },
    { name: 'Amit Kumar', email: 'amit@student.edu', branch: 'Information Technology', cgpa: 7.8, skills: ['Python', 'Django', 'PostgreSQL', 'Docker'] },
    { name: 'Sneha Gupta', email: 'sneha@student.edu', branch: 'Electronics', cgpa: 8.1, skills: ['C++', 'Embedded Systems', 'MATLAB', 'IoT'] },
    { name: 'Vikram Singh', email: 'vikram@student.edu', branch: 'Information Technology', cgpa: 8.9, skills: ['React', 'TypeScript', 'MongoDB', 'GraphQL'] },
    { name: 'Neha Reddy', email: 'neha@student.edu', branch: 'Computer Science', cgpa: 9.0, skills: ['Machine Learning', 'Python', 'TensorFlow', 'Deep Learning'] },
    { name: 'Arjun Verma', email: 'arjun@student.edu', branch: 'Mechanical', cgpa: 7.5, skills: ['AutoCAD', 'SolidWorks', 'ANSYS', 'Manufacturing'] },
    { name: 'Kavya Nair', email: 'kavya@student.edu', branch: 'Computer Science', cgpa: 8.7, skills: ['Full Stack', 'JavaScript', 'React', 'Node.js', 'MongoDB'] },
];

const driveData = [
    {
        roleTitle: 'Software Engineer',
        roleDescription: 'Join our engineering team to build scalable solutions using modern technologies.',
        jobType: 'full-time',
        package: 15,
        location: 'Mountain View, California',
        workMode: 'hybrid',
        minCGPA: 7.5,
        allowedBranches: ['Computer Science', 'Information Technology'],
    },
    {
        roleTitle: 'Data Analyst Intern',
        roleDescription: 'Work with our data science team on real-world analytics projects.',
        jobType: 'internship',
        stipend: 80000,
        location: 'Redmond, Washington',
        workMode: 'onsite',
        minCGPA: 7.0,
        allowedBranches: ['Computer Science', 'Information Technology', 'Electronics'],
    },
    {
        roleTitle: 'Product Development Engineer',
        roleDescription: 'Design and develop innovative products for our customers.',
        jobType: 'full-time',
        package: 18,
        location: 'Seattle, Washington',
        workMode: 'remote',
        minCGPA: 8.0,
        allowedBranches: ['Computer Science', 'Information Technology'],
    },
    {
        roleTitle: 'Associate Software Developer',
        roleDescription: 'Build enterprise solutions for fortune 500 clients.',
        jobType: 'full-time',
        package: 8,
        location: 'Bangalore, India',
        workMode: 'hybrid',
        minCGPA: 6.5,
        allowedBranches: ['Computer Science', 'Information Technology', 'Electronics', 'Electrical'],
    },
    {
        roleTitle: 'Technology Analyst',
        roleDescription: 'Join our consulting team working with global financial clients.',
        jobType: 'full-time',
        package: 22,
        location: 'New York City',
        workMode: 'onsite',
        minCGPA: 8.5,
        allowedBranches: ['Computer Science', 'Information Technology'],
    },
    {
        roleTitle: 'Full Stack Developer',
        roleDescription: 'Build and maintain web applications using modern tech stack.',
        jobType: 'full-time',
        package: 12,
        location: 'Mumbai, India',
        workMode: 'hybrid',
        minCGPA: 7.0,
        allowedBranches: ['Computer Science', 'Information Technology'],
    },
];

const applicationStatuses = ['applied', 'under-review', 'shortlisted', 'interview-scheduled', 'selected', 'rejected'];

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Get existing companies
        const companies = await Company.find();
        if (companies.length === 0) {
            console.log('❌ No companies found. Please create companies first.');
            process.exit(1);
        }
        console.log(`📦 Found ${companies.length} existing companies\n`);

        // Get an admin user for posting drives
        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('❌ No admin user found. Please create an admin user first.');
            process.exit(1);
        }
        console.log(`👤 Using admin: ${adminUser.email}\n`);

        // Create student users and profiles
        console.log('👥 Creating students...');
        const createdStudents = [];

        for (let i = 0; i < studentData.length; i++) {
            const student = studentData[i];

            // Check if user already exists
            let user = await User.findOne({ email: student.email });
            if (!user) {
                user = await User.create({
                    name: student.name,
                    email: student.email,
                    password: 'password123',
                    phone: `98${String(i + 10).padStart(8, '0')}`,
                    role: 'student',
                });
            }

            // Check if profile already exists
            let profile = await StudentProfile.findOne({ userId: user._id });
            if (!profile) {
                profile = await StudentProfile.create({
                    userId: user._id,
                    name: student.name,
                    rollNumber: `2024${String(i + 1).padStart(4, '0')}`,
                    branch: student.branch,
                    semester: Math.floor(Math.random() * 4) + 5, // 5-8
                    cgpa: student.cgpa,
                    backlogs: 0,
                    phone: `98${String(i + 10).padStart(8, '0')}`,
                    skills: student.skills,
                    resumeUrl: '/uploads/resumes/sample-resume.pdf',
                    about: `Final year ${student.branch} student passionate about technology and innovation.`,
                });
            }

            createdStudents.push({ user, profile });
            console.log(`   ✅ ${student.name} (${student.branch}, CGPA: ${student.cgpa})`);
        }
        console.log(`\n📊 Created/Found ${createdStudents.length} students\n`);

        // Create drives linked to existing companies
        console.log('🏢 Creating placement drives...');
        const createdDrives = [];

        for (let i = 0; i < driveData.length; i++) {
            const drive = driveData[i];
            const company = companies[i % companies.length]; // Cycle through companies

            // Calculate deadline (10-30 days from now)
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 20) + 10);

            // Check if drive already exists
            let existingDrive = await Drive.findOne({ companyId: company._id, roleTitle: drive.roleTitle });
            if (!existingDrive) {
                existingDrive = await Drive.create({
                    companyId: company._id,
                    roleTitle: drive.roleTitle,
                    roleDescription: drive.roleDescription,
                    jobType: drive.jobType,
                    package: drive.package,
                    stipend: drive.stipend,
                    location: drive.location,
                    workMode: drive.workMode,
                    eligibilityCriteria: {
                        minCGPA: drive.minCGPA,
                        allowedBranches: drive.allowedBranches,
                        maxBacklogs: 0,
                        minSemester: 5,
                    },
                    applicationDeadline: deadline,
                    driveStatus: 'active',
                    selectionProcess: [
                        { round: 1, name: 'Online Assessment', description: 'Aptitude and coding test' },
                        { round: 2, name: 'Technical Interview', description: 'Technical discussion' },
                        { round: 3, name: 'HR Interview', description: 'Final round' },
                    ],
                    numberOfOpenings: Math.floor(Math.random() * 20) + 5,
                    postedBy: adminUser._id,
                });
            }

            createdDrives.push(existingDrive);
            console.log(`   ✅ ${company.companyName} - ${drive.roleTitle}`);
        }
        console.log(`\n📊 Created/Found ${createdDrives.length} drives\n`);

        // Create applications
        console.log('📝 Creating applications...');
        let applicationCount = 0;

        for (const drive of createdDrives) {
            // Each drive gets 3-6 applications
            const numApplications = Math.floor(Math.random() * 4) + 3;
            const eligibleStudents = createdStudents.filter(s =>
                s.profile.cgpa >= drive.eligibilityCriteria.minCGPA &&
                (drive.eligibilityCriteria.allowedBranches.includes('All') ||
                    drive.eligibilityCriteria.allowedBranches.includes(s.profile.branch))
            );

            const selectedStudents = eligibleStudents.slice(0, Math.min(numApplications, eligibleStudents.length));

            for (const student of selectedStudents) {
                // Check if application already exists
                const existingApp = await Application.findOne({
                    driveId: drive._id,
                    studentId: student.profile._id
                });

                if (!existingApp) {
                    const randomStatus = applicationStatuses[Math.floor(Math.random() * applicationStatuses.length)];
                    const createdDate = new Date();
                    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 25)); // Random date in last 25 days

                    const app = await Application.create({
                        driveId: drive._id,
                        studentId: student.profile._id,
                        userId: student.user._id,
                        applicationStatus: randomStatus,
                        resumeUrl: student.profile.resumeUrl || '/uploads/resumes/sample-resume.pdf',
                        resumeScore: Math.floor(Math.random() * 40) + 60, // 60-100
                        coverLetter: `I am excited to apply for the ${drive.roleTitle} position. With my background in ${student.profile.branch} and skills in ${student.profile.skills.slice(0, 3).join(', ')}, I believe I would be a great fit.`,
                    });

                    // Update the createdAt manually for realistic date spread
                    await Application.updateOne({ _id: app._id }, { $set: { createdAt: createdDate } });

                    applicationCount++;
                }
            }
        }
        console.log(`   ✅ Created ${applicationCount} new applications\n`);

        // Update drive applicant counts
        console.log('📊 Updating drive statistics...');
        for (const drive of createdDrives) {
            const count = await Application.countDocuments({ driveId: drive._id });
            const selectedCount = await Application.countDocuments({
                driveId: drive._id,
                applicationStatus: 'selected'
            });

            await Drive.findByIdAndUpdate(drive._id, {
                applicantCount: count,
                selectedCount: selectedCount
            });
        }
        console.log('   ✅ Drive statistics updated\n');

        // Summary
        console.log('='.repeat(50));
        console.log('🎉 SEEDING COMPLETE!');
        console.log('='.repeat(50));
        console.log(`\n📊 Summary:`);
        console.log(`   • Students: ${createdStudents.length}`);
        console.log(`   • Drives: ${createdDrives.length}`);
        console.log(`   • Applications: ${applicationCount}`);
        console.log(`\n📧 Test login credentials:`);
        console.log(`   Email: rahul@student.edu`);
        console.log(`   Password: password123`);
        console.log(`\n✅ Refresh your dashboard to see the data!`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
};

// Run the script
connectDB().then(seedDatabase);
