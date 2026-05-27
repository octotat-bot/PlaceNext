const express = require('express');
const router = express.Router();
const {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { mongoIdValidation, validate } = require('../middleware/validation');

// All routes are protected
router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadNotificationCount);
router.put('/read-all', markAllNotificationsAsRead);
router.delete('/clear-all', clearAllNotifications);
router.put('/:id/read', mongoIdValidation, validate, markNotificationAsRead);
router.delete('/:id', mongoIdValidation, validate, deleteNotification);

module.exports = router;
