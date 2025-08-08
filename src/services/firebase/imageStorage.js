import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { compressImageToBase64, compressImageFromUrlToBase64, formatFileSize } from '../../utils/imageStorage';

const COLLECTION_NAME = 'compressed_images';

/**
 * Image Storage Service
 * Handles compressed image storage in Firebase Firestore
 */
export const imageStorageService = {
  
  /**
   * Store compressed image in Firebase
   * @param {File} file - Image file to compress and store
   * @param {Object} metadata - Additional metadata
   * @param {Object} compressionOptions - Compression options
   * @returns {Promise<Object>} - Storage result
   */
  storeImageFile: async (file, metadata = {}, compressionOptions = {}) => {
    try {
      console.log('📤 Compressing and storing image file:', file.name);
      
      // Compress image to base64
      const compressed = await compressImageToBase64(file, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.7,
        format: 'image/jpeg',
        ...compressionOptions
      });

      // Prepare document data
      const docData = {
        name: file.name,
        originalName: file.name,
        type: file.type,
        base64: compressed.base64,
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        compressionRatio: compressed.compressionRatio,
        width: compressed.width,
        height: compressed.height,
        format: compressed.format,
        quality: compressed.quality,
        folder: metadata.folder || 'general',
        category: metadata.category || 'image',
        tags: metadata.tags || [],
        description: metadata.description || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...metadata
      };

      // Store in Firebase
      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
      
      console.log(`✅ Image stored successfully with ID: ${docRef.id}`);
      console.log(`📊 Compression: ${compressed.compressionRatio}% (${formatFileSize(compressed.originalSize)} → ${formatFileSize(compressed.compressedSize)})`);
      
      return {
        success: true,
        id: docRef.id,
        data: { id: docRef.id, ...docData },
        compression: {
          originalSize: compressed.originalSize,
          compressedSize: compressed.compressedSize,
          ratio: compressed.compressionRatio
        }
      };
    } catch (error) {
      console.error('❌ Error storing image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Store image from URL
   * @param {string} imageUrl - URL of image to compress and store
   * @param {Object} metadata - Additional metadata
   * @param {Object} compressionOptions - Compression options
   * @returns {Promise<Object>} - Storage result
   */
  storeImageFromUrl: async (imageUrl, metadata = {}, compressionOptions = {}) => {
    try {
      console.log('📤 Compressing and storing image from URL:', imageUrl);
      
      // Compress image to base64
      const compressed = await compressImageFromUrlToBase64(imageUrl, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.7,
        format: 'image/jpeg',
        ...compressionOptions
      });

      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1].split('?')[0] || 'image.jpg';

      // Prepare document data
      const docData = {
        name: metadata.name || filename,
        originalName: filename,
        originalUrl: imageUrl,
        type: 'image/jpeg',
        base64: compressed.base64,
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        compressionRatio: compressed.compressionRatio,
        width: compressed.width,
        height: compressed.height,
        format: compressed.format,
        quality: compressed.quality,
        folder: metadata.folder || 'general',
        category: metadata.category || 'image',
        tags: metadata.tags || [],
        description: metadata.description || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...metadata
      };

      // Store in Firebase
      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
      
      console.log(`✅ Image from URL stored successfully with ID: ${docRef.id}`);
      console.log(`📊 Compression: ${compressed.compressionRatio}% (${formatFileSize(compressed.originalSize)} → ${formatFileSize(compressed.compressedSize)})`);
      
      return {
        success: true,
        id: docRef.id,
        data: { id: docRef.id, ...docData },
        compression: {
          originalSize: compressed.originalSize,
          compressedSize: compressed.compressedSize,
          ratio: compressed.compressionRatio
        }
      };
    } catch (error) {
      console.error('❌ Error storing image from URL:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get all stored images
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} - Images data
   */
  getAllImages: async (filters = {}) => {
    try {
      console.log('📂 Loading stored images...');
      
      let q = collection(db, COLLECTION_NAME);
      
      // Apply filters
      if (filters.folder) {
        q = query(q, where('folder', '==', filters.folder));
      }
      
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      // Order by creation date (newest first)
      q = query(q, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const images = [];
      
      querySnapshot.forEach((doc) => {
        images.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ Loaded ${images.length} stored images`);
      return {
        success: true,
        data: images
      };
    } catch (error) {
      console.error('❌ Error loading images:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  },

  /**
   * Get images by folder
   * @param {string} folder - Folder name
   * @returns {Promise<Object>} - Images data
   */
  getImagesByFolder: async (folder) => {
    return await imageStorageService.getAllImages({ folder });
  },

  /**
   * Update image metadata
   * @param {string} imageId - Image document ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} - Update result
   */
  updateImage: async (imageId, updates) => {
    try {
      console.log(`📝 Updating image ${imageId}...`);
      
      const imageRef = doc(db, COLLECTION_NAME, imageId);
      await updateDoc(imageRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Image updated successfully');
      return {
        success: true
      };
    } catch (error) {
      console.error('❌ Error updating image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Delete stored image
   * @param {string} imageId - Image document ID
   * @returns {Promise<Object>} - Delete result
   */
  deleteImage: async (imageId) => {
    try {
      console.log(`🗑️ Deleting image ${imageId}...`);
      
      await deleteDoc(doc(db, COLLECTION_NAME, imageId));
      
      console.log('✅ Image deleted successfully');
      return {
        success: true
      };
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get storage statistics
   * @returns {Promise<Object>} - Storage stats
   */
  getStorageStats: async () => {
    try {
      console.log('📊 Calculating storage statistics...');
      
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const stats = {
        totalImages: 0,
        totalOriginalSize: 0,
        totalCompressedSize: 0,
        totalSavings: 0,
        averageCompressionRatio: 0,
        byFolder: {},
        byFormat: {}
      };

      let totalCompressionRatio = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stats.totalImages++;
        stats.totalOriginalSize += data.originalSize || 0;
        stats.totalCompressedSize += data.compressedSize || 0;
        totalCompressionRatio += parseFloat(data.compressionRatio || 0);

        // By folder
        const folder = data.folder || 'unknown';
        if (!stats.byFolder[folder]) {
          stats.byFolder[folder] = { count: 0, size: 0 };
        }
        stats.byFolder[folder].count++;
        stats.byFolder[folder].size += data.compressedSize || 0;

        // By format
        const format = data.format || 'unknown';
        if (!stats.byFormat[format]) {
          stats.byFormat[format] = { count: 0, size: 0 };
        }
        stats.byFormat[format].count++;
        stats.byFormat[format].size += data.compressedSize || 0;
      });

      stats.totalSavings = stats.totalOriginalSize - stats.totalCompressedSize;
      stats.averageCompressionRatio = stats.totalImages > 0 ? 
        (totalCompressionRatio / stats.totalImages).toFixed(1) : 0;

      console.log('✅ Storage statistics calculated:', stats);
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ Error calculating storage stats:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
};

export default imageStorageService;
