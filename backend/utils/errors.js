/**
 * Custom Error Classes for the Placement Portal API
 * 
 * Error Codes:
 * - AUTH_xxx: Authentication/Authorization errors (401, 403)
 * - VALIDATION_xxx: Input validation errors (400)
 * - RESOURCE_xxx: Resource-related errors (404, 409)
 * - RATE_xxx: Rate limiting errors (429)
 * - SERVER_xxx: Server errors (500)
 * - FILE_xxx: File handling errors (400)
 */

// Base API Error class
class AppError extends Error {
    constructor(message, statusCode, errorCode = 'UNKNOWN_ERROR', details = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.isOperational = true; // Distinguishes from programming errors
        this.timestamp = new Date().toISOString();

        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            success: false,
            error: {
                code: this.errorCode,
                message: this.message,
                ...(this.details && { details: this.details }),
            },
            timestamp: this.timestamp,
        };
    }
}

// ==================== AUTHENTICATION ERRORS (401) ====================

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed', errorCode = 'AUTH_FAILED', details = null) {
        super(message, 401, errorCode, details);
    }
}

class InvalidCredentialsError extends AuthenticationError {
    constructor(message = 'Invalid email or password') {
        super(message, 'AUTH_INVALID_CREDENTIALS');
    }
}

class TokenExpiredError extends AuthenticationError {
    constructor(message = 'Your session has expired. Please log in again.') {
        super(message, 'AUTH_TOKEN_EXPIRED');
    }
}

class TokenInvalidError extends AuthenticationError {
    constructor(message = 'Invalid or malformed token') {
        super(message, 'AUTH_TOKEN_INVALID');
    }
}

class EmailNotVerifiedError extends AuthenticationError {
    constructor(message = 'Please verify your email before logging in') {
        super(message, 'AUTH_EMAIL_NOT_VERIFIED');
    }
}

class AccountLockedError extends AppError {
    constructor(remainingMinutes) {
        super(
            `Account is temporarily locked. Please try again in ${remainingMinutes} minutes.`,
            423,
            'AUTH_ACCOUNT_LOCKED',
            { remainingMinutes }
        );
    }
}

class AccountPendingError extends AppError {
    constructor(message = 'Your account is pending approval') {
        super(message, 403, 'AUTH_ACCOUNT_PENDING');
    }
}

class AccountDeactivatedError extends AppError {
    constructor(message = 'Your account has been deactivated. Please contact support.') {
        super(message, 403, 'AUTH_ACCOUNT_DEACTIVATED');
    }
}

class AccountRejectedError extends AppError {
    constructor(message = 'Your registration has been rejected. Please contact support.') {
        super(message, 403, 'AUTH_ACCOUNT_REJECTED');
    }
}

// ==================== AUTHORIZATION ERRORS (403) ====================

class AuthorizationError extends AppError {
    constructor(message = 'You do not have permission to perform this action', errorCode = 'AUTH_FORBIDDEN') {
        super(message, 403, errorCode);
    }
}

class InsufficientPermissionsError extends AuthorizationError {
    constructor(requiredRole) {
        super(
            `This action requires ${requiredRole} privileges`,
            'AUTH_INSUFFICIENT_PERMISSIONS'
        );
        this.details = { requiredRole };
    }
}

// ==================== VALIDATION ERRORS (400) ====================

class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors = []) {
        super(message, 400, 'VALIDATION_FAILED', { errors });
    }

    static fromExpressValidator(validationErrors) {
        const errors = validationErrors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg,
            value: err.value,
        }));
        return new ValidationError('Invalid input data', errors);
    }
}

class InvalidInputError extends AppError {
    constructor(message, field = null) {
        super(message, 400, 'VALIDATION_INVALID_INPUT', field ? { field } : null);
    }
}

class MissingFieldError extends AppError {
    constructor(field) {
        super(`Missing required field: ${field}`, 400, 'VALIDATION_MISSING_FIELD', { field });
    }
}

class InvalidEmailError extends ValidationError {
    constructor() {
        super('Please provide a valid email address', [{ field: 'email', message: 'Invalid email format' }]);
        this.errorCode = 'VALIDATION_INVALID_EMAIL';
    }
}

class WeakPasswordError extends ValidationError {
    constructor() {
        super('Password does not meet security requirements', [{
            field: 'password',
            message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
        }]);
        this.errorCode = 'VALIDATION_WEAK_PASSWORD';
    }
}

// ==================== RESOURCE ERRORS (404, 409) ====================

class NotFoundError extends AppError {
    constructor(resource = 'Resource', identifier = null) {
        super(
            identifier ? `${resource} with ID ${identifier} not found` : `${resource} not found`,
            404,
            'RESOURCE_NOT_FOUND',
            { resource, identifier }
        );
    }
}

class DuplicateError extends AppError {
    constructor(field, value = null) {
        super(
            `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
            409,
            'RESOURCE_DUPLICATE',
            { field, value }
        );
    }
}

class ConflictError extends AppError {
    constructor(message, details = null) {
        super(message, 409, 'RESOURCE_CONFLICT', details);
    }
}

class AlreadyAppliedError extends ConflictError {
    constructor(driveId) {
        super('You have already applied to this drive', { driveId });
        this.errorCode = 'APPLICATION_DUPLICATE';
    }
}

// ==================== FILE ERRORS (400) ====================

class FileError extends AppError {
    constructor(message, errorCode = 'FILE_ERROR', details = null) {
        super(message, 400, errorCode, details);
    }
}

class FileTooLargeError extends FileError {
    constructor(maxSize = '5MB') {
        super(`File size exceeds the maximum allowed size of ${maxSize}`, 'FILE_TOO_LARGE', { maxSize });
    }
}

class InvalidFileTypeError extends FileError {
    constructor(allowedTypes) {
        super(
            `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
            'FILE_INVALID_TYPE',
            { allowedTypes }
        );
    }
}

