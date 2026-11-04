import { AppError } from '../utils/appError.js';
import { ZodError } from 'zod';

export function notFound(req, res, next) {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl} - Route not found`, 404));
}

export function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 400);
  }

  // Handle Mongoose Duplicate Key (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `A record with that ${field} already exists.`;
    error = new AppError(message, 409);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    const message = `Validation error: ${messages.join('. ')}`;
    error = new AppError(message, 400);
  }

  // Handle Zod Validation Error
  if (err instanceof ZodError) {
    const issues = err.issues || err.errors || [];
    const details = issues.map((e) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: details,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Authentication token has expired', 401);
  }

  const statusCode = error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Do not leak stack trace or internal error messages in production
  const response = {
    success: false,
    message: error.isOperational ? error.message : 'An unexpected server error occurred.',
  };

  if (!isProduction && err.stack) {
    response.stack = err.stack;
  }

  if (error.errors) {
    response.errors = error.errors;
  }

  if (!error.isOperational) {
    console.error('[Unhandled Server Error]', err);
  }

  res.status(statusCode).json(response);
}

