// Custom error class
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error handler wrapper
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Handle database errors
const handleDatabaseError = (err) => {
  let error = { ...err };
  error.message = err.message;

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    const field = err.detail?.match(/Key \((.+?)\)=/)?.[1] || 'field';
    const message = `${field} already exists. Please use a different value.`;
    error = new AppError(message, 400);
  }

  // PostgreSQL foreign key constraint violation
  if (err.code === '23503') {
    const message = 'Referenced resource does not exist.';
    error = new AppError(message, 400);
  }

  // PostgreSQL not null constraint violation
  if (err.code === '23502') {
    const field = err.column || 'field';
    const message = `${field} is required.`;
    error = new AppError(message, 400);
  }

  // PostgreSQL check constraint violation
  if (err.code === '23514') {
    const message = 'Invalid data provided. Please check your input.';
    error = new AppError(message, 400);
  }

  // PostgreSQL invalid UUID
  if (err.code === '22P02') {
    const message = 'Invalid ID format provided.';
    error = new AppError(message, 400);
  }

  return error;
};

// Handle JWT errors
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

// Handle validation errors
const handleValidationError = (err) => {
  const errors = Object.values(err.errors || {}).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle multer errors
const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large. Please upload a smaller file.', 400);
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files. Please upload fewer files.', 400);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field. Please check your upload.', 400);
  }
  return new AppError('File upload error. Please try again.', 400);
};

// Send error response in development
const sendErrorDev = (err, req, res) => {
  // API error
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // Rendered website error
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};

// Send error response in production
const sendErrorProd = (err, req, res) => {
  // API error
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }

  // Rendered website error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Programming or other unknown error
  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
};

// Global error handling middleware
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.code?.startsWith('23') || error.code === '22P02') {
      error = handleDatabaseError(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }
    if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    if (error.name === 'MulterError') {
      error = handleMulterError(error);
    }

    sendErrorProd(error, req, res);
  }
};

// Handle unhandled routes
export const handleUnhandledRoutes = (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
};

// Middleware to log errors
export const logErrors = (err, req, res, next) => {
  // Log error details
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || null,
    error: {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  };

  // In production, you might want to send this to a logging service
  console.error('Error Log:', JSON.stringify(errorLog, null, 2));

  next(err);
};

// Middleware to handle async errors in routes
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation error formatter
export const formatValidationErrors = (errors) => {
  return errors.map(error => ({
    field: error.param || error.path,
    message: error.msg || error.message,
    value: error.value
  }));
};

// Create standardized error responses
export const createErrorResponse = (message, statusCode = 500, errors = null) => {
  const response = {
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
};

// Create standardized success responses
export const createSuccessResponse = (data, message = 'Success', meta = null) => {
  const response = {
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString()
  };

  if (meta) {
    response.meta = meta;
  }

  return response;
};

// Middleware to handle 404 for API routes
export const apiNotFound = (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json(createErrorResponse(
      `API endpoint ${req.method} ${req.originalUrl} not found`,
      404
    ));
  }
  next();
};

// Rate limiting error handler
export const rateLimitHandler = (req, res) => {
  res.status(429).json(createErrorResponse(
    'Too many requests from this IP, please try again later.',
    429
  ));
};

export default {
  AppError,
  catchAsync,
  globalErrorHandler,
  handleUnhandledRoutes,
  logErrors,
  asyncHandler,
  formatValidationErrors,
  createErrorResponse,
  createSuccessResponse,
  apiNotFound,
  rateLimitHandler
};
