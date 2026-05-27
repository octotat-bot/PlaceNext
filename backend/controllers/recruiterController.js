const mongoose = require('mongoose');
const Drive = require('../models/Drive');
const Company = require('../models/Company');
const Application = require('../models/Application');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');

// Helper
function formatStatus(status) {
    return status
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// ==================== DASHBOARD ====================

const getDashboardStats = async (req, res, next) => {
    try {
        const recruiterId = req.user.id;

        // Get drives posted by this recruiter
        const drives = await Drive.find({ postedBy: recruiterId });
        const driveIds = drives.map((d) => d._id);

        const activeDrives = drives.filter((d) => d.driveStatus === 'active').length;
        const totalApplications = await Application.countDocuments({ driveId: { $in: driveIds } });
        const shortlisted = await Application.countDocuments({
            driveId: { $in: driveIds },
            applicationStatus: { $in: ['shortlisted', 'interview-scheduled'] },
        });
        const interviews = await Application.countDocuments({
            driveId: { $in: driveIds },
            applicationStatus: 'interview-scheduled',
        });
        const selected = await Application.countDocuments({
            driveId: { $in: driveIds },
            applicationStatus: 'selected',
        });

        // Recent applications
        const recentApplications = await Application.find({ driveId: { $in: driveIds } })
            .populate('studentId', 'name rollNumber branch skills')
            .populate({ path: 'driveId', select: 'roleTitle companyId', populate: { path: 'companyId', select: 'companyName' } })
            .sort({ createdAt: -1 })
            .limit(5);

        // Recent drives
        const recentDrives = await Drive.find({ postedBy: recruiterId })
            .populate('companyId', 'companyName')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            stats: {
                activeJobs: activeDrives,
                totalApplications,
                shortlisted,
                interviews,
                selected,
            },
            recentApplications: recentApplications.map((app) => ({
                id: app._id,
                name: app.studentId?.name || 'Unknown',
                position: app.driveId?.roleTitle || 'Unknown',
                status: app.applicationStatus === 'applied' ? 'pending' : app.applicationStatus,
                date: app.createdAt,
                avatar: app.studentId?.name?.charAt(0) || '?',
            })),
            jobPostings: recentDrives.map((drive) => ({
                id: drive._id,
                title: drive.roleTitle,
                applicants: drive.applicantCount || 0,
                deadline: drive.applicationDeadline,
                status: drive.driveStatus,
            })),
        });
    } catch (error) {
        next(error);
    }
};

// ==================== JOBS / DRIVES ====================

const getJobs = async (req, res, next) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const query = { postedBy: req.user.id };

        if (status && status !== 'all') {
            query.driveStatus = status;
        }
        if (search) {
            query.roleTitle = { $regex: search, $options: 'i' };
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
            jobs: drives.map((d) => ({
                id: d._id,
                title: d.roleTitle,
                description: d.roleDescription,
                type: d.jobType,
                location: d.location,
                workMode: d.workMode,
                salary: d.package ? `${d.package} LPA` : d.stipend ? `₹${d.stipend}/month` : 'Not specified',
                package: d.package,
                stipend: d.stipend,
                deadline: d.applicationDeadline,
                status: d.driveStatus,
                applicants: d.applicantCount || 0,
                selectedCount: d.selectedCount || 0,
                company: d.companyId,
                eligibilityCriteria: d.eligibilityCriteria,
                selectionProcess: d.selectionProcess,
                numberOfOpenings: d.numberOfOpenings,
                driveDate: d.driveDate,
                createdAt: d.createdAt,
            })),
        });
    } catch (error) {
        next(error);
    }
};

const getJob = async (req, res, next) => {
    try {
        const drive = await Drive.findOne({ _id: req.params.id, postedBy: req.user.id })
            .populate('companyId');

        if (!drive) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.status(200).json({ success: true, job: drive });
    } catch (error) {
        next(error);
    }
};

