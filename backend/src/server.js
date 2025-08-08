import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { globalErrorHandler, handleUnhandledRoutes, logErrors, apiNotFound } from './middleware/errorHandler.js';
import {
  generalRateLimit,
  authRateLimit,
  bookingRateLimit,
  searchRateLimit,
  corsOptions,
  helmetConfig,
  sanitizeInput,
  preventSQLInjection,
  securityLogger,
  bruteForceProtection,
  gdprCompliance
} from './middleware/security.js';

// Load environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import hotelRoutes from './routes/hotels.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
// import userRoutes from './routes/users.js';
// import reviewRoutes from './routes/reviews.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet(helmetConfig));
app.use(securityLogger);
app.use(gdprCompliance);

// CORS configuration
app.use(cors(corsOptions));

// Rate limiting
app.use(generalRateLimit);

// Input sanitization and SQL injection prevention
app.use(sanitizeInput);
app.use(preventSQLInjection);
app.use(bruteForceProtection);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Tours API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes with specific rate limiting
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRateLimit, bookingRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Handle unhandled routes
app.use(apiNotFound);
app.use(handleUnhandledRoutes);

// Error handling middleware
app.use(logErrors);
app.use(globalErrorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
