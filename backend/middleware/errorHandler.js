const { AppError, ErrorCodes } = require('../utils/errors');
const { logger } = require('../utils/logger');

/**
 * Global Error Handler Middleware
 * Converts all errors to a consistent format and logs appropriately
 */
const errorHandler = (err, req, res, next) => {
    // Clone error to avoid mutation
    let error = err;

    // Log error details
    const logContext = {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id,
        userAgent: req.get('User-Agent'),
    };

    // Handle Mongoose CastError (bad ObjectId)
    if (err.name === 'CastError') {
        error = new AppError(
            'Invalid ID format',
            400,
            'VALIDATION_INVALID_ID',
            { field: err.path, value: err.value }
        );
    }

    // Handle Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        const value = err.keyValue?.[field];
        error = new AppError(
            `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
            409,
            'RESOURCE_DUPLICATE',
            { field, value }
        );
    }

    // Handle Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
            value: e.value,
        }));
        error = new AppError(
            'Validation failed',
            400,
            'VALIDATION_FAILED',
            { errors }
        );
    }

    // Handle JWT Errors
    if (err.name === 'JsonWebTokenError') {
        error = new AppError(
            'Invalid or malformed token. Please log in again.',
            401,
            'AUTH_TOKEN_INVALID'
        );
    }

    if (err.name === 'TokenExpiredError') {
        error = new AppError(
            'Your session has expired. Please log in again.',
            401,
            'AUTH_TOKEN_EXPIRED'
        );
    }

    // Handle Multer Errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        error = new AppError(
            'File size exceeds the maximum allowed size of 5MB',
            400,
            'FILE_TOO_LARGE',
            { maxSize: '5MB' }
        );
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        error = new AppError(
            'Too many files uploaded',
            400,
            'FILE_TOO_MANY'
        );
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        error = new AppError(
            'Unexpected file field',
            400,
            'FILE_UNEXPECTED_FIELD'
        );
    }

    // Handle Syntax Error (malformed JSON)
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        error = new AppError(
            'Invalid JSON in request body',
            400,
            'VALIDATION_INVALID_JSON'
        );
    }

    // Handle CORS Errors
    if (err.message === 'Not allowed by CORS') {
        error = new AppError(
            'Cross-origin request blocked',
            403,
            'AUTH_CORS_BLOCKED'
        );
    }

    // Determine if this is an operational error or programming error
    const isOperational = error instanceof AppError || error.isOperational;
    const statusCode = error.statusCode || 500;
    const errorCode = error.errorCode || 'SERVER_INTERNAL_ERROR';

    // Log the error
    if (statusCode >= 500) {
        // Server errors - log with full details
        logger.error('Server Error', {
            ...logContext,
            errorCode,
            message: err.message,
            stack: err.stack,
            isOperational,
        });
    } else if (statusCode >= 400) {
        // Client errors - log with less detail
        logger.warn('Client Error', {
            ...logContext,
            errorCode,
            message: error.message,
        });
    }

    // Prepare response
    const response = {
        success: false,
        error: {
            code: errorCode,
            message: isOperational ? error.message : 'An unexpected error occurred. Please try again later.',
        },
    };

    // Add error details if present and operational
    if (error.details && isOperational) {
        response.error.details = error.details;
    }

    // Add stack trace in development mode
    if (process.env.NODE_ENV === 'development') {
        response.error.stack = err.stack;
        response.error.originalMessage = err.message;
    }

    // Add timestamp
    response.timestamp = new Date().toISOString();

    // Add request ID if present (useful for debugging)
    if (req.requestId) {
        response.requestId = req.requestId;
    }

    // Send response
    res.status(statusCode).json(response);
};

/**
 * Not Found Handler - for undefined routes
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(
        `Cannot ${req.method} ${req.originalUrl}`,
        404,
        'ROUTE_NOT_FOUND',
        { method: req.method, path: req.originalUrl }
    );
    next(error);
};

/**
 * Async Handler - wraps async functions to catch errors
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Request ID Middleware - adds unique ID to each request for tracing
 */
const requestIdMiddleware = (req, res, next) => {
    req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    res.setHeader('X-Request-ID', req.requestId);
    next();
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    requestIdMiddleware,
};
