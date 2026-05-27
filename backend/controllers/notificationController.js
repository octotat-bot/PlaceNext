const Notification = require('../models/Notification');
const { getUserNotifications, markAsRead, markAllAsRead, getUnreadCount } = require('../utils/notifications');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const total = await Notification.countDocuments({ userId: req.user.id });
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const unreadCount = await getUnreadCount(req.user.id);

        res.status(200).json({
            success: true,
            count: notifications.length,
            total,
            unreadCount,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            notifications,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadNotificationCount = async (req, res, next) => {
    try {
        const count = await getUnreadCount(req.user.id);

        res.status(200).json({
            success: true,
            unreadCount: count,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = async (req, res, next) => {
    try {
        const notification = await markAsRead(req.params.id, req.user.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            notification,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = async (req, res, next) => {
    try {
        await markAllAsRead(req.user.id);

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
const clearAllNotifications = async (req, res, next) => {
    try {
        await Notification.deleteMany({ userId: req.user.id });

        res.status(200).json({
            success: true,
            message: 'All notifications cleared',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
};
