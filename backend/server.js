const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

// Import routes
const reviewRoutes = require('./routes/reviews');
const adminReviewRoutes = require('./routes/admin-reviews');
const backupRoutes = require('./routes/backup');
const logsRoutes = require('./routes/logs');
const commentsRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tourism_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Stricter rate limiting for review submissions
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 review submissions per hour
  message: 'Too many review submissions, please try again later.'
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/reviews', reviewLimiter, reviewRoutes);
app.use('/api/admin', adminReviewRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/comments', commentsRoutes);

// Sample routes for trips and hotels (you would replace these with your actual routes)
app.get('/api/trips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Sample trip data - replace with actual database query
    const sampleTrip = {
      id: parseInt(id),
      title: 'Amazing Safari Adventure',
      description: 'Experience the wildlife of Africa in this incredible safari adventure. See lions, elephants, and more in their natural habitat.',
      location: 'Kenya, Africa',
      duration: 7,
      maxGroupSize: 12,
      price: 2499,
      image: 'https://example.com/safari.jpg',
      highlights: [
        'Professional safari guide',
        'Game drives in national parks',
        'Luxury tented accommodation',
        'All meals included',
        'Airport transfers'
      ]
    };
    
    res.json({
      success: true,
      data: sampleTrip
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Sample hotel data - replace with actual database query
    const sampleHotel = {
      id: parseInt(id),
      name: 'Luxury Beach Resort',
      description: 'A beautiful beachfront resort with stunning ocean views and world-class amenities.',
      location: 'Maldives',
      rating: 4.8,
      pricePerNight: 450,
      image: 'https://example.com/resort.jpg',
      amenities: [
        'Private beach access',
        'Infinity pool',
        'Spa and wellness center',
        'Multiple restaurants',
        'Water sports equipment'
      ]
    };
    
    res.json({
      success: true,
      data: sampleHotel
    });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large' });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { details: err.message } : {})
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
