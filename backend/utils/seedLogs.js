import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || 'tours-52d78',
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();

const sampleLogs = [
  {
    level: 'info',
    category: 'auth',
    message: 'User successfully logged in',
    details: { user_id: 'user123', login_method: 'email' },
    user_id: 'user123',
    user_email: 'john.doe@example.com',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    level: 'error',
    category: 'api',
    message: 'Failed to process payment',
    details: { 
      error_code: 'PAYMENT_DECLINED',
      amount: 299.99,
      currency: 'USD',
      payment_method: 'credit_card'
    },
    user_id: 'user456',
    user_email: 'jane.smith@example.com',
    ip_address: '192.168.1.101',
    timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
  },
  {
    level: 'success',
    category: 'booking',
    message: 'Trip booking confirmed',
    details: {
      booking_id: 'booking789',
      trip_id: 'trip123',
      total_amount: 1299.99,
      participants: 2
    },
    user_id: 'user789',
    user_email: 'mike.wilson@example.com',
    ip_address: '192.168.1.102',
    timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
  },
  {
    level: 'warn',
    category: 'database',
    message: 'Database connection timeout warning',
    details: {
      connection_time: 5000,
      threshold: 3000,
      query: 'SELECT * FROM trips WHERE active = true'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 90) // 1.5 hours ago
  },
  {
    level: 'info',
    category: 'backup',
    message: 'Automatic backup completed successfully',
    details: {
      backup_size: '15.2 MB',
      collections_backed_up: 7,
      total_documents: 1543,
      duration: '2.3 seconds'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    level: 'error',
    category: 'upload',
    message: 'File upload failed - invalid format',
    details: {
      filename: 'vacation_photo.bmp',
      file_size: '25.6 MB',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      error: 'Unsupported file format'
    },
    user_id: 'user321',
    user_email: 'sarah.jones@example.com',
    ip_address: '192.168.1.103',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
  },
  {
    level: 'info',
    category: 'search',
    message: 'Search query executed',
    details: {
      query: 'beach vacation egypt',
      results_count: 23,
      execution_time: '0.15 seconds',
      filters_applied: ['location', 'price_range']
    },
    user_id: 'user654',
    user_email: 'alex.brown@example.com',
    ip_address: '192.168.1.104',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
  },
  {
    level: 'warn',
    category: 'email',
    message: 'Email delivery delayed',
    details: {
      recipient: 'customer@example.com',
      subject: 'Booking Confirmation',
      delay_reason: 'SMTP server temporarily unavailable',
      retry_count: 2
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
  },
  {
    level: 'success',
    category: 'system',
    message: 'System health check passed',
    details: {
      cpu_usage: '45%',
      memory_usage: '62%',
      disk_space: '78% available',
      response_time: '120ms',
      active_connections: 156
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
  },
  {
    level: 'error',
    category: 'auth',
    message: 'Multiple failed login attempts detected',
    details: {
      ip_address: '192.168.1.999',
      attempts: 5,
      time_window: '10 minutes',
      action_taken: 'IP temporarily blocked'
    },
    ip_address: '192.168.1.999',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 hours ago
  },
  {
    level: 'info',
    category: 'api',
    message: 'API rate limit warning',
    details: {
      endpoint: '/api/trips',
      requests_per_minute: 95,
      limit: 100,
      user_id: 'user999'
    },
    user_id: 'user999',
    user_email: 'heavy.user@example.com',
    ip_address: '192.168.1.105',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 hours ago
  },
  {
    level: 'success',
    category: 'database',
    message: 'Database optimization completed',
    details: {
      operation: 'index_rebuild',
      tables_optimized: 8,
      performance_improvement: '23%',
      duration: '45 minutes'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  }
];

const seedLogs = async () => {
  try {
    console.log('🌱 Seeding system logs...');
    
    const batch = db.batch();
    
    sampleLogs.forEach(log => {
      const docRef = db.collection('system_logs').doc();
      batch.set(docRef, {
        ...log,
        timestamp: admin.firestore.Timestamp.fromDate(log.timestamp)
      });
    });
    
    await batch.commit();
    
    console.log(`✅ Successfully seeded ${sampleLogs.length} log entries`);
    console.log('📋 Log categories:', [...new Set(sampleLogs.map(log => log.category))]);
    console.log('📊 Log levels:', [...new Set(sampleLogs.map(log => log.level))]);
    
  } catch (error) {
    console.error('❌ Error seeding logs:', error);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedLogs().then(() => {
    console.log('🏁 Seeding completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
}

export { seedLogs, sampleLogs };
