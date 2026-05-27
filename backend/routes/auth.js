const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    updatePassword,
    logout,
    completeOnboarding,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
    registerValidation,
    loginValidation,
    validate,
} = require('../middleware/validation');

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);
router.post('/resend-verification', protect, resendVerification);
router.post('/logout', protect, logout);
router.patch('/complete-onboarding', protect, completeOnboarding);

module.exports = router;

