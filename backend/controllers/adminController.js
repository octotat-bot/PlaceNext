const Drive = require('../models/Drive');
const Company = require('../models/Company');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { createNotification, notifyEligibleStudents } = require('../utils/notifications');
const { sendEmail } = require('../utils/email');

// ==================== COMPANY MANAGEMENT ====================

// @desc    Create company
// @route   POST /api/admin/companies
// @access  Private (Admin)
const createCompany = async (req, res, next) => {
    try {
        const company = await Company.create({
            ...req.body,
            createdBy: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: 'Company created successfully',
            company,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all companies
// @route   GET /api/admin/companies
// @access  Private (Admin)
const getCompanies = async (req, res, next) => {
    try {
        const { search, industry, page = 1, limit = 20 } = req.query;

        const query = {};
        if (search) {
            query.companyName = { $regex: search, $options: 'i' };
        }
        if (industry) {
            query.industry = industry;
        }

        const total = await Company.countDocuments(query);
        const companies = await Company.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: companies.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            companies,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single company
// @route   GET /api/admin/companies/:id
// @access  Private (Admin)
const getCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found',
            });
        }

        // Get drives count for this company
        const drivesCount = await Drive.countDocuments({ companyId: company._id });

        res.status(200).json({
            success: true,
            company: {
                ...company.toObject(),
                drivesCount,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update company
// @route   PUT /api/admin/companies/:id
// @access  Private (Admin)
const updateCompany = async (req, res, next) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Company updated successfully',
            company,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete company
// @route   DELETE /api/admin/companies/:id
// @access  Private (Admin)
const deleteCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found',
            });
        }

        // Check if company has drives
        const drivesCount = await Drive.countDocuments({ companyId: company._id });
        if (drivesCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete company with ${drivesCount} associated drives`,
            });
        }

        await company.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Company deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// ==================== DRIVE MANAGEMENT ====================

// @desc    Create drive
// @route   POST /api/admin/drives
// @access  Private (Admin)
const createDrive = async (req, res, next) => {
    try {
        const drive = await Drive.create({
            ...req.body,
            postedBy: req.user.id,
        });

        // Populate company info
        await drive.populate('companyId', 'companyName logoUrl');

        // Notify eligible students (async, don't await)
        const company = await Company.findById(drive.companyId);
        notifyEligibleStudents(drive, company).catch(console.error);

        res.status(201).json({
            success: true,
            message: 'Drive created successfully',
            drive,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all drives
// @route   GET /api/admin/drives
// @access  Private (Admin)
const getDrives = async (req, res, next) => {
    try {
        const { status, jobType, search, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) {
            query.driveStatus = status;
        }
        if (jobType) {
            query.jobType = jobType;
        }
        if (search) {
            query.$text = { $search: search };
        }

        const total = await Drive.countDocuments(query);
        const drives = await Drive.find(query)
            .populate('companyId', 'companyName logoUrl industry')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: drives.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            drives,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single drive
// @route   GET /api/admin/drives/:id
// @access  Private (Admin)
const getDrive = async (req, res, next) => {
    try {
        const drive = await Drive.findById(req.params.id)
            .populate('companyId')
            .populate('postedBy', 'email');

        if (!drive) {
            return res.status(404).json({
                success: false,
                message: 'Drive not found',
            });
        }

        res.status(200).json({
            success: true,
            drive,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update drive
// @route   PUT /api/admin/drives/:id
// @access  Private (Admin)
const updateDrive = async (req, res, next) => {
    try {
        const drive = await Drive.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('companyId', 'companyName logoUrl');

        if (!drive) {
            return res.status(404).json({
                success: false,
                message: 'Drive not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Drive updated successfully',
            drive,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete drive
// @route   DELETE /api/admin/drives/:id
// @access  Private (Admin)
const deleteDrive = async (req, res, next) => {
    try {
        const drive = await Drive.findById(req.params.id);

        if (!drive) {
            return res.status(404).json({
                success: false,
                message: 'Drive not found',
            });
        }

        // Check if drive has applications
        const applicationsCount = await Application.countDocuments({ driveId: drive._id });
        if (applicationsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete drive with ${applicationsCount} applications. Consider closing it instead.`,
            });
        }

        await drive.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Drive deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// ==================== APPLICATION MANAGEMENT ====================

// @desc    Get applications for a drive
// @route   GET /api/admin/drives/:id/applications
// @access  Private (Admin)
const getDriveApplications = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = { driveId: req.params.id };
        if (status) {
            query.applicationStatus = status;
        }

        const total = await Application.countDocuments(query);
        const applications = await Application.find(query)
            .populate({
                path: 'studentId',
                select: 'name rollNumber branch cgpa phone resumeUrl profilePictureUrl skills',
            })
            .populate('userId', 'email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Get status counts
        const statusCounts = await Application.aggregate([
            { $match: { driveId: new (require('mongoose')).Types.ObjectId(req.params.id) } },
            { $group: { _id: '$applicationStatus', count: { $sum: 1 } } },
        ]);

        const counts = {};
        statusCounts.forEach((s) => {
            counts[s._id] = s.count;
        });

        res.status(200).json({
            success: true,
            count: applications.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            statusCounts: counts,
            applications,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update application status
// @route   PUT /api/admin/applications/:id/status
// @access  Private (Admin)
const updateApplicationStatus = async (req, res, next) => {
    try {
        const { status, notes } = req.body;

        const application = await Application.findById(req.params.id)
            .populate({
                path: 'driveId',
                populate: { path: 'companyId' },
            })
            .populate('studentId', 'name')
            .populate('userId', 'email');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
            });
        }

        const oldStatus = application.applicationStatus;
        application.applicationStatus = status;
        if (notes) {
            application.adminNotes = notes;
        }

        // Add to status history
        application.statusHistory.push({
            status,
            changedAt: new Date(),
            changedBy: req.user.id,
            notes,
        });

        await application.save();

        // Update selected count if status is 'selected'
        if (status === 'selected' && oldStatus !== 'selected') {
            await Drive.findByIdAndUpdate(application.driveId._id, {
                $inc: { selectedCount: 1 },
            });
        } else if (oldStatus === 'selected' && status !== 'selected') {
            await Drive.findByIdAndUpdate(application.driveId._id, {
                $inc: { selectedCount: -1 },
            });
        }

        // Create notification and send email
        await createNotification({
            userId: application.userId._id,
            title: 'Application Status Updated',
            message: `Your application for ${application.driveId.roleTitle} at ${application.driveId.companyId.companyName} has been updated to "${formatStatus(status)}".`,
            type: 'application',
            link: `/applications/${application._id}`,
            sendEmailNotification: true,
            emailTemplate: 'statusUpdate',
            emailData: [
                application.studentId.name,
                application.driveId.companyId.companyName,
                application.driveId.roleTitle,
                status,
            ],
        });

        res.status(200).json({
            success: true,
            message: 'Application status updated successfully',
            application,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Bulk update application status
// @route   PUT /api/admin/applications/bulk-status
// @access  Private (Admin)
const bulkUpdateStatus = async (req, res, next) => {
    try {
        const { applicationIds, status, notes } = req.body;

        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide application IDs',
            });
        }

        // Track selected count changes before update
        if (status === 'selected') {
            const appsBeingSelected = await Application.find({
                _id: { $in: applicationIds },
                applicationStatus: { $ne: 'selected' },
            }).select('driveId');
            const driveIncrements = {};
            appsBeingSelected.forEach(app => {
                const key = app.driveId.toString();
                driveIncrements[key] = (driveIncrements[key] || 0) + 1;
            });
            for (const [driveId, count] of Object.entries(driveIncrements)) {
                await Drive.findByIdAndUpdate(driveId, { $inc: { selectedCount: count } });
            }
        } else {
            const appsLeavingSelected = await Application.find({
                _id: { $in: applicationIds },
                applicationStatus: 'selected',
            }).select('driveId');
            const driveDecrements = {};
            appsLeavingSelected.forEach(app => {
                const key = app.driveId.toString();
                driveDecrements[key] = (driveDecrements[key] || 0) + 1;
            });
            for (const [driveId, count] of Object.entries(driveDecrements)) {
                await Drive.findByIdAndUpdate(driveId, { $inc: { selectedCount: -count } });
            }
        }

        const updateResult = await Application.updateMany(
            { _id: { $in: applicationIds } },
            {
                $set: { applicationStatus: status },
                $push: {
                    statusHistory: {
                        status,
                        changedAt: new Date(),
                        changedBy: req.user.id,
                        notes,
                    },
                },
            }
        );

        // Send notifications to each applicant
        const applications = await Application.find({ _id: { $in: applicationIds } })
            .populate({
                path: 'driveId',
                populate: { path: 'companyId' },
            })
            .populate('studentId', 'name')
            .populate('userId', 'email');

        for (const app of applications) {
            createNotification({
                userId: app.userId._id,
                title: 'Application Status Updated',
                message: `Your application for ${app.driveId.roleTitle} at ${app.driveId.companyId.companyName} has been updated to "${formatStatus(status)}".`,
                type: 'application',
                link: `/applications/${app._id}`,
                sendEmailNotification: true,
                emailTemplate: 'statusUpdate',
                emailData: [
                    app.studentId.name,
                    app.driveId.companyId.companyName,
                    app.driveId.roleTitle,
                    status,
                ],
            }).catch(console.error);
        }

        res.status(200).json({
            success: true,
            message: `${updateResult.modifiedCount} applications updated successfully`,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Schedule interviews for applications
// @route   POST /api/admin/schedule-interview
// @access  Private (Admin)
const scheduleInterview = async (req, res, next) => {
    try {
        const { applicationIds, date, time, venue, meetingLink, round, roundName } = req.body;

        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please select applications to schedule',
            });
        }

        const interviewDetails = {
            date,
            time,
            venue,
            meetingLink,
            round,
            roundName,
        };

        // Update applications
        await Application.updateMany(
            { _id: { $in: applicationIds } },
            {
                $set: { applicationStatus: 'interview-scheduled' },
                $push: {
                    interviewDetails,
                    statusHistory: {
                        status: 'interview-scheduled',
                        changedAt: new Date(),
                        changedBy: req.user.id,
                        notes: `Interview scheduled for ${roundName || `Round ${round}`}`,
                    },
                },
            }
        );

        // Send notifications and emails
        const applications = await Application.find({ _id: { $in: applicationIds } })
            .populate({
                path: 'driveId',
                populate: { path: 'companyId' },
            })
            .populate('studentId', 'name')
            .populate('userId', 'email');

        for (const app of applications) {
            createNotification({
                userId: app.userId._id,
                title: 'Interview Scheduled!',
                message: `Your interview for ${app.driveId.roleTitle} at ${app.driveId.companyId.companyName} has been scheduled.`,
                type: 'interview',
                link: `/applications/${app._id}`,
                sendEmailNotification: true,
                emailTemplate: 'interviewScheduled',
                emailData: [
                    app.studentId.name,
                    app.driveId.companyId.companyName,
                    app.driveId.roleTitle,
                    interviewDetails,
                ],
            }).catch(console.error);
        }

        res.status(200).json({
            success: true,
            message: `Interview scheduled for ${applicationIds.length} students`,
        });
    } catch (error) {
        next(error);
    }
};

// ==================== STUDENT MANAGEMENT ====================

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (Admin)
const getStudents = async (req, res, next) => {
    try {
        const { search, branch, cgpaMin, cgpaMax, hasProfile, page = 1, limit = 20 } = req.query;

        // Start with users who are students
        const userQuery = { role: 'student', isActive: true };

        // If searching, we need to search both in User (name, email) and StudentProfile
        let studentUsers = [];
        let total = 0;

        if (hasProfile === 'true') {
            // Only show students with profiles
            const profileQuery = {};
            if (search) {
                profileQuery.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { rollNumber: { $regex: search, $options: 'i' } },
                ];
            }
            if (branch) {
                profileQuery.branch = branch;
            }
            if (cgpaMin || cgpaMax) {
                profileQuery.cgpa = {};
                if (cgpaMin) profileQuery.cgpa.$gte = parseFloat(cgpaMin);
                if (cgpaMax) profileQuery.cgpa.$lte = parseFloat(cgpaMax);
            }

            total = await StudentProfile.countDocuments(profileQuery);
            const profiles = await StudentProfile.find(profileQuery)
                .populate('userId', 'email createdAt lastLogin')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));

            studentUsers = profiles;
        } else {
            // Show all students (with or without profile)
            // Use aggregation to join User with StudentProfile
            const pipeline = [
                { $match: userQuery },
                {
                    $lookup: {
                        from: 'studentprofiles',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'profile',
                    },
                },
                { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
            ];

            // Add search filter
            if (search) {
                pipeline.push({
                    $match: {
                        $or: [
                            { name: { $regex: search, $options: 'i' } },
                            { email: { $regex: search, $options: 'i' } },
                            { 'profile.name': { $regex: search, $options: 'i' } },
                            { 'profile.rollNumber': { $regex: search, $options: 'i' } },
                        ],
                    },
                });
            }

            // Add branch filter (only applies to those with profile)
            if (branch) {
                pipeline.push({ $match: { 'profile.branch': branch } });
            }

            // Add CGPA filter (only applies to those with profile)
            if (cgpaMin || cgpaMax) {
                const cgpaMatch = {};
                if (cgpaMin) cgpaMatch['profile.cgpa'] = { $gte: parseFloat(cgpaMin) };
                if (cgpaMax) cgpaMatch['profile.cgpa'] = { ...cgpaMatch['profile.cgpa'], $lte: parseFloat(cgpaMax) };
                pipeline.push({ $match: cgpaMatch });
            }

            // Project the fields we need
            pipeline.push({
                $project: {
                    _id: { $ifNull: ['$profile._id', '$_id'] },
                    userId: {
                        _id: '$_id',
                        email: '$email',
                        createdAt: '$createdAt',
                        lastLogin: '$lastLogin',
                    },
                    name: { $ifNull: ['$profile.name', '$name'] },
                    rollNumber: '$profile.rollNumber',
                    branch: '$profile.branch',
                    semester: '$profile.semester',
                    cgpa: '$profile.cgpa',
                    backlogs: '$profile.backlogs',
                    phone: { $ifNull: ['$profile.phone', '$phone'] },
                    skills: '$profile.skills',
                    resumeUrl: '$profile.resumeUrl',
                    profilePictureUrl: '$profile.profilePictureUrl',
                    hasProfile: { $cond: [{ $ifNull: ['$profile._id', false] }, true, false] },
                    createdAt: '$createdAt',
                },
            });

            // Get total count
            const countPipeline = [...pipeline];
            countPipeline.push({ $count: 'total' });
            const countResult = await User.aggregate(countPipeline);
            total = countResult[0]?.total || 0;

            // Add pagination and sorting
            pipeline.push({ $sort: { createdAt: -1 } });
            pipeline.push({ $skip: (page - 1) * parseInt(limit) });
            pipeline.push({ $limit: parseInt(limit) });

            studentUsers = await User.aggregate(pipeline);
        }

        res.status(200).json({
            success: true,
            count: studentUsers.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            students: studentUsers,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single student details
// @route   GET /api/admin/students/:id
// @access  Private (Admin)
const getStudent = async (req, res, next) => {
    try {
        const student = await StudentProfile.findById(req.params.id)
            .populate('userId', 'email createdAt lastLogin isActive');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        // Get student's applications
        const applications = await Application.find({ studentId: student._id })
            .populate({
                path: 'driveId',
                populate: { path: 'companyId', select: 'companyName' },
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            student: {
                ...student.toObject(),
                applications,
                totalApplications: applications.length,
                selectedCount: applications.filter((a) => a.applicationStatus === 'selected').length,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ==================== ANALYTICS ====================

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res, next) => {
    try {
        // Total counts - count ALL registered students (users with student role)
        const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
        const studentsWithProfile = await StudentProfile.countDocuments();
        const totalDrives = await Drive.countDocuments();
        const activeDrives = await Drive.countDocuments({ driveStatus: 'active' });
        const totalApplications = await Application.countDocuments();
        const totalCompanies = await Company.countDocuments();

        // Placement statistics
        const selectedStudents = await Application.countDocuments({ applicationStatus: 'selected' });

        // Average package (for drives with package info)
        const avgPackageResult = await Drive.aggregate([
            { $match: { package: { $exists: true, $ne: null } } },
            { $group: { _id: null, avgPackage: { $avg: '$package' } } },
        ]);
        const avgPackage = avgPackageResult[0]?.avgPackage || 0;

        // Applications by status
        const applicationsByStatus = await Application.aggregate([
            { $group: { _id: '$applicationStatus', count: { $sum: 1 } } },
        ]);

        // Placements by branch
        const placementsByBranch = await Application.aggregate([
            { $match: { applicationStatus: 'selected' } },
            {
                $lookup: {
                    from: 'studentprofiles',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student',
                },
            },
            { $unwind: '$student' },
            { $group: { _id: '$student.branch', count: { $sum: 1 } } },
        ]);

        // Applications over time (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const applicationsOverTime = await Application.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Top companies by applications
        const topCompanies = await Application.aggregate([
            {
                $lookup: {
                    from: 'drives',
                    localField: 'driveId',
                    foreignField: '_id',
                    as: 'drive',
                },
            },
            { $unwind: '$drive' },
            {
                $lookup: {
                    from: 'companies',
                    localField: 'drive.companyId',
                    foreignField: '_id',
                    as: 'company',
                },
            },
            { $unwind: '$company' },
            {
                $group: {
                    _id: '$company._id',
                    companyName: { $first: '$company.companyName' },
                    applications: { $sum: 1 },
                    selected: {
                        $sum: { $cond: [{ $eq: ['$applicationStatus', 'selected'] }, 1, 0] },
                    },
                },
            },
            { $sort: { applications: -1 } },
            { $limit: 10 },
        ]);

        // Resume score distribution
        const resumeScoreDistribution = await Application.aggregate([
            { $match: { resumeScore: { $exists: true, $ne: null } } },
            {
                $bucket: {
                    groupBy: '$resumeScore',
                    boundaries: [0, 20, 40, 60, 80, 100],
                    default: 'Other',
                    output: { count: { $sum: 1 } },
                },
            },
        ]);

        // Recent activities
        const recentApplications = await Application.find()
            .populate('studentId', 'name')
            .populate({
                path: 'driveId',
                populate: { path: 'companyId', select: 'companyName' },
            })
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            analytics: {
                overview: {
                    totalStudents,
                    studentsWithProfile,
                    totalDrives,
                    activeDrives,
                    totalApplications,
                    totalCompanies,
                    selectedStudents,
                    avgPackage: Math.round(avgPackage * 100) / 100,
                    placementRate: totalStudents > 0 ? Math.round((selectedStudents / totalStudents) * 100) : 0,
                },
                applicationsByStatus,
                placementsByBranch,
                applicationsOverTime,
                topCompanies,
                resumeScoreDistribution,
                recentApplications,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Helper function
function formatStatus(status) {
    return status
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// ==================== RECRUITER MANAGEMENT ====================

// @desc    Get all pending recruiters
// @route   GET /api/admin/recruiters/pending
// @access  Private (Admin)
const getPendingRecruiters = async (req, res, next) => {
    try {
        const pendingRecruiters = await User.find({
            role: 'recruiter',
            accountStatus: 'pending',
        })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pendingRecruiters.length,
            data: pendingRecruiters,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all recruiters
// @route   GET /api/admin/recruiters
// @access  Private (Admin)
const getAllRecruiters = async (req, res, next) => {
    try {
        const { status } = req.query;

        const query = { role: 'recruiter' };
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query.accountStatus = status;
        }

        const recruiters = await User.find(query)
            .select('-password')
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: recruiters.length,
            data: recruiters,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve recruiter
// @route   PUT /api/admin/recruiters/:id/approve
// @access  Private (Admin)
const approveRecruiter = async (req, res, next) => {
    try {
        const recruiter = await User.findById(req.params.id);

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: 'Recruiter not found',
            });
        }

        if (recruiter.role !== 'recruiter') {
            return res.status(400).json({
                success: false,
                message: 'This user is not a recruiter',
            });
        }

        if (recruiter.accountStatus === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Recruiter is already approved',
            });
        }

        recruiter.accountStatus = 'approved';
        recruiter.approvedBy = req.user.id;
        recruiter.approvedAt = new Date();
        recruiter.rejectionReason = undefined;
        await recruiter.save();

        // Send approval email
        sendEmail({
            to: recruiter.email,
            subject: 'Account Approved - Placement Portal',
            html: `
                <h2>Congratulations ${recruiter.name}!</h2>
                <p>Your recruiter account for <strong>${recruiter.companyName}</strong> has been approved.</p>
                <p>You can now log in to the portal and start posting job opportunities.</p>
                <p>Welcome aboard!</p>
            `,
        }).catch(console.error);

        res.status(200).json({
            success: true,
            message: 'Recruiter approved successfully',
            data: {
                id: recruiter._id,
                name: recruiter.name,
                email: recruiter.email,
                companyName: recruiter.companyName,
                accountStatus: recruiter.accountStatus,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject recruiter
// @route   PUT /api/admin/recruiters/:id/reject
// @access  Private (Admin)
const rejectRecruiter = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const recruiter = await User.findById(req.params.id);

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: 'Recruiter not found',
            });
        }

        if (recruiter.role !== 'recruiter') {
            return res.status(400).json({
                success: false,
                message: 'This user is not a recruiter',
            });
        }

        recruiter.accountStatus = 'rejected';
        recruiter.rejectionReason = reason || 'Your registration was not approved.';
        recruiter.approvedBy = req.user.id;
        await recruiter.save();

        // Send rejection email
        sendEmail({
            to: recruiter.email,
            subject: 'Account Status Update - Placement Portal',
            html: `
                <h2>Hello ${recruiter.name},</h2>
                <p>Thank you for your interest in joining our placement portal as a recruiter.</p>
                <p>After review, we were unable to approve your registration at this time.</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                <p>If you believe this is an error, please contact our support team.</p>
            `,
        }).catch(console.error);

        res.status(200).json({
            success: true,
            message: 'Recruiter registration rejected',
            data: {
                id: recruiter._id,
                name: recruiter.name,
                email: recruiter.email,
                companyName: recruiter.companyName,
                accountStatus: recruiter.accountStatus,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ==================== CSV EXPORT ====================

const { Parser } = require('json2csv');

// @desc    Export students as CSV
// @route   GET /api/admin/export/students
// @access  Private (Admin)
const exportStudents = async (req, res, next) => {
    try {
        const students = await StudentProfile.find()
            .populate('userId', 'email isActive createdAt')
            .lean();

        const data = students.map((s) => ({
            Name: s.name || '',
            Email: s.userId?.email || '',
            'Roll Number': s.rollNumber || '',
            Branch: s.branch || '',
            Semester: s.semester || '',
            CGPA: s.cgpa || '',
            Backlogs: s.backlogs || 0,
            Phone: s.phone || '',
            Skills: (s.skills || []).join(', '),
            'Placement Status': s.placedAt ? 'Placed' : 'Not Placed',
            'Placed At': s.placedAt || '',
            'Account Active': s.userId?.isActive ? 'Yes' : 'No',
            'Registered On': s.userId?.createdAt ? new Date(s.userId.createdAt).toLocaleDateString() : '',
        }));

        const parser = new Parser();
        const csv = parser.parse(data);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};

// @desc    Export placements (selected applications) as CSV
// @route   GET /api/admin/export/placements
// @access  Private (Admin)
const exportPlacements = async (req, res, next) => {
    try {
        const applications = await Application.find({ applicationStatus: 'selected' })
            .populate('studentId', 'name rollNumber branch cgpa phone')
            .populate('userId', 'email')
            .populate({ path: 'driveId', populate: { path: 'companyId', select: 'companyName' } })
            .lean();

        const data = applications.map((a) => ({
            'Student Name': a.studentId?.name || '',
            'Roll Number': a.studentId?.rollNumber || '',
            Email: a.userId?.email || '',
            Branch: a.studentId?.branch || '',
            CGPA: a.studentId?.cgpa || '',
            Company: a.driveId?.companyId?.companyName || '',
            Role: a.driveId?.roleTitle || '',
            'Job Type': a.driveId?.jobType || '',
            'Package (LPA)': a.driveId?.package || '',
            'Selected On': a.statusHistory?.find((s) => s.status === 'selected')?.changedAt
                ? new Date(a.statusHistory.find((s) => s.status === 'selected').changedAt).toLocaleDateString()
                : '',
        }));

        const parser = new Parser();
        const csv = parser.parse(data);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=placements.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};

// @desc    Export applications for a specific drive as CSV
// @route   GET /api/admin/export/drives/:id/applications
// @access  Private (Admin)
const exportDriveApplications = async (req, res, next) => {
    try {
        const applications = await Application.find({ driveId: req.params.id })
            .populate('studentId', 'name rollNumber branch cgpa phone skills')
            .populate('userId', 'email')
            .populate({ path: 'driveId', select: 'roleTitle companyId', populate: { path: 'companyId', select: 'companyName' } })
            .lean();

        const data = applications.map((a) => ({
            'Student Name': a.studentId?.name || '',
            'Roll Number': a.studentId?.rollNumber || '',
            Email: a.userId?.email || '',
            Branch: a.studentId?.branch || '',
            CGPA: a.studentId?.cgpa || '',
            Phone: a.studentId?.phone || '',
            Skills: (a.studentId?.skills || []).join(', '),
            Company: a.driveId?.companyId?.companyName || '',
            Role: a.driveId?.roleTitle || '',
            Status: a.applicationStatus || '',
            'Applied On': a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '',
            'Resume Score': a.resumeScore || '',
            'Cover Letter': a.coverLetter || '',
        }));

        const parser = new Parser();
        const csv = parser.parse(data);

        const driveName = applications[0]?.driveId?.roleTitle || 'drive';
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${driveName.replace(/\s+/g, '_')}_applications.csv`);
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    // Company
    createCompany,
    getCompanies,
    getCompany,
    updateCompany,
    deleteCompany,
    // Drive
    createDrive,
    getDrives,
    getDrive,
    updateDrive,
    deleteDrive,
    // Applications
    getDriveApplications,
    updateApplicationStatus,
    bulkUpdateStatus,
    scheduleInterview,
    // Students
    getStudents,
    getStudent,
    // Analytics
    getAnalytics,
    // Recruiters
    getPendingRecruiters,
    getAllRecruiters,
    approveRecruiter,
    rejectRecruiter,
    // Exports
    exportStudents,
    exportPlacements,
    exportDriveApplications,
};
