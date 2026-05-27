const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const crypto = require('crypto');
const {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail
} = require('../utils/email');
const { logger } = require('../utils/logger');
const {
    AppError,
    InvalidCredentialsError,
    AccountLockedError,
    AccountPendingError,
    AccountDeactivatedError,
    AccountRejectedError,
    ValidationError,
    DuplicateError,
    NotFoundError,
    EmailNotVerifiedError,
} = require('../utils/errors');

// @desc    Register user (Student: open & auto-approved, Recruiter: open but pending approval)
// @route   POST /api/auth/register
// @access  Public
// NOTE: Admin accounts can only be created by existing admins via the admin panel
const register = async (req, res, next) => {
    try {
        const { email, password, role = 'student', name, phone, companyName } = req.body;

        // Only allow student and recruiter registration via public endpoint
        // Admins must be created by existing admins
        if (!['student', 'recruiter'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Only student and recruiter registration is allowed.',
            });
        }

        // For recruiters, validate name and company
        if (role === 'recruiter') {
            if (!name || name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide your full name',
                });
            }

            if (!companyName || companyName.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide your company name',
                });
            }
        }

        // For students, validate name and phone
        if (role === 'student') {
            if (!name || name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide your full name',
                });
            }

            if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid 10-digit mobile number',
                });
            }

            // Check if phone already exists
            const existingPhone = await User.findOne({ phone });
            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Mobile number already registered',
                });
            }
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Create user
        const userData = {
            email,
            password,
            role,
            name: name.trim(),
            // Recruiters need admin approval, students are auto-approved
            accountStatus: role === 'recruiter' ? 'pending' : 'approved',
            // Skip email verification in development for easier testing
            emailVerified: process.env.NODE_ENV !== 'production',
        };

        // Add phone for students
        if (role === 'student') {
            userData.phone = phone;
        }

        // Add companyName for recruiters
        if (role === 'recruiter') {
            userData.companyName = companyName.trim();
        }

        const user = await User.create(userData);

        // Send verification email in production
        if (process.env.NODE_ENV === 'production') {
            try {
                const verificationToken = user.getEmailVerificationToken();
                await user.save({ validateBeforeSave: false });
                await sendVerificationEmail(user, verificationToken);
            } catch (emailError) {
                logger.error('Failed to send verification email', { error: emailError.message });
            }
        }

        // For recruiters with pending status, don't generate token yet
        if (role === 'recruiter') {
            logger.info('New recruiter registration', { email, companyName });

            return res.status(201).json({
                success: true,
                message: 'Registration successful! Your account is pending approval. You will receive an email once approved.',
                requiresApproval: true,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    companyName: user.companyName,
                    role: user.role,
                    accountStatus: user.accountStatus,
                },
            });
        }

        // For students, generate token immediately
        const token = user.getSignedJwtToken();

        // Automatically create a student profile
        if (role === 'student') {
            await StudentProfile.create({
                userId: user._id,
                name: user.name,
                phone: user.phone,
                rollNumber: `TEMP-${user._id.toString().substring(0, 8)}`,
                branch: 'Other',
                semester: 1,
                cgpa: 0,
            });
        }

        logger.info('New student registration', { email });

        res.status(201).json({
            success: true,
            message: process.env.NODE_ENV === 'production'
                ? 'Registration successful! Please verify your email.'
                : 'Registration successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
                accountStatus: user.accountStatus,
                emailVerified: user.emailVerified,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, phone, password } = req.body;

        // Must provide either email or phone
        if (!email && !phone) {
            throw new ValidationError('Please provide email or phone number', [
                { field: 'email', message: 'Email or phone required' }
            ]);
        }

        // Build query - find by email or phone
        let query = {};
        if (email) {
            query.email = email.toLowerCase();
        } else if (phone) {
            query.phone = phone;
        }

        // Check for user
        const user = await User.findOne(query).select('+password');
        if (!user) {
            throw new InvalidCredentialsError();
        }

        // Check if account is locked
        if (user.isLocked) {
            const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
            throw new AccountLockedError(lockTimeRemaining);
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            // Increment failed login attempts
            await user.incLoginAttempts();
            logger.warn('Failed login attempt', { email: user.email });
            throw new InvalidCredentialsError();
        }

        // Check if active
        if (!user.isActive) {
            throw new AccountDeactivatedError();
        }

        // Check account approval status (for recruiters)
        if (user.accountStatus === 'pending') {
            throw new AccountPendingError('Your account is pending approval. Please wait for admin verification.');
        }

        if (user.accountStatus === 'rejected') {
            throw new AccountRejectedError(
                user.rejectionReason || 'Your registration was not approved. Please contact support.'
            );
        }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        // Generate token
        const token = user.getSignedJwtToken();

        // Get student profile if student
        let profile = null;
        if (user.role === 'student') {
            profile = await StudentProfile.findOne({ userId: user._id });
        }

        logger.info('User logged in', { email: user.email, role: user.role });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                companyName: user.companyName,
                accountStatus: user.accountStatus,
                emailVerified: user.emailVerified,
                hasCompletedOnboarding: user.hasCompletedOnboarding,
            },
            profile,
            hasProfile: !!profile,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        let profile = null;
        if (user.role === 'student') {
            profile = await StudentProfile.findOne({ userId: user._id });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                companyName: user.companyName,
                accountStatus: user.accountStatus,
                emailVerified: user.emailVerified,
                hasCompletedOnboarding: user.hasCompletedOnboarding,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
            },
            profile,
            hasProfile: !!profile,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address',
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if email exists or not for security
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, we have sent a password reset link.',
            });
        }

        // Generate reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        try {
            await sendPasswordResetEmail(user, resetToken);
            logger.info('Password reset email sent', { email });
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            logger.error('Failed to send password reset email', { error: emailError.message });

            return res.status(500).json({
                success: false,
                message: 'Error sending email. Please try again.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, we have sent a password reset link.',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const { token } = req.params;

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
            });
        }

        // Hash the token to compare with stored hash
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        logger.info('Password reset successful', { email: user.email });

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. You can now log in.',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        // Hash the token to compare with stored hash
        const emailVerificationToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            emailVerificationToken,
            emailVerificationExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token',
            });
        }

        // Mark email as verified
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save({ validateBeforeSave: false });

        // Send welcome email
        try {
            await sendWelcomeEmail(user);
        } catch (emailError) {
            logger.error('Failed to send welcome email', { error: emailError.message });
        }

        logger.info('Email verified', { email: user.email });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified',
            });
        }

        // Generate new verification token
        const verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        try {
            await sendVerificationEmail(user, verificationToken);
        } catch (emailError) {
            logger.error('Failed to send verification email', { error: emailError.message });

            return res.status(500).json({
                success: false,
                message: 'Error sending email. Please try again.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Verification email sent',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is required',
            });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters',
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password',
            });
        }

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        user.password = newPassword;
        await user.save();

        // Generate new token
        const token = user.getSignedJwtToken();

        logger.info('Password updated', { email: user.email });

        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
            token,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create admin user (Admin only)
// @route   POST /api/admin/create-user
// @access  Private (Admin only)
const createUser = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        // Validate role
        if (!['student', 'admin', 'recruiter'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified',
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Create user with specified role (auto-approved and verified when created by admin)
        const user = await User.create({
            email,
            password,
            role,
            accountStatus: 'approved',
            emailVerified: true,
        });

        logger.info('User created by admin', { email, role, createdBy: req.user.id });

        res.status(201).json({
            success: true,
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Complete user onboarding
// @route   PATCH /api/auth/complete-onboarding
// @access  Private
const completeOnboarding = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.hasCompletedOnboarding = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Onboarding completed',
        });
    } catch (error) {
        next(error);
    }
};

const resetOnboarding = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.hasCompletedOnboarding = false;
        await user.save();
        res.status(200).json({ success: true, message: 'Onboarding reset' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    updatePassword,
    logout,
    createUser,
    completeOnboarding,
    resetOnboarding,
};

