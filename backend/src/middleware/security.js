import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { query } from '../config/database.js';

// Rate limiting configurations
export const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: 'error',
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => {
      res.status(429).json({
        status: 'error',
        message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// General API rate limiting
export const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiting for authentication endpoints
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later.',
  true // skip successful requests
);

// Rate limiting for booking endpoints
export const bookingRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 booking attempts per hour
  'Too many booking attempts, please try again later.'
);

// Rate limiting for search endpoints
export const searchRateLimit = createRateLimit(
  1 * 60 * 1000, // 1 minute
  30, // limit each IP to 30 search requests per minute
  'Too many search requests, please slow down.'
);

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'https://premiumtours.com',
      'https://www.premiumtours.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-API-Key'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

// Helmet security configuration
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net'
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.jsdelivr.net',
        'https://js.stripe.com'
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
        'https://cdn.jsdelivr.net'
      ],
      imgSrc: [
        "'self'",
        'data:',
        'https:',
        'http:'
      ],
      connectSrc: [
        "'self'",
        'https://api.stripe.com',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      frameSrc: [
        "'self'",
        'https://js.stripe.com'
      ]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remove potentially dangerous characters
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

// SQL injection prevention
export const preventSQLInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(;|\-\-|\#|\/\*|\*\/)/g,
    /(\b(OR|AND)\b.*=.*)/gi
  ];

  const checkForSQL = (value) => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  const checkObject = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && checkForSQL(value)) {
        return true;
      }
      if (typeof value === 'object' && value !== null && checkObject(value)) {
        return true;
      }
    }
    return false;
  };

  if (req.body && checkObject(req.body)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid input detected'
    });
  }

  if (req.query && checkObject(req.query)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid query parameters detected'
    });
  }

  next();
};

// API key validation middleware
export const validateAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      status: 'error',
      message: 'API key required'
    });
  }

  // In production, validate against database or environment variable
  const validAPIKeys = [
    process.env.API_KEY,
    process.env.ADMIN_API_KEY
  ].filter(Boolean);

  if (!validAPIKeys.includes(apiKey)) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid API key'
    });
  }

  next();
};

// Request logging for security monitoring
export const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script/gi, // XSS attempts
    /union.*select/gi, // SQL injection
    /exec\(/gi, // Code execution
    /eval\(/gi // Code evaluation
  ];

  const logSuspiciousActivity = (data, type) => {
    const isSuspicious = suspiciousPatterns.some(pattern => 
      JSON.stringify(data).match(pattern)
    );

    if (isSuspicious) {
      console.warn(`🚨 Suspicious ${type} detected:`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        data: JSON.stringify(data).substring(0, 500),
        timestamp: new Date().toISOString()
      });
    }
  };

  // Check request data
  if (req.body) logSuspiciousActivity(req.body, 'request body');
  if (req.query) logSuspiciousActivity(req.query, 'query parameters');
  if (req.params) logSuspiciousActivity(req.params, 'URL parameters');

  // Log response time and status
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow requests (potential DoS)
    if (duration > 5000) {
      console.warn(`🐌 Slow request detected:`, {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
        duration: `${duration}ms`,
        status: res.statusCode
      });
    }

    // Log failed authentication attempts
    if (req.originalUrl.includes('/auth/') && res.statusCode === 401) {
      console.warn(`🔐 Failed authentication attempt:`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    }
  });

  next();
};

// Brute force protection
const failedAttempts = new Map();

export const bruteForceProtection = (req, res, next) => {
  const key = `${req.ip}-${req.originalUrl}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  // Clean old entries
  for (const [k, v] of failedAttempts.entries()) {
    if (now - v.firstAttempt > windowMs) {
      failedAttempts.delete(k);
    }
  }

  const attempts = failedAttempts.get(key);

  if (attempts && attempts.count >= maxAttempts) {
    const timeLeft = windowMs - (now - attempts.firstAttempt);
    return res.status(429).json({
      status: 'error',
      message: 'Too many failed attempts. Please try again later.',
      retryAfter: Math.ceil(timeLeft / 1000)
    });
  }

  // Track failed attempts
  res.on('finish', () => {
    if (res.statusCode === 401 || res.statusCode === 403) {
      if (attempts) {
        attempts.count++;
      } else {
        failedAttempts.set(key, {
          count: 1,
          firstAttempt: now
        });
      }
    } else if (res.statusCode >= 200 && res.statusCode < 300) {
      // Clear on successful request
      failedAttempts.delete(key);
    }
  });

  next();
};

// GDPR compliance middleware
export const gdprCompliance = (req, res, next) => {
  // Add GDPR headers
  res.setHeader('X-Privacy-Policy', `${process.env.FRONTEND_URL}/privacy-policy`);
  res.setHeader('X-Cookie-Policy', `${process.env.FRONTEND_URL}/cookie-policy`);
  
  // Log data processing activities
  if (req.method === 'POST' && req.body && (req.body.email || req.body.personalData)) {
    console.log('📊 Personal data processing:', {
      endpoint: req.originalUrl,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      dataTypes: Object.keys(req.body).filter(key => 
        ['email', 'name', 'phone', 'address'].some(field => 
          key.toLowerCase().includes(field)
        )
      )
    });
  }

  next();
};

// Export all middleware
export default {
  generalRateLimit,
  authRateLimit,
  bookingRateLimit,
  searchRateLimit,
  corsOptions,
  helmetConfig,
  sanitizeInput,
  preventSQLInjection,
  validateAPIKey,
  securityLogger,
  bruteForceProtection,
  gdprCompliance
};
