import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { isProduction } from '../config';

interface ErrorResponse {
  success: false;
  message: string;
  stack?: string;
  error?: unknown;
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.name === 'MongoServerError' && 'code' in err && err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  if (!isOperational && !isProduction()) {
    console.error('💥 ERROR:', err);
  }

  const response: ErrorResponse = {
    success: false,
    message,
  };

  if (!isProduction()) {
    response.stack = err.stack;
    response.error = err;
  }

  res.status(statusCode).json(response);
};
