"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const mongoose_1 = require("mongoose");
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, _req, res, _next) => {
    // Operational / known errors
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ success: false, error: err.message });
        return;
    }
    // Mongoose validation error
    if (err instanceof mongoose_1.Error.ValidationError) {
        const messages = Object.values(err.errors).map((e) => e.message);
        res.status(400).json({ success: false, error: messages.join(', ') });
        return;
    }
    // Mongoose duplicate key
    if (err.code === '11000') {
        const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
        res.status(409).json({ success: false, error: `${field} already exists` });
        return;
    }
    // Mongoose cast error (invalid ObjectId etc.)
    if (err instanceof mongoose_1.Error.CastError) {
        res.status(400).json({ success: false, error: `Invalid ${err.path}: ${err.value}` });
        return;
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({ success: false, error: 'Invalid token' });
        return;
    }
    if (err.name === 'TokenExpiredError') {
        res.status(401).json({ success: false, error: 'Token expired' });
        return;
    }
    // Unknown / unhandled
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map