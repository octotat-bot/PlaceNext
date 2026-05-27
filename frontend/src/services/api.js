import axios from 'axios';
import { parseError, isAuthError, logError } from '../utils/errors';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
});

// Function to set auth token dynamically (for multi-tab support)
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// Initialize token from sessionStorage on load
const storedToken = sessionStorage.getItem('token');
if (storedToken) {
    setAuthToken(storedToken);
}

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Get token from sessionStorage for per-tab support
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() };

        return config;
    },
    (error) => {
        logError('Request Interceptor', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        // Log request duration in development
        if (import.meta.env.DEV && response.config.metadata) {
            const duration = new Date() - response.config.metadata.startTime;
            if (duration > 1000) {
                console.warn(`Slow request: ${response.config.url} took ${duration}ms`);
            }
        }
        return response;
    },
    (error) => {
        const parsedError = parseError(error);

        // Log error in development
        logError('API Response', error);

        // Don't redirect on 401 for auth endpoints (handled by components/context)
        const isAuthMeRequest = error.config?.url?.includes('/auth/me');
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        const isRegisterRequest = error.config?.url?.includes('/auth/register');

        // Handle authentication errors
        if (isAuthError(parsedError) && !isAuthMeRequest && !isLoginRequest && !isRegisterRequest) {
            // Clear session
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            setAuthToken(null);

            // Redirect to login with error message
            const returnUrl = encodeURIComponent(window.location.pathname);
            window.location.href = `/login?expired=true&returnUrl=${returnUrl}`;
        }

        // Enhance error with parsed info
        error.parsed = parsedError;

        return Promise.reject(error);
    }
);

// ==================== API ENDPOINTS ====================

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updatePassword: (data) => api.put('/auth/password', data),
    logout: () => api.post('/auth/logout'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
    verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
    resendVerification: (email) => api.post('/auth/resend-verification', { email }),
};

// Student API
export const studentAPI = {
    // Profile
    getProfile: () => api.get('/students/profile'),
    updateProfile: (data) => api.put('/students/profile', data),
    uploadProfilePicture: (formData) =>
        api.post('/students/profile/picture', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    completeOnboarding: () => api.patch('/auth/complete-onboarding'),

    // Resume
    uploadResume: (formData) =>
        api.post('/students/resume/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    analyzeResume: () => api.post('/students/resume/analyze'),
    getResumeAnalysis: () => api.get('/students/resume/analysis'),

    // Drives
    getDrives: (params) => api.get('/students/drives', { params }),
    getDriveDetails: (id) => api.get(`/students/drives/${id}`),

    // Applications
    applyToDrive: (driveId, data) => api.post(`/students/apply/${driveId}`, data),
    getApplications: (params) => api.get('/students/applications', { params }),
    getApplicationDetails: (id) => api.get(`/students/applications/${id}`),
    withdrawApplication: (id) => api.put(`/students/applications/${id}/withdraw`),
};

// Admin API
export const adminAPI = {
    // Companies
    getCompanies: (params) => api.get('/admin/companies', { params }),
    getCompany: (id) => api.get(`/admin/companies/${id}`),
    createCompany: (data) => api.post('/admin/companies', data),
    updateCompany: (id, data) => api.put(`/admin/companies/${id}`, data),
    deleteCompany: (id) => api.delete(`/admin/companies/${id}`),

    // Drives
    getDrives: (params) => api.get('/admin/drives', { params }),
    getDrive: (id) => api.get(`/admin/drives/${id}`),
    createDrive: (data) => api.post('/admin/drives', data),
    updateDrive: (id, data) => api.put(`/admin/drives/${id}`, data),
    deleteDrive: (id) => api.delete(`/admin/drives/${id}`),
    getDriveApplications: (id, params) => api.get(`/admin/drives/${id}/applications`, { params }),

    // Applications
    updateApplicationStatus: (id, data) => api.put(`/admin/applications/${id}/status`, data),
    bulkUpdateStatus: (data) => api.put('/admin/applications/bulk-status', data),
    scheduleInterview: (data) => api.post('/admin/schedule-interview', data),

    // Students
    getStudents: (params) => api.get('/admin/students', { params }),
    getStudent: (id) => api.get(`/admin/students/${id}`),

    // Recruiters
    getRecruiters: (params) => api.get('/admin/recruiters', { params }),
    getPendingRecruiters: () => api.get('/admin/recruiters/pending'),
    approveRecruiter: (id) => api.put(`/admin/recruiters/${id}/approve`),
    rejectRecruiter: (id, reason) => api.put(`/admin/recruiters/${id}/reject`, { reason }),

    // Analytics
    getAnalytics: () => api.get('/admin/analytics'),

    // User management
    createUser: (data) => api.post('/admin/create-user', data),

    // Exports
    exportStudents: () => api.get('/admin/export/students', { responseType: 'blob' }),
    exportPlacements: () => api.get('/admin/export/placements', { responseType: 'blob' }),
    exportDriveApplications: (id) => api.get(`/admin/export/drives/${id}/applications`, { responseType: 'blob' }),
};

// Recruiter API
export const recruiterAPI = {
    // Dashboard
    getDashboardStats: () => api.get('/recruiter/dashboard'),

    // Companies (read-only for job creation)
    getCompanies: () => api.get('/recruiter/companies'),

    // Jobs
    getJobs: (params) => api.get('/recruiter/jobs', { params }),
    getJob: (id) => api.get(`/recruiter/jobs/${id}`),
    createJob: (data) => api.post('/recruiter/jobs', data),
    updateJob: (id, data) => api.put(`/recruiter/jobs/${id}`, data),
    deleteJob: (id) => api.delete(`/recruiter/jobs/${id}`),

    // Applications
    getApplications: (params) => api.get('/recruiter/applications', { params }),
    updateApplicationStatus: (id, data) => api.put(`/recruiter/applications/${id}/status`, data),

    // Interviews
    getInterviews: (params) => api.get('/recruiter/interviews', { params }),
    scheduleInterview: (data) => api.post('/recruiter/interviews', data),
    updateInterview: (id, data) => api.put(`/recruiter/interviews/${id}`, data),
    cancelInterview: (id) => api.delete(`/recruiter/interviews/${id}`),

    // Profile & Settings
    updateProfile: (data) => api.put('/recruiter/profile', data),
    updatePassword: (data) => api.put('/recruiter/password', data),
};

// AI API
export const aiAPI = {
    chat: (data) => api.post('/ai/chat', data),
    getChatHistory: (sessionId) => api.get('/ai/chat/history', { params: { sessionId } }),
    newChatSession: () => api.post('/ai/chat/new'),
    deleteChatSession: (sessionId) => api.delete(`/ai/chat/${sessionId}`),
};

// Notifications API
export const notificationAPI = {
    getNotifications: (params) => api.get('/notifications', { params }),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    deleteNotification: (id) => api.delete(`/notifications/${id}`),
    clearAll: () => api.delete('/notifications/clear-all'),
};

export default api;
