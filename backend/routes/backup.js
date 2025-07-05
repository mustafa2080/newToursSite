const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'), false);
    }
  }
});

// Initialize Firestore
const db = admin.firestore();

// Collections to backup
const COLLECTIONS = [
  'trips',
  'hotels', 
  'users',
  'bookings',
  'reviews',
  'categories',
  'ratings'
];

// Get all backups
router.get('/', async (req, res) => {
  try {
    const backupsRef = db.collection('backups');
    const snapshot = await backupsRef.orderBy('created_at', 'desc').get();
    
    const backups = [];
    snapshot.forEach(doc => {
      backups.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    console.error('Error fetching backups:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching backups',
      error: error.message
    });
  }
});

// Get backup statistics
router.get('/stats', async (req, res) => {
  try {
    const backupsRef = db.collection('backups');
    const snapshot = await backupsRef.get();
    
    let totalSize = 0;
    let lastBackup = null;
    let autoBackupEnabled = true;

    snapshot.forEach(doc => {
      const data = doc.data();
      totalSize += data.size || 0;
      
      if (!lastBackup || new Date(data.created_at) > new Date(lastBackup)) {
        lastBackup = data.created_at;
      }
    });

    res.json({
      success: true,
      data: {
        totalBackups: snapshot.size,
        totalSize,
        lastBackup,
        autoBackupEnabled
      }
    });
  } catch (error) {
    console.error('Error fetching backup stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching backup stats',
      error: error.message
    });
  }
});

// Create new backup
router.post('/create', async (req, res) => {
  try {
    const { type = 'manual', description = '' } = req.body;
    
    console.log('🔄 Starting backup creation...');
    
    // Create backup data
    const backupData = {
      collections: {},
      metadata: {
        created_at: new Date().toISOString(),
        type,
        description,
        version: '1.0',
        total_documents: 0
      }
    };

    let totalDocuments = 0;

    // Backup each collection
    for (const collectionName of COLLECTIONS) {
      try {
        console.log(`📦 Backing up ${collectionName}...`);
        
        const collectionRef = db.collection(collectionName);
        const snapshot = await collectionRef.get();
        
        const documents = [];
        snapshot.forEach(doc => {
          documents.push({
            id: doc.id,
            data: doc.data()
          });
        });

        backupData.collections[collectionName] = documents;
        totalDocuments += documents.length;
        
        console.log(`✅ Backed up ${documents.length} documents from ${collectionName}`);
      } catch (error) {
        console.error(`❌ Error backing up ${collectionName}:`, error);
        backupData.collections[collectionName] = [];
      }
    }

    backupData.metadata.total_documents = totalDocuments;

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.json`;
    
    // Calculate size
    const backupJson = JSON.stringify(backupData, null, 2);
    const size = Buffer.byteLength(backupJson, 'utf8');

    // Save backup metadata to Firestore
    const backupRef = await db.collection('backups').add({
      filename,
      type,
      description,
      size,
      total_documents: totalDocuments,
      created_at: new Date().toISOString(),
      status: 'completed'
    });

    // Save backup file (in production, save to cloud storage)
    const backupDir = path.join(__dirname, '../backups');
    await fs.mkdir(backupDir, { recursive: true });
    await fs.writeFile(path.join(backupDir, filename), backupJson);

    console.log(`✅ Backup created successfully: ${filename}`);

    res.json({
      success: true,
      data: {
        id: backupRef.id,
        filename,
        size,
        total_documents: totalDocuments
      }
    });
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating backup',
      error: error.message
    });
  }
});

// Download backup
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get backup metadata
    const backupDoc = await db.collection('backups').doc(id).get();
    
    if (!backupDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    const backupData = backupDoc.data();
    const filename = backupData.filename;
    const filePath = path.join(__dirname, '../backups', filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }

    // Send file
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    
    const fileContent = await fs.readFile(filePath);
    res.send(fileContent);
  } catch (error) {
    console.error('Error downloading backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading backup',
      error: error.message
    });
  }
});

// Restore backup
router.post('/restore/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔄 Starting restore from backup ${id}...`);
    
    // Get backup metadata
    const backupDoc = await db.collection('backups').doc(id).get();
    
    if (!backupDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    const backupData = backupDoc.data();
    const filename = backupData.filename;
    const filePath = path.join(__dirname, '../backups', filename);

    // Read backup file
    const backupContent = await fs.readFile(filePath, 'utf8');
    const backup = JSON.parse(backupContent);

    let restoredCollections = 0;
    let restoredDocuments = 0;

    // Restore each collection
    for (const [collectionName, documents] of Object.entries(backup.collections)) {
      try {
        console.log(`📦 Restoring ${collectionName}...`);
        
        const collectionRef = db.collection(collectionName);
        
        // Delete existing documents (optional - comment out to keep existing data)
        const existingSnapshot = await collectionRef.get();
        const batch = db.batch();
        
        existingSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`🗑️ Deleted ${existingSnapshot.size} existing documents from ${collectionName}`);

        // Restore documents in batches
        const batchSize = 500;
        for (let i = 0; i < documents.length; i += batchSize) {
          const batchDocs = documents.slice(i, i + batchSize);
          const restoreBatch = db.batch();
          
          batchDocs.forEach(doc => {
            const docRef = collectionRef.doc(doc.id);
            restoreBatch.set(docRef, doc.data);
          });
          
          await restoreBatch.commit();
        }

        restoredCollections++;
        restoredDocuments += documents.length;
        
        console.log(`✅ Restored ${documents.length} documents to ${collectionName}`);
      } catch (error) {
        console.error(`❌ Error restoring ${collectionName}:`, error);
      }
    }

    console.log(`✅ Restore completed: ${restoredCollections} collections, ${restoredDocuments} documents`);

    res.json({
      success: true,
      data: {
        restored_collections: restoredCollections,
        restored_documents: restoredDocuments
      }
    });
  } catch (error) {
    console.error('❌ Error restoring backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring backup',
      error: error.message
    });
  }
});