class FileNotFoundError extends FileError {
    constructor(message = 'No file uploaded') {
        super(message, 'FILE_NOT_FOUND');
    }
}

// ==================== RATE LIMITING ERRORS (429) ====================

class RateLimitError extends AppError {
    constructor(retryAfter = 60) {
        super(
            'Too many requests. Please try again later.',
            429,
            'RATE_LIMIT_EXCEEDED',
            { retryAfter }
        );
    }
}

// ==================== SERVER ERRORS (500) ====================

class InternalServerError extends AppError {
    constructor(message = 'An unexpected error occurred') {
        super(message, 500, 'SERVER_INTERNAL_ERROR');
        this.isOperational = false;
    }
}

class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500, 'SERVER_DATABASE_ERROR');
    }
}

class ExternalServiceError extends AppError {
    constructor(service, message = 'External service unavailable') {
        super(`${service}: ${message}`, 503, 'SERVER_EXTERNAL_SERVICE', { service });
    }
}

// ==================== ELIGIBILITY ERRORS ====================

class EligibilityError extends AppError {
    constructor(message = 'You are not eligible for this drive', criteria = null) {
        super(message, 403, 'ELIGIBILITY_NOT_MET', criteria ? { failedCriteria: criteria } : null);
    }
}

class CGPAEligibilityError extends EligibilityError {
    constructor(required, actual) {
        super(`Minimum CGPA requirement is ${required}. Your CGPA: ${actual}`, {
            criteria: 'cgpa',
            required,
            actual
        });
    }
}

class BranchEligibilityError extends EligibilityError {
    constructor(allowedBranches, actualBranch) {
        super(`This drive is only open to: ${allowedBranches.join(', ')}`, {
            criteria: 'branch',
            allowed: allowedBranches,
            actual: actualBranch
        });
    }
}

// ==================== PROFILE ERRORS ====================

class ProfileIncompleteError extends AppError {
    constructor(missingFields = []) {
        super(
            'Please complete your profile before applying',
            400,
            'PROFILE_INCOMPLETE',
            { missingFields }
        );
    }
}

class ResumeRequiredError extends AppError {
    constructor() {
        super('Please upload your resume before applying', 400, 'RESUME_REQUIRED');
    }
}

// ==================== ERROR CODE REFERENCE ====================

const ErrorCodes = {
    // Authentication (AUTH_)
    AUTH_FAILED: 'Authentication failed',
    AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
    AUTH_TOKEN_EXPIRED: 'Session expired',
    AUTH_TOKEN_INVALID: 'Invalid token',
    AUTH_EMAIL_NOT_VERIFIED: 'Email not verified',
    AUTH_ACCOUNT_LOCKED: 'Account locked',
    AUTH_ACCOUNT_PENDING: 'Account pending approval',
    AUTH_ACCOUNT_DEACTIVATED: 'Account deactivated',
    AUTH_ACCOUNT_REJECTED: 'Account rejected',
    AUTH_FORBIDDEN: 'Access forbidden',
    AUTH_INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',

    // Validation (VALIDATION_)
    VALIDATION_FAILED: 'Validation failed',
    VALIDATION_INVALID_INPUT: 'Invalid input',
    VALIDATION_MISSING_FIELD: 'Missing required field',
    VALIDATION_INVALID_EMAIL: 'Invalid email',
    VALIDATION_WEAK_PASSWORD: 'Weak password',

    // Resource (RESOURCE_)
    RESOURCE_NOT_FOUND: 'Resource not found',
    RESOURCE_DUPLICATE: 'Duplicate resource',
    RESOURCE_CONFLICT: 'Resource conflict',

    // Application (APPLICATION_)
    APPLICATION_DUPLICATE: 'Already applied',

    // File (FILE_)
    FILE_ERROR: 'File error',
    FILE_TOO_LARGE: 'File too large',
    FILE_INVALID_TYPE: 'Invalid file type',
    FILE_NOT_FOUND: 'No file uploaded',

    // Rate Limiting (RATE_)
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',

    // Server (SERVER_)
    SERVER_INTERNAL_ERROR: 'Internal server error',
    SERVER_DATABASE_ERROR: 'Database error',
    SERVER_EXTERNAL_SERVICE: 'External service error',

    // Eligibility (ELIGIBILITY_)
    ELIGIBILITY_NOT_MET: 'Eligibility not met',

    // Profile (PROFILE_)
    PROFILE_INCOMPLETE: 'Profile incomplete',
    RESUME_REQUIRED: 'Resume required',
};

module.exports = {
    // Base
    AppError,

    // Authentication
    AuthenticationError,
    InvalidCredentialsError,
    TokenExpiredError,
    TokenInvalidError,
    EmailNotVerifiedError,
    AccountLockedError,
    AccountPendingError,
    AccountDeactivatedError,
    AccountRejectedError,

    // Authorization
    AuthorizationError,
    InsufficientPermissionsError,

    // Validation
    ValidationError,
    InvalidInputError,
    MissingFieldError,
    InvalidEmailError,
    WeakPasswordError,

    // Resource
    NotFoundError,
    DuplicateError,
    ConflictError,
    AlreadyAppliedError,

    // File
    FileError,
    FileTooLargeError,
    InvalidFileTypeError,
    FileNotFoundError,

    // Rate Limiting
    RateLimitError,

    // Server
    InternalServerError,
    DatabaseError,
    ExternalServiceError,

    // Eligibility
    EligibilityError,
    CGPAEligibilityError,
    BranchEligibilityError,

    // Profile
    ProfileIncompleteError,
    ResumeRequiredError,

    // Error Codes Reference
    ErrorCodes,
};
