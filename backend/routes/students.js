const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    uploadResume,
    analyzeResumeAI,
    getResumeAnalysis,
    getEligibleDrives,
    getDriveDetails,
    applyToDrive,
    getApplications,
    getApplicationDetails,
    withdrawApplication,
    uploadProfilePicture,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const { profileValidation, validate, mongoIdValidation } = require('../middleware/validation');
const { uploadResume: multerResume, uploadProfile } = require('../config/multer');

// All routes are protected and require student role
router.use(protect);
router.use(authorize('student'));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', profileValidation, validate, updateProfile);
router.post('/profile/picture', uploadProfile.single('profilePicture'), uploadProfilePicture);

// Resume routes
router.post('/resume/upload', multerResume.single('resume'), uploadResume);
router.post('/resume/analyze', analyzeResumeAI);
router.get('/resume/analysis', getResumeAnalysis);

// Drive routes
router.get('/drives', getEligibleDrives);
router.get('/drives/:id', mongoIdValidation, validate, getDriveDetails);

// Application routes
router.post('/apply/:driveId', applyToDrive);
router.get('/applications', getApplications);
router.get('/applications/:id', mongoIdValidation, validate, getApplicationDetails);
router.put('/applications/:id/withdraw', mongoIdValidation, validate, withdrawApplication);

module.exports = router;
