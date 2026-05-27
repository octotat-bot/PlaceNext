const Notification = require('../models/Notification');
const { sendEmail } = require('./email');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

// Create notification and optionally send email
const createNotification = async ({
    userId,
    title,
    message,
    type = 'info',
    link = null,
    sendEmailNotification = false,
    emailTemplate = null,
    emailData = null,
}) => {
    try {
        // Create notification in database
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            link,
        });

        // Send email if requested
        if (sendEmailNotification) {
            const user = await User.findById(userId);
            if (user) {
                await sendEmail({
                    to: user.email,
                    subject: title,
                    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #1e293b;">${title}</h2>
                        <p style="color: #475569; line-height: 1.6;">${message}</p>
                        ${link ? `<p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}${link}" style="color: #6366f1;">View Details</a></p>` : ''}
                    </div>`,
                });
                notification.emailSent = true;
                await notification.save();
            }
        }

        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
};

// Get user's notifications
const getUserNotifications = async (userId, limit = 20) => {
    try {
        return await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit);
    } catch (error) {
        console.error('Get notifications error:', error);
        return [];
    }
};

// Mark notification as read
const markAsRead = async (notificationId, userId) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { isRead: true },
            { new: true }
        );
        return notification;
    } catch (error) {
        console.error('Mark as read error:', error);
        return null;
    }
};

// Mark all notifications as read
const markAllAsRead = async (userId) => {
    try {
        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
        return true;
    } catch (error) {
        console.error('Mark all as read error:', error);
        return false;
    }
};

// Get unread count
const getUnreadCount = async (userId) => {
    try {
        return await Notification.countDocuments({ userId, isRead: false });
    } catch (error) {
        console.error('Get unread count error:', error);
        return 0;
    }
};

// Notify eligible students about new drive
const notifyEligibleStudents = async (drive, company) => {
    try {
        const allBranchesAllowed = drive.eligibilityCriteria.allowedBranches.includes('All');

        const query = {
            cgpa: { $gte: drive.eligibilityCriteria.minCGPA },
            backlogs: { $lte: drive.eligibilityCriteria.maxBacklogs || 0 },
        };

        if (!allBranchesAllowed) {
            query.branch = { $in: drive.eligibilityCriteria.allowedBranches };
        }

        if (drive.eligibilityCriteria.minSemester) {
            query.semester = { $gte: drive.eligibilityCriteria.minSemester };
        }

        const eligibleStudents = await StudentProfile.find(query).populate('userId');

        for (const student of eligibleStudents) {
            if (!student.userId) continue;

            await createNotification({
                userId: student.userId._id,
                title: `New Opportunity: ${company.companyName}`,
                message: `${company.companyName} is hiring for ${drive.roleTitle}. Apply before ${new Date(drive.applicationDeadline).toLocaleDateString()}!`,
                type: 'drive',
                link: `/drives/${drive._id}`,
                sendEmailNotification: true,
                emailTemplate: 'newDrive',
                emailData: [student.name, company.companyName, drive.roleTitle, drive.applicationDeadline],
            });
        }

        return true;
    } catch (error) {
        console.error('Notify eligible students error:', error);
        return false;
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    notifyEligibleStudents,
};
