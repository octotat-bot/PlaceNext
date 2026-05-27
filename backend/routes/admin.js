const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { createUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const {
    companyValidation,
    driveValidation,
    statusValidation,
    interviewValidation,
    mongoIdValidation,
    validate,
} = require('../middleware/validation');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// User management (Admin can create other admins/recruiters)
router.post('/create-user', createUser);

// Company routes
router.route('/companies')
    .get(getCompanies)
    .post(companyValidation, validate, createCompany);

router.route('/companies/:id')
    .get(mongoIdValidation, validate, getCompany)
    .put(mongoIdValidation, validate, updateCompany)
    .delete(mongoIdValidation, validate, deleteCompany);

// Drive routes
router.route('/drives')
    .get(getDrives)
    .post(driveValidation, validate, createDrive);

router.route('/drives/:id')
    .get(mongoIdValidation, validate, getDrive)
    .put(mongoIdValidation, validate, updateDrive)
    .delete(mongoIdValidation, validate, deleteDrive);

router.get('/drives/:id/applications', mongoIdValidation, validate, getDriveApplications);

// Application routes
router.put('/applications/:id/status', mongoIdValidation, statusValidation, validate, updateApplicationStatus);
router.put('/applications/bulk-status', bulkUpdateStatus);

// Interview scheduling
router.post('/schedule-interview', interviewValidation, validate, scheduleInterview);

// Student routes
router.get('/students', getStudents);
router.get('/students/:id', mongoIdValidation, validate, getStudent);

// Recruiter management routes
router.get('/recruiters', getAllRecruiters);
router.get('/recruiters/pending', getPendingRecruiters);
router.put('/recruiters/:id/approve', mongoIdValidation, validate, approveRecruiter);
router.put('/recruiters/:id/reject', mongoIdValidation, validate, rejectRecruiter);

// Analytics
router.get('/analytics', getAnalytics);

// Exports
router.get('/export/students', exportStudents);
router.get('/export/placements', exportPlacements);
router.get('/export/drives/:id/applications', mongoIdValidation, validate, exportDriveApplications);

module.exports = router;
