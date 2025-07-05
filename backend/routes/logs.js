const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Initialize Firestore
const db = admin.firestore();

// Get all logs with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      level = 'all',
      category = 'all',
      dateFrom,
      dateTo,
      search = '',
      page = 1,
      limit = 50
    } = req.query;

    console.log('📋 Fetching logs with filters:', { level, category, dateFrom, dateTo, search, page, limit });

    let query = db.collection('system_logs');

    // Apply filters
    if (level !== 'all') {
      query = query.where('level', '==', level);
    }

    if (category !== 'all') {
      query = query.where('category', '==', category);
    }

    if (dateFrom) {
      query = query.where('timestamp', '>=', new Date(dateFrom));
    }

    if (dateTo) {
      query = query.where('timestamp', '<=', new Date(dateTo));
    }

    // Order by timestamp (most recent first)
    query = query.orderBy('timestamp', 'desc');

    // Get total count for pagination
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.limit(parseInt(limit)).offset(offset);

    const snapshot = await query.get();
    let logs = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || data.timestamp
      });
    });

    // Apply search filter (client-side for flexibility)
    if (search) {
      const searchLower = search.toLowerCase();
      logs = logs.filter(log => 
        log.message?.toLowerCase().includes(searchLower) ||
        log.details?.toLowerCase().includes(searchLower) ||
        log.user_email?.toLowerCase().includes(searchLower)
      );
    }

    const totalPages = Math.ceil(total / parseInt(limit));

    console.log(`✅ Found ${logs.length} logs (${total} total)`);

    res.json({
      success: true,
      data: {
        logs,
        total,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching logs',
      error: error.message
    });
  }
});

// Get single log by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await db.collection('system_logs').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Log not found'
      });
    }

    const data = doc.data();
    res.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || data.timestamp
      }
    });
  } catch (error) {
    console.error('Error fetching log:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching log',
      error: error.message
    });
  }
});

// Clear all logs
router.delete('/', async (req, res) => {
  try {
    console.log('🗑️ Clearing all system logs...');
    
    const batch = db.batch();
    const snapshot = await db.collection('system_logs').get();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    console.log(`✅ Cleared ${snapshot.size} logs`);
    
    // Log this action
    await logActivity('info', 'system', 'System logs cleared', {
      cleared_count: snapshot.size,
      admin_action: true
    });

    res.json({
      success: true,
      message: `Cleared ${snapshot.size} logs successfully`
    });
  } catch (error) {
    console.error('❌ Error clearing logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing logs',
      error: error.message
    });
  }
});

// Export logs
router.get('/export', async (req, res) => {
  try {
    const {
      level = 'all',
      category = 'all',
      dateFrom,
      dateTo,
      search = ''
    } = req.query;

    console.log('📤 Exporting logs with filters:', { level, category, dateFrom, dateTo, search });

    let query = db.collection('system_logs');

    // Apply same filters as get all
    if (level !== 'all') {
      query = query.where('level', '==', level);
    }

    if (category !== 'all') {
      query = query.where('category', '==', category);
    }

    if (dateFrom) {
      query = query.where('timestamp', '>=', new Date(dateFrom));
    }

    if (dateTo) {
      query = query.where('timestamp', '<=', new Date(dateTo));
    }

    query = query.orderBy('timestamp', 'desc');

    const snapshot = await query.get();
    let logs = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || data.timestamp
      });
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      logs = logs.filter(log => 
        log.message?.toLowerCase().includes(searchLower) ||
        log.details?.toLowerCase().includes(searchLower) ||
        log.user_email?.toLowerCase().includes(searchLower)
      );
    }

    const exportData = {
      exported_at: new Date().toISOString(),
      filters: { level, category, dateFrom, dateTo, search },
      total_logs: logs.length,
      logs
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="system-logs-${new Date().toISOString().split('T')[0]}.json"`);
    res.send(JSON.stringify(exportData, null, 2));

    console.log(`✅ Exported ${logs.length} logs`);
  } catch (error) {
    console.error('❌ Error exporting logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting logs',
      error: error.message
    });
  }
});

// Get logs statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Fetching logs statistics...');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get total logs
    const totalSnapshot = await db.collection('system_logs').get();
    const total = totalSnapshot.size;

    // Get today's logs
    const todaySnapshot = await db.collection('system_logs')
      .where('timestamp', '>=', today)
      .get();
    const todayCount = todaySnapshot.size;

    // Get yesterday's logs
    const yesterdaySnapshot = await db.collection('system_logs')
      .where('timestamp', '>=', yesterday)
      .where('timestamp', '<', today)
      .get();
    const yesterdayCount = yesterdaySnapshot.size;

    // Get this week's logs
    const weekSnapshot = await db.collection('system_logs')
      .where('timestamp', '>=', weekAgo)
      .get();
    const weekCount = weekSnapshot.size;

    // Count by level
    const levelCounts = { error: 0, warn: 0, info: 0, success: 0 };
    const categoryCounts = {};

    totalSnapshot.forEach(doc => {
      const data = doc.data();
      if (levelCounts.hasOwnProperty(data.level)) {
        levelCounts[data.level]++;
      }
      
      if (data.category) {
        categoryCounts[data.category] = (categoryCounts[data.category] || 0) + 1;
      }
    });

    const stats = {
      total,
      today: todayCount,
      yesterday: yesterdayCount,
      thisWeek: weekCount,
      levelCounts,
      categoryCounts,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ Logs statistics:', stats);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching logs statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching logs statistics',
      error: error.message
    });
  }
});

// Utility function to log activities (can be used by other parts of the app)
const logActivity = async (level, category, message, details = {}, userId = null, userEmail = null, ipAddress = null, userAgent = null) => {
  try {
    const logData = {
      level, // error, warn, info, success
      category, // auth, api, database, backup, search, upload, email, system
      message,
      details: typeof details === 'object' ? details : { info: details },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      user_id: userId,
      user_email: userEmail,
      ip_address: ipAddress,
      user_agent: userAgent
    };

    await db.collection('system_logs').add(logData);
    console.log(`📝 Logged ${level}: ${message}`);
  } catch (error) {
    console.error('❌ Error logging activity:', error);
  }
};

// Export the logging function for use in other modules
router.logActivity = logActivity;

module.exports = router;