const createJob = async (req, res, next) => {
    try {
        const drive = await Drive.create({
            ...req.body,
            postedBy: req.user.id,
        });

        await drive.populate('companyId', 'companyName logoUrl');

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            job: drive,
        });
    } catch (error) {
        next(error);
    }
};

const updateJob = async (req, res, next) => {
    try {
        const drive = await Drive.findOneAndUpdate(
            { _id: req.params.id, postedBy: req.user.id },
            req.body,
            { new: true, runValidators: true }
        ).populate('companyId', 'companyName logoUrl');

        if (!drive) {
            return res.status(404).json({ success: false, message: 'Job not found or not authorized' });
        }

        res.status(200).json({ success: true, message: 'Job updated successfully', job: drive });
    } catch (error) {
        next(error);
    }
};

const deleteJob = async (req, res, next) => {
    try {
        const drive = await Drive.findOne({ _id: req.params.id, postedBy: req.user.id });

        if (!drive) {
            return res.status(404).json({ success: false, message: 'Job not found or not authorized' });
        }

        const appCount = await Application.countDocuments({ driveId: drive._id });
        if (appCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete job with ${appCount} applications. Consider closing it instead.`,
            });
        }

        await drive.deleteOne();
        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// ==================== APPLICATIONS ====================

const getApplications = async (req, res, next) => {
    try {
        const { status, driveId, search, page = 1, limit = 20 } = req.query;

        // Get all drive IDs for this recruiter
        const recruiterDrives = await Drive.find({ postedBy: req.user.id }).select('_id');
        const driveIds = recruiterDrives.map((d) => d._id);

        const query = { driveId: { $in: driveIds } };

        if (driveId) {
            query.driveId = new mongoose.Types.ObjectId(driveId);
        }
        if (status && status !== 'all') {
            // Map frontend statuses to backend statuses
            const statusMap = {
                pending: 'applied',
                reviewing: 'under-review',
                shortlisted: 'shortlisted',
                rejected: 'rejected',
                hired: 'selected',
            };
            query.applicationStatus = statusMap[status] || status;
        }

        const total = await Application.countDocuments(query);
        const applications = await Application.find(query)
            .populate('studentId', 'name rollNumber branch cgpa phone skills resumeUrl profilePictureUrl')
            .populate('userId', 'email')
            .populate({ path: 'driveId', select: 'roleTitle companyId', populate: { path: 'companyId', select: 'companyName' } })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Also get list of recruiter's drives for the filter dropdown
        const drives = await Drive.find({ postedBy: req.user.id })
            .select('roleTitle')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            applications: applications.map((app) => ({
                id: app._id,
                name: app.studentId?.name || 'Unknown',
                email: app.userId?.email || '',
                college: app.studentId?.branch || '',
                position: app.driveId?.roleTitle || '',
                company: app.driveId?.companyId?.companyName || '',
                status: app.applicationStatus === 'applied' ? 'pending'
                    : app.applicationStatus === 'under-review' ? 'reviewing'
                    : app.applicationStatus === 'selected' ? 'hired'
                    : app.applicationStatus,
                appliedDate: app.createdAt,
                skills: app.studentId?.skills || [],
                resumeUrl: app.resumeUrl || app.studentId?.resumeUrl,
                resumeScore: app.resumeScore,
                cgpa: app.studentId?.cgpa,
                jobId: app.driveId?._id,
                coverLetter: app.coverLetter,
                interviewDetails: app.interviewDetails,
                statusHistory: app.statusHistory,
            })),
            drives: drives.map((d) => ({ id: d._id, title: d.roleTitle })),
        });
    } catch (error) {
        next(error);
    }
};

const updateApplicationStatus = async (req, res, next) => {
    try {
        const { status, notes } = req.body;

        const application = await Application.findById(req.params.id)
            .populate({ path: 'driveId', populate: { path: 'companyId' } })
            .populate('studentId', 'name')
            .populate('userId', 'email');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Verify this application belongs to a drive posted by this recruiter
        if (application.driveId.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this application' });
        }

        // Map frontend status to backend status
        const statusMap = {
            pending: 'applied',
            reviewing: 'under-review',
            shortlisted: 'shortlisted',
            rejected: 'rejected',
            hired: 'selected',
        };
        const backendStatus = statusMap[status] || status;

        const oldStatus = application.applicationStatus;
        application.applicationStatus = backendStatus;
        if (notes) application.adminNotes = notes;

        application.statusHistory.push({
            status: backendStatus,
            changedAt: new Date(),
            changedBy: req.user.id,
            notes,
        });

        await application.save();

        // Update selected count
        if (backendStatus === 'selected' && oldStatus !== 'selected') {
            await Drive.findByIdAndUpdate(application.driveId._id, { $inc: { selectedCount: 1 } });
        } else if (oldStatus === 'selected' && backendStatus !== 'selected') {
            await Drive.findByIdAndUpdate(application.driveId._id, { $inc: { selectedCount: -1 } });
        }

        // Notify student
        createNotification({
            userId: application.userId._id,
            title: 'Application Status Updated',
            message: `Your application for ${application.driveId.roleTitle} at ${application.driveId.companyId.companyName} has been updated to "${formatStatus(backendStatus)}".`,
            type: 'application',
            link: `/applications/${application._id}`,
            sendEmailNotification: true,
        }).catch(console.error);

        res.status(200).json({ success: true, message: 'Application status updated', application });
    } catch (error) {
        next(error);
    }
};

// ==================== INTERVIEWS ====================

const getInterviews = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const recruiterDrives = await Drive.find({ postedBy: req.user.id }).select('_id');
        const driveIds = recruiterDrives.map((d) => d._id);

        const query = {
            driveId: { $in: driveIds },
            'interviewDetails.0': { $exists: true }, // has at least one interview
        };

        if (status === 'completed') {
            query.applicationStatus = 'selected';
        } else if (status === 'cancelled') {
            query.applicationStatus = 'rejected';
        } else if (status === 'upcoming' || !status) {
            query.applicationStatus = 'interview-scheduled';
        }

        const total = await Application.countDocuments(query);
        const applications = await Application.find(query)
            .populate('studentId', 'name phone')
            .populate('userId', 'email')
            .populate({ path: 'driveId', select: 'roleTitle companyId', populate: { path: 'companyId', select: 'companyName' } })
            .sort({ 'interviewDetails.date': -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        res.status(200).json({
            success: true,
            count: applications.length,
            total,
            interviews: applications.map((app) => {
                const latestInterview = app.interviewDetails[app.interviewDetails.length - 1];
                const interviewDate = latestInterview?.date ? new Date(latestInterview.date) : null;
                const isToday = interviewDate && interviewDate >= today && interviewDate < tomorrow;

                return {
                    id: app._id,
                    candidateName: app.studentId?.name || 'Unknown',
                    email: app.userId?.email || '',
                    phone: app.studentId?.phone || '',
                    position: app.driveId?.roleTitle || '',
                    company: app.driveId?.companyId?.companyName || '',
                    date: isToday ? 'Today' : latestInterview?.date,
                    time: latestInterview?.time || '',
                    type: latestInterview?.meetingLink ? 'video' : 'onsite',
                    location: latestInterview?.venue || 'TBD',
                    meetingLink: latestInterview?.meetingLink || '',
                    round: latestInterview?.roundName || `Round ${latestInterview?.round || 1}`,
                    status: app.applicationStatus === 'interview-scheduled' ? 'scheduled'
                        : app.applicationStatus === 'selected' ? 'completed'
                        : app.applicationStatus === 'rejected' ? 'cancelled'
                        : 'scheduled',
                };
            }),
        });
    } catch (error) {
        next(error);
    }
};

const scheduleInterview = async (req, res, next) => {
    try {
        const { applicationIds, date, time, venue, meetingLink, round, roundName } = req.body;

        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Please select applications' });
        }

        const interviewDetails = { date, time, venue, meetingLink, round: round || 1, roundName: roundName || `Round ${round || 1}` };

        // Verify all applications belong to recruiter's drives
        const recruiterDrives = await Drive.find({ postedBy: req.user.id }).select('_id');
        const driveIds = recruiterDrives.map((d) => d._id.toString());

        const applications = await Application.find({ _id: { $in: applicationIds } });
        for (const app of applications) {
            if (!driveIds.includes(app.driveId.toString())) {
                return res.status(403).json({ success: false, message: 'Not authorized to schedule interviews for these applications' });
            }
        }

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
                        notes: `Interview scheduled for ${roundName || `Round ${round || 1}`}`,
                    },
                },
            }
        );

        // Notify students
        const updatedApps = await Application.find({ _id: { $in: applicationIds } })
            .populate({ path: 'driveId', populate: { path: 'companyId' } })
            .populate('studentId', 'name');

        for (const app of updatedApps) {
            createNotification({
                userId: app.userId,
                title: 'Interview Scheduled!',
                message: `Your interview for ${app.driveId?.roleTitle} at ${app.driveId?.companyId?.companyName} has been scheduled.`,
                type: 'interview',
                link: `/applications/${app._id}`,
                sendEmailNotification: true,
            }).catch(console.error);
        }

        res.status(200).json({ success: true, message: `Interview scheduled for ${applicationIds.length} candidate(s)` });
    } catch (error) {
        next(error);
    }
};

const updateInterview = async (req, res, next) => {
    try {
        const { date, time, venue, meetingLink } = req.body;
        const application = await Application.findById(req.params.id).populate('driveId');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        if (application.driveId.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Update the latest interview details
        if (application.interviewDetails.length > 0) {
            const latest = application.interviewDetails[application.interviewDetails.length - 1];
            if (date) latest.date = date;
            if (time) latest.time = time;
            if (venue) latest.venue = venue;
            if (meetingLink !== undefined) latest.meetingLink = meetingLink;
        }

        await application.save();
        res.status(200).json({ success: true, message: 'Interview updated', application });
    } catch (error) {
        next(error);
    }
};

const cancelInterview = async (req, res, next) => {
    try {
        const application = await Application.findById(req.params.id).populate('driveId');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        if (application.driveId.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        application.applicationStatus = 'shortlisted'; // Revert to shortlisted
        application.statusHistory.push({
            status: 'shortlisted',
            changedAt: new Date(),
            changedBy: req.user.id,
            notes: 'Interview cancelled',
        });

        await application.save();

        createNotification({
            userId: application.userId,
            title: 'Interview Cancelled',
            message: `Your interview for ${application.driveId.roleTitle} has been cancelled.`,
            type: 'interview',
            sendEmailNotification: true,
        }).catch(console.error);

        res.status(200).json({ success: true, message: 'Interview cancelled' });
    } catch (error) {
        next(error);
    }
};

// ==================== PROFILE ====================

const updateProfile = async (req, res, next) => {
    try {
        const { name, companyName } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (name) user.name = name;
        if (companyName) user.companyName = companyName;
        await user.save();

        res.status(200).json({ success: true, message: 'Profile updated successfully', user: { name: user.name, email: user.email, companyName: user.companyName } });
    } catch (error) {
        next(error);
    }
};

const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword) {
            return res.status(400).json({ success: false, message: 'Current password is required' });
        }
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

// ==================== COMPANIES (read-only for recruiters) ====================

const getCompanies = async (req, res, next) => {
    try {
        const companies = await Company.find().select('companyName industry logoUrl').sort({ companyName: 1 });
        res.status(200).json({ success: true, companies });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    getApplications,
    updateApplicationStatus,
    getInterviews,
    scheduleInterview,
    updateInterview,
    cancelInterview,
    updateProfile,
    updatePassword,
    getCompanies,
};
