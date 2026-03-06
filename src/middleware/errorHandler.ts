import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Operational / known errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  // Mongoose validation error
  if (err instanceof MongooseError.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({ success: false, error: messages.join(', ') });
    return;
  }

  // Mongoose duplicate key
  if ((err as NodeJS.ErrnoException).code === '11000') {
    const field = Object.keys((err as any).keyValue ?? {})[0] ?? 'field';
    res.status(409).json({ success: false, error: `${field} already exists` });
    return;
  }

  // Mongoose cast error (invalid ObjectId etc.)
  if (err instanceof MongooseError.CastError) {
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
