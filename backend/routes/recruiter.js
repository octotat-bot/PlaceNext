const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/recruiterController');
const { protect, authorize } = require('../middleware/auth');
const {
    driveValidation,
    statusValidation,
    mongoIdValidation,
    validate,
} = require('../middleware/validation');

// All routes require authentication and recruiter role
router.use(protect);
router.use(authorize('recruiter'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Companies (read-only list for job creation)
router.get('/companies', getCompanies);

// Jobs (Drives)
router.route('/jobs')
    .get(getJobs)
    .post(driveValidation, validate, createJob);

router.route('/jobs/:id')
    .get(mongoIdValidation, validate, getJob)
    .put(mongoIdValidation, validate, updateJob)
    .delete(mongoIdValidation, validate, deleteJob);

// Applications
router.get('/applications', getApplications);
router.put('/applications/:id/status', mongoIdValidation, statusValidation, validate, updateApplicationStatus);

// Interviews
router.get('/interviews', getInterviews);
router.post('/interviews', scheduleInterview);
router.put('/interviews/:id', mongoIdValidation, validate, updateInterview);
router.delete('/interviews/:id', mongoIdValidation, validate, cancelInterview);

// Profile & Settings
router.put('/profile', updateProfile);
router.put('/password', updatePassword);

module.exports = router;
