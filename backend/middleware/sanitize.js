const xss = require('xss');

// XSS sanitization options
const xssOptions = {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script'],
};

/**
 * Recursively sanitize object values
 */
const sanitizeValue = (value) => {
    if (typeof value === 'string') {
        return xss(value, xssOptions);
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }
    if (value !== null && typeof value === 'object') {
        return sanitizeObject(value);
    }
    return value;
};

/**
 * Sanitize all string values in an object
 */
const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeValue(value);
    }
    return sanitized;
};

/**
 * Middleware to sanitize request body, query, and params
 */
const sanitizeMiddleware = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
    }
    next();
};

/**
 * Sanitize a single string
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return xss(str, xssOptions);
};

module.exports = {
    sanitizeMiddleware,
    sanitizeObject,
    sanitizeString,
    sanitizeValue,
};
