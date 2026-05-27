/**
 * Frontend Error Handling Utilities
 * Provides consistent error handling across the application
 */

/**
 * Error code to user-friendly message mapping
 */
export const ERROR_MESSAGES = {
    // Authentication Errors
    AUTH_FAILED: 'Authentication failed. Please try again.',
    AUTH_INVALID_CREDENTIALS: 'Invalid email or password. Please check your credentials.',
    AUTH_TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    AUTH_TOKEN_INVALID: 'Your session is invalid. Please log in again.',
    AUTH_EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in.',
    AUTH_ACCOUNT_LOCKED: 'Your account is temporarily locked due to too many failed attempts.',
    AUTH_ACCOUNT_PENDING: 'Your account is pending approval. We\'ll notify you once approved.',
    AUTH_ACCOUNT_DEACTIVATED: 'Your account has been deactivated. Please contact support.',
    AUTH_ACCOUNT_REJECTED: 'Your registration was not approved. Please contact support.',
    AUTH_FORBIDDEN: 'You don\'t have permission to access this resource.',
    AUTH_INSUFFICIENT_PERMISSIONS: 'You don\'t have sufficient permissions for this action.',
    AUTH_CORS_BLOCKED: 'Request was blocked. Please try again.',

    // Validation Errors
    VALIDATION_FAILED: 'Please check your input and try again.',
    VALIDATION_INVALID_INPUT: 'Invalid input provided.',
    VALIDATION_MISSING_FIELD: 'Please fill in all required fields.',
    VALIDATION_INVALID_EMAIL: 'Please enter a valid email address.',
    VALIDATION_WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
    VALIDATION_INVALID_ID: 'Invalid request. Please try again.',
    VALIDATION_INVALID_JSON: 'Invalid request format.',

    // Resource Errors
    RESOURCE_NOT_FOUND: 'The requested resource was not found.',
    RESOURCE_DUPLICATE: 'This item already exists.',
    RESOURCE_CONFLICT: 'There was a conflict with existing data.',
    ROUTE_NOT_FOUND: 'The requested page was not found.',

    // Application Errors
    APPLICATION_DUPLICATE: 'You have already applied to this drive.',

    // File Errors
    FILE_ERROR: 'There was an error with the file.',
    FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
    FILE_INVALID_TYPE: 'Invalid file type. Please upload a supported file format.',
    FILE_NOT_FOUND: 'Please upload a file.',
    FILE_TOO_MANY: 'Too many files uploaded.',
    FILE_UNEXPECTED_FIELD: 'Unexpected file field.',

    // Rate Limiting
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
    RATE_LIMIT_AUTH: 'Too many login attempts. Please wait 15 minutes.',
    RATE_LIMIT_PASSWORD_RESET: 'Too many password reset attempts. Please try again later.',

    // Server Errors
    SERVER_INTERNAL_ERROR: 'Something went wrong. Please try again later.',
    SERVER_DATABASE_ERROR: 'A database error occurred. Please try again.',
    SERVER_EXTERNAL_SERVICE: 'An external service is unavailable. Please try again.',

    // Eligibility Errors
    ELIGIBILITY_NOT_MET: 'You are not eligible for this drive.',

    // Profile Errors
    PROFILE_INCOMPLETE: 'Please complete your profile before proceeding.',
    RESUME_REQUIRED: 'Please upload your resume before applying.',

    // Network Errors
    NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
    TIMEOUT_ERROR: 'The request took too long. Please try again.',

    // Default
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

/**
 * Parse API error response and return user-friendly message
 * @param {Error|Object} error - The error object from axios or API
 * @returns {Object} Parsed error with message, code, and details
 */
export const parseError = (error) => {
    // Handle axios errors
    if (error.response) {
        const { data, status } = error.response;

        // New error format with error object
        if (data?.error) {
            const errorCode = data.error.code || 'UNKNOWN_ERROR';
            return {
                message: ERROR_MESSAGES[errorCode] || data.error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
                code: errorCode,
                details: data.error.details || null,
                status,
                requestId: data.requestId,
                timestamp: data.timestamp,
            };
        }

        // Legacy error format
        if (data?.message) {
            return {
                message: data.message,
                code: 'LEGACY_ERROR',
                status,
            };
        }

        // HTTP status-based fallbacks
        const statusMessages = {
            400: 'Bad request. Please check your input.',
            401: 'Please log in to continue.',
            403: 'You don\'t have permission for this action.',
            404: 'The requested resource was not found.',
            409: 'There was a conflict with existing data.',
            422: 'Invalid input data.',
            429: 'Too many requests. Please try again later.',
            500: 'Server error. Please try again later.',
            502: 'Server is temporarily unavailable.',
            503: 'Service is temporarily unavailable.',
        };

        return {
            message: statusMessages[status] || `Error: ${status}`,
            code: `HTTP_${status}`,
            status,
        };
    }

    // Handle network errors
    if (error.request) {
        if (error.code === 'ECONNABORTED') {
            return {
                message: ERROR_MESSAGES.TIMEOUT_ERROR,
                code: 'TIMEOUT_ERROR',
            };
        }
        return {
            message: ERROR_MESSAGES.NETWORK_ERROR,
            code: 'NETWORK_ERROR',
        };
    }

    // Handle other errors
    return {
        message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
        code: 'UNKNOWN_ERROR',
    };
};

/**
 * Get validation errors as an object keyed by field name
 * @param {Object} parsedError - Error parsed by parseError
 * @returns {Object} Field errors { fieldName: errorMessage }
 */
export const getFieldErrors = (parsedError) => {
    if (!parsedError.details?.errors) return {};

    return parsedError.details.errors.reduce((acc, err) => {
        acc[err.field] = err.message;
        return acc;
    }, {});
};

/**
 * Check if error is an authentication error that requires redirect
 * @param {Object} parsedError - Error parsed by parseError
 * @returns {boolean}
 */
export const isAuthError = (parsedError) => {
    const authCodes = [
        'AUTH_TOKEN_EXPIRED',
        'AUTH_TOKEN_INVALID',
        'AUTH_FAILED',
    ];
    return authCodes.includes(parsedError.code) || parsedError.status === 401;
};

/**
 * Check if error is a validation error
 * @param {Object} parsedError - Error parsed by parseError
 * @returns {boolean}
 */
export const isValidationError = (parsedError) => {
    return parsedError.code?.startsWith('VALIDATION_') || parsedError.status === 400;
};

/**
 * Check if error is a rate limit error
 * @param {Object} parsedError - Error parsed by parseError
 * @returns {boolean}
 */
export const isRateLimitError = (parsedError) => {
    return parsedError.code?.startsWith('RATE_LIMIT') || parsedError.status === 429;
};

/**
 * Check if error is a server error
 * @param {Object} parsedError - Error parsed by parseError
 * @returns {boolean}
 */
export const isServerError = (parsedError) => {
    return parsedError.code?.startsWith('SERVER_') || parsedError.status >= 500;
};

/**
 * Format error for display
 * @param {Error|Object} error - Error from API
 * @param {string} fallbackMessage - Fallback message if parsing fails
 * @returns {string} User-friendly error message
 */
export const formatErrorMessage = (error, fallbackMessage = 'Something went wrong') => {
    try {
        const parsed = parseError(error);
        return parsed.message;
    } catch {
        return fallbackMessage;
    }
};

/**
 * Log error for debugging (only in development)
 * @param {string} context - Where the error occurred
 * @param {Error|Object} error - The error object
 */
export const logError = (context, error) => {
    if (import.meta.env.DEV) {
        console.group(`🔴 Error: ${context}`);
        console.error('Error:', error);
        if (error.response) {
            console.error('Response:', error.response.data);
            console.error('Status:', error.response.status);
        }
        console.groupEnd();
    }
};

/**
 * Create error handler for async operations
 * @param {Function} onError - Error handler callback
 * @param {Object} options - Options
 * @returns {Function} Error handler
 */
export const createErrorHandler = (onError, options = {}) => {
    const {
        _showToast = true,
        logErrors = true,
        context = 'Operation'
    } = options;

    return (error) => {
        const parsed = parseError(error);

        if (logErrors) {
            logError(context, error);
        }

        if (onError) {
            onError(parsed);
        }

        return parsed;
    };
};

export default {
    parseError,
    getFieldErrors,
    formatErrorMessage,
    isAuthError,
    isValidationError,
    isRateLimitError,
    isServerError,
    logError,
    createErrorHandler,
    ERROR_MESSAGES,
};
