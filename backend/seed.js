const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const Company = require('./models/Company');
const Drive = require('./models/Drive');

const connectDB = require('./config/db');

const seedData = async () => {
    try {
        await connectDB();

        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await StudentProfile.deleteMany({});
        await Company.deleteMany({});
        await Drive.deleteMany({});

        console.log('👤 Creating admin user...');
        const adminUser = await User.create({
            email: 'admin@placement.com',
            password: 'admin123',
            role: 'admin',
        });

        console.log('📚 Creating sample students...');
        const students = [];
        const studentProfiles = [];

        const studentData = [
            { email: 'john.doe@student.edu', name: 'John Doe', rollNumber: 'CS2021001', branch: 'Computer Science', semester: 6, cgpa: 8.5, skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'] },
            { email: 'jane.smith@student.edu', name: 'Jane Smith', rollNumber: 'IT2021002', branch: 'Information Technology', semester: 6, cgpa: 9.2, skills: ['Java', 'Spring Boot', 'MySQL', 'AWS'] },
            { email: 'mike.wilson@student.edu', name: 'Mike Wilson', rollNumber: 'CS2021003', branch: 'Computer Science', semester: 4, cgpa: 7.8, skills: ['Python', 'Django', 'PostgreSQL', 'Docker'] },
            { email: 'sarah.connor@student.edu', name: 'Sarah Connor', rollNumber: 'EC2021004', branch: 'Electronics', semester: 6, cgpa: 8.9, skills: ['C++', 'Embedded Systems', 'VLSI', 'Arduino'] },
            { email: 'alex.kumar@student.edu', name: 'Alex Kumar', rollNumber: 'ME2021005', branch: 'Mechanical', semester: 6, cgpa: 7.2, skills: ['AutoCAD', 'SolidWorks', 'MATLAB'] },
            { email: 'priya.sharma@student.edu', name: 'Priya Sharma', rollNumber: 'CS2021006', branch: 'Computer Science', semester: 8, cgpa: 9.5, skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'GraphQL', 'AWS'] },
            { email: 'rahul.gupta@student.edu', name: 'Rahul Gupta', rollNumber: 'IT2021007', branch: 'Information Technology', semester: 6, cgpa: 6.8, skills: ['PHP', 'Laravel', 'MySQL'], backlogs: 1 },
            { email: 'neha.patel@student.edu', name: 'Neha Patel', rollNumber: 'CS2021008', branch: 'Computer Science', semester: 6, cgpa: 8.1, skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science'] },
        ];

        for (const data of studentData) {
            const user = await User.create({
                email: data.email,
                password: 'student123',
                role: 'student',
            });
            students.push(user);

            const profile = await StudentProfile.create({
                userId: user._id,
                name: data.name,
                rollNumber: data.rollNumber,
                branch: data.branch,
                semester: data.semester,
                cgpa: data.cgpa,
                backlogs: data.backlogs || 0,
                phone: '9876543210',
                skills: data.skills,
                projects: [
                    {
                        title: 'Sample Project',
                        description: 'A sample project demonstrating skills',
                        technologies: data.skills.slice(0, 3),
                        github: 'https://github.com/sample/project',
                    },
                ],
                socialLinks: {
                    github: 'https://github.com/' + data.name.toLowerCase().replace(' ', ''),
                    linkedin: 'https://linkedin.com/in/' + data.name.toLowerCase().replace(' ', ''),
                },
                about: `I am a ${data.branch} student passionate about technology and innovation.`,
            });
            studentProfiles.push(profile);
        }

        console.log('🏢 Creating companies...');
        const companies = await Company.insertMany([
            {
                companyName: 'Google',
                industry: 'Technology',
                website: 'https://google.com',
                description: 'Google LLC is an American multinational technology company that focuses on search engine technology, online advertising, cloud computing, computer software, and AI.',
                headquarters: 'Mountain View, California',
                employeeCount: '1000+',
                contactPerson: { name: 'HR Team', email: 'hr@google.com' },
                createdBy: adminUser._id,
            },
            {
                companyName: 'Microsoft',
                industry: 'Technology',
                website: 'https://microsoft.com',
                description: 'Microsoft Corporation develops, licenses, and supports a wide range of software products, computing devices, and services.',
                headquarters: 'Redmond, Washington',
                employeeCount: '1000+',
                contactPerson: { name: 'Recruitment Team', email: 'recruit@microsoft.com' },
                createdBy: adminUser._id,
            },
            {
                companyName: 'Amazon',
                industry: 'E-commerce',
                website: 'https://amazon.com',
                description: 'Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, and artificial intelligence.',
                headquarters: 'Seattle, Washington',
                employeeCount: '1000+',
                contactPerson: { name: 'Campus Team', email: 'campus@amazon.com' },
                createdBy: adminUser._id,
            },
            {
                companyName: 'Infosys',
                industry: 'Consulting',
                website: 'https://infosys.com',
                description: 'Infosys Limited is an Indian multinational information technology company that provides business consulting, technology, and outsourcing services.',
                headquarters: 'Bangalore, India',
                employeeCount: '1000+',
                contactPerson: { name: 'HR', email: 'hr@infosys.com' },
                createdBy: adminUser._id,
            },
            {
                companyName: 'Goldman Sachs',
                industry: 'Finance',
                website: 'https://goldmansachs.com',
                description: 'The Goldman Sachs Group, Inc. is an American multinational investment bank and financial services company.',
                headquarters: 'New York City',
                employeeCount: '1000+',
                contactPerson: { name: 'Campus Recruitment', email: 'campus@gs.com' },
                createdBy: adminUser._id,
            },
            {
                companyName: 'TCS',
                industry: 'Technology',
                website: 'https://tcs.com',
                description: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company.',
                headquarters: 'Mumbai, India',
                employeeCount: '1000+',
                contactPerson: { name: 'HR Team', email: 'hr@tcs.com' },
                createdBy: adminUser._id,
            },
        ]);

        console.log('📋 Creating placement drives...');
        const drives = await Drive.insertMany([
            {
                companyId: companies[0]._id, // Google
                roleTitle: 'Software Engineer',
                roleDescription: 'Join Google as a Software Engineer and work on cutting-edge technology that impacts billions of users. You will design, develop, test, and deploy software solutions.',
                jobType: 'full-time',
                package: 25,
                location: 'Bangalore',
                workMode: 'hybrid',
                eligibilityCriteria: {
                    minCGPA: 8.0,
                    allowedBranches: ['Computer Science', 'Information Technology'],
                    requiredSkills: ['Data Structures', 'Algorithms', 'Problem Solving'],
                    maxBacklogs: 0,
                    minSemester: 6,
                },
                applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                driveStatus: 'active',
                selectionProcess: [
                    { round: 1, name: 'Online Coding Test', description: '90 minutes coding test with 3 DSA problems' },
                    { round: 2, name: 'Technical Interview 1', description: 'Data Structures and Algorithms' },
                    { round: 3, name: 'Technical Interview 2', description: 'System Design and Projects' },
                    { round: 4, name: 'HR Interview', description: 'Behavioral and culture fit' },
                ],
                numberOfOpenings: 10,
                postedBy: adminUser._id,
            },
            {
                companyId: companies[1]._id, // Microsoft
                roleTitle: 'Software Development Engineer',
                roleDescription: 'Be part of Microsoft and build products that empower every person and organization on the planet.',
                jobType: 'full-time',
                package: 22,
                location: 'Hyderabad',
                workMode: 'hybrid',
                eligibilityCriteria: {
                    minCGPA: 7.5,
                    allowedBranches: ['Computer Science', 'Information Technology', 'Electronics'],
                    requiredSkills: ['C++', 'Java', 'Problem Solving'],
                    maxBacklogs: 0,
                    minSemester: 6,
                },
                applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                driveStatus: 'active',
                selectionProcess: [
                    { round: 1, name: 'Online Assessment', description: 'Coding and MCQ test' },
                    { round: 2, name: 'Technical Interview', description: 'Problem Solving and Coding' },
                    { round: 3, name: 'AA Interview', description: 'As Appropriate Interview with Senior Engineer' },
                    { round: 4, name: 'HR Discussion', description: 'Final discussion' },
                ],
                numberOfOpenings: 15,
                postedBy: adminUser._id,
            },
            {
                companyId: companies[2]._id, // Amazon
                roleTitle: 'SDE Intern',
                roleDescription: 'Summer internship program at Amazon. Work on real projects that impact millions of customers.',
                jobType: 'internship',
                stipend: 80000,
                location: 'Bangalore',
                workMode: 'onsite',
                eligibilityCriteria: {
                    minCGPA: 7.0,
                    allowedBranches: ['Computer Science', 'Information Technology'],
                    requiredSkills: ['DSA', 'Any Programming Language'],
                    maxBacklogs: 0,
                    minSemester: 4,
                },
                applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                driveStatus: 'active',
                selectionProcess: [
                    { round: 1, name: 'Online Assessment', description: '3 coding questions + work simulation' },
                    { round: 2, name: 'Technical Interview', description: 'LP questions + DSA' },
                ],
                numberOfOpenings: 20,
                postedBy: adminUser._id,
            },
            {
                companyId: companies[3]._id, // Infosys
                roleTitle: 'System Engineer',
                roleDescription: 'Join Infosys as a System Engineer and work on enterprise projects for global clients.',
                jobType: 'full-time',
                package: 6.5,
                location: 'Multiple Locations',
                workMode: 'onsite',
                eligibilityCriteria: {
                    minCGPA: 6.0,
                    allowedBranches: ['All'],
                    requiredSkills: [],
                    maxBacklogs: 0,
                    minSemester: 6,
                },
                applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
                driveStatus: 'active',
                selectionProcess: [
                    { round: 1, name: 'Online Test', description: 'Aptitude, Logical Reasoning, Verbal' },
                    { round: 2, name: 'Technical Interview', description: 'Technical and Programming concepts' },
                    { round: 3, name: 'HR Interview', description: 'General HR round' },
                ],
                numberOfOpenings: 100,
                postedBy: adminUser._id,
            },
            {
                companyId: companies[4]._id, // Goldman Sachs
                roleTitle: 'Summer Analyst',
                roleDescription: 'Join Goldman Sachs for a 10-week summer internship program in the Engineering Division.',
                jobType: 'internship',
                stipend: 100000,
                location: 'Bangalore',
                workMode: 'hybrid',
                eligibilityCriteria: {
                    minCGPA: 8.0,
                    allowedBranches: ['Computer Science', 'Information Technology', 'Electronics', 'Electrical'],
                    requiredSkills: ['Programming', 'Problem Solving'],
                    maxBacklogs: 0,
                    minSemester: 4,
                },
                applicationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
                driveStatus: 'active',
                selectionProcess: [
                    { round: 1, name: 'HackerRank Test', description: 'Coding assessment' },
                    { round: 2, name: 'Coderpad Interview', description: 'Live coding interview' },
                    { round: 3, name: 'Fit Interview', description: 'Culture fit and behavioral' },
                ],
                numberOfOpenings: 8,
                postedBy: adminUser._id,
            },
            {
                companyId: companies[5]._id, // TCS
                roleTitle: 'Assistant System Engineer',
                roleDescription: 'Mass hiring for freshers. Join TCS Digital and work on latest technologies.',
                jobType: 'full-time',
                package: 7,
                location: 'Pan India',
                workMode: 'hybrid',
                eligibilityCriteria: {
                    minCGPA: 6.0,
                    allowedBranches: ['All'],
                    requiredSkills: [],
                    maxBacklogs: 1,
                    minSemester: 6,
                },
                applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                driveStatus: 'active',
                selectionProcess: [
                    { round: 1, name: 'TCS NQT', description: 'National Qualifier Test' },
                    { round: 2, name: 'Technical Interview', description: 'Technical discussion' },
                    { round: 3, name: 'Managerial Interview', description: 'Final round' },
                ],
                numberOfOpenings: 200,
                postedBy: adminUser._id,
            },
        ]);

        console.log('\n✅ Seed data created successfully!\n');
        console.log('📋 Login Credentials:');
        console.log('─────────────────────────────────────────');
        console.log('Admin:');
        console.log('  Email: admin@placement.com');
        console.log('  Password: admin123');
        console.log('');
        console.log('Sample Students (Password: student123):');
        studentData.forEach((s) => {
            console.log(`  ${s.name}: ${s.email}`);
        });
        console.log('─────────────────────────────────────────');
        console.log(`\n📊 Created: ${students.length} students, ${companies.length} companies, ${drives.length} drives\n`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
