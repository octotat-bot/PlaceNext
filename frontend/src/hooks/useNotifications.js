import { useState, useCallback } from 'react';
import { notificationAPI } from '../services/api';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const { data } = await notificationAPI.getNotifications({ page, limit: 20 });
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
            return data;
        } catch (error) {
            // Silently handle - notifications failing shouldn't break the UI
            console.warn('Notifications unavailable:', error.message);
            setNotifications([]);
            setUnreadCount(0);
            return { notifications: [], unreadCount: 0 };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const { data } = await notificationAPI.getUnreadCount();
            setUnreadCount(data.unreadCount || 0);
            return data.unreadCount || 0;
        } catch (error) {
            console.warn('Failed to fetch unread count:', error.message);
            return 0;
        }
    }, []);

    const markAsRead = useCallback(async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
            throw error;
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            throw error;
        }
    }, []);

    const deleteNotification = useCallback(async (id) => {
        try {
            await notificationAPI.deleteNotification(id);
            const notification = notifications.find((n) => n._id === id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            if (notification && !notification.isRead) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
            throw error;
        }
    }, [notifications]);

    const clearAll = useCallback(async () => {
        try {
            await notificationAPI.clearAll();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to clear notifications:', error);
            throw error;
        }
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    };
};

export default useNotifications;
