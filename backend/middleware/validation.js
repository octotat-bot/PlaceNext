const { validationResult, body, param, query } = require('express-validator');

// Validation result middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    next();
};

// Auth validations
const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    // Note: role is not accepted from user input - always defaults to 'student' for security
];

const loginValidation = [
    // Either email or phone is required
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('phone')
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit mobile number'),
    body('password').notEmpty().withMessage('Password is required'),
    // Custom validation: at least one of email or phone must be provided
    body().custom((value, { req }) => {
        if (!req.body.email && !req.body.phone) {
            throw new Error('Please provide email or phone number');
        }
        return true;
    }),
];

// Profile validations
const profileValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
    body('branch')
        .isIn([
            'Computer Science',
            'Information Technology',
            'Electronics',
            'Electrical',
            'Mechanical',
            'Civil',
            'Chemical',
            'Biotechnology',
            'Other',
        ])
        .withMessage('Invalid branch'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
    body('cgpa').isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
    body('backlogs').optional().isInt({ min: 0 }).withMessage('Backlogs must be a positive number'),
    body('phone')
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid phone number'),
];

// Drive validations
const driveValidation = [
    body('companyId').isMongoId().withMessage('Invalid company ID'),
    body('roleTitle').trim().notEmpty().withMessage('Role title is required'),
    body('roleDescription').trim().notEmpty().withMessage('Role description is required'),
    body('jobType').isIn(['internship', 'full-time', 'both']).withMessage('Invalid job type'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('applicationDeadline').isISO8601().withMessage('Invalid application deadline'),
    body('eligibilityCriteria.minCGPA')
        .isFloat({ min: 0, max: 10 })
        .withMessage('Minimum CGPA must be between 0 and 10'),
    body('eligibilityCriteria.allowedBranches')
        .isArray({ min: 1 })
        .withMessage('At least one branch must be selected'),
    body('eligibilityCriteria.maxBacklogs')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Maximum backlogs must be a positive number'),
];

// Company validations
const companyValidation = [
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('industry')
        .isIn([
            'Technology',
            'Finance',
            'Healthcare',
            'Manufacturing',
            'Consulting',
            'E-commerce',
            'Education',
            'Automotive',
            'Energy',
            'Other',
        ])
        .withMessage('Invalid industry'),
    body('website').optional().isURL().withMessage('Please provide a valid website URL'),
];

// Application status validation (accepts both backend and frontend status names)
const statusValidation = [
    body('status')
        .isIn([
            'applied', 'under-review', 'shortlisted', 'interview-scheduled', 'selected', 'rejected', 'withdrawn',
            'pending', 'reviewing', 'hired',
        ])
        .withMessage('Invalid application status'),
];

// Interview schedule validation
const interviewValidation = [
    body('applicationIds').isArray({ min: 1 }).withMessage('At least one application must be selected'),
    body('date').isISO8601().withMessage('Invalid interview date'),
    body('time').notEmpty().withMessage('Interview time is required'),
    body('round').isInt({ min: 1 }).withMessage('Round must be a positive number'),
];

// MongoDB ID validation
const mongoIdValidation = [
    param('id').isMongoId().withMessage('Invalid ID format'),
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    profileValidation,
    driveValidation,
    companyValidation,
    statusValidation,
    interviewValidation,
    mongoIdValidation,
};