// Upload and restore backup
router.post('/upload-restore', upload.single('backup'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No backup file provided'
      });
    }

    console.log('🔄 Starting restore from uploaded file...');

    // Read uploaded file
    const backupContent = await fs.readFile(req.file.path, 'utf8');
    const backup = JSON.parse(backupContent);

    // Validate backup format
    if (!backup.collections || !backup.metadata) {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup file format'
      });
    }

    let restoredCollections = 0;
    let restoredDocuments = 0;

    // Restore each collection
    for (const [collectionName, documents] of Object.entries(backup.collections)) {
      try {
        console.log(`📦 Restoring ${collectionName}...`);
        
        const collectionRef = db.collection(collectionName);
        
        // Delete existing documents
        const existingSnapshot = await collectionRef.get();
        const batch = db.batch();
        
        existingSnapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();

        // Restore documents in batches
        const batchSize = 500;
        for (let i = 0; i < documents.length; i += batchSize) {
          const batchDocs = documents.slice(i, i + batchSize);
          const restoreBatch = db.batch();
          
          batchDocs.forEach(doc => {
            const docRef = collectionRef.doc(doc.id);
            restoreBatch.set(docRef, doc.data);
          });
          
          await restoreBatch.commit();
        }

        restoredCollections++;
        restoredDocuments += documents.length;
        
        console.log(`✅ Restored ${documents.length} documents to ${collectionName}`);
      } catch (error) {
        console.error(`❌ Error restoring ${collectionName}:`, error);
      }
    }

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    console.log(`✅ Restore completed: ${restoredCollections} collections, ${restoredDocuments} documents`);

    res.json({
      success: true,
      data: {
        restored_collections: restoredCollections,
        restored_documents: restoredDocuments
      }
    });
  } catch (error) {
    console.error('❌ Error restoring uploaded backup:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error restoring backup',
      error: error.message
    });
  }
});

// Delete backup
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get backup metadata
    const backupDoc = await db.collection('backups').doc(id).get();
    
    if (!backupDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    const backupData = backupDoc.data();
    const filename = backupData.filename;
    const filePath = path.join(__dirname, '../backups', filename);

    // Delete file
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.log('Backup file not found on disk, continuing with metadata deletion');
    }

    // Delete metadata
    await db.collection('backups').doc(id).delete();

    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting backup',
      error: error.message
    });
  }
});

module.exports = router;
