/**
 * Image Storage Utilities
 * Compress images and convert to base64 for database storage
 */

/**
 * Compress an image file and convert to base64
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<Object>} - Compressed image data
 */
export const compressImageToBase64 = async (file, options = {}) => {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.7,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight);
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64
        const compressedBase64 = canvas.toDataURL(format, quality);
        
        // Calculate compression ratio
        const originalSize = file.size;
        const compressedSize = Math.round((compressedBase64.length * 3) / 4); // Approximate base64 size
        const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1) : 0;

        resolve({
          base64: compressedBase64,
          originalSize,
          compressedSize,
          compressionRatio,
          width,
          height,
          format,
          quality,
          name: file.name,
          type: file.type
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compress image from URL and convert to base64
 * @param {string} imageUrl - URL of the image to compress
 * @param {Object} options - Compression options
 * @returns {Promise<Object>} - Compressed image data
 */
export const compressImageFromUrlToBase64 = async (imageUrl, options = {}) => {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.7,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Enable CORS for external images
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight);
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64
        const compressedBase64 = canvas.toDataURL(format, quality);
        
        // Estimate original size (approximate)
        const estimatedOriginalSize = (img.width * img.height * 3); // RGB estimate
        const compressedSize = Math.round((compressedBase64.length * 3) / 4);
        const compressionRatio = estimatedOriginalSize > 0 ? ((estimatedOriginalSize - compressedSize) / estimatedOriginalSize * 100).toFixed(1) : 0;

        resolve({
          base64: compressedBase64,
          originalSize: estimatedOriginalSize,
          compressedSize,
          compressionRatio,
          width,
          height,
          format,
          quality,
          originalUrl: imageUrl
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image from URL: ${imageUrl}`));
    };

    img.src = imageUrl;
  });
};

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 * @param {number} originalWidth - Original image width
 * @param {number} originalHeight - Original image height
 * @param {number} maxWidth - Maximum allowed width
 * @param {number} maxHeight - Maximum allowed height
 * @returns {Object} - New dimensions
 */
const calculateDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  let width = originalWidth;
  let height = originalHeight;

  // Calculate scaling factor
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const scalingFactor = Math.min(widthRatio, heightRatio, 1); // Don't upscale

  width = Math.round(originalWidth * scalingFactor);
  height = Math.round(originalHeight * scalingFactor);

  return { width, height };
};

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {Object} - Validation result
 */
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Please select an image smaller than 10MB.'
    };
  }

  return { valid: true };
};

/**
 * Create thumbnail from base64 image
 * @param {string} base64Image - Base64 image data
 * @param {Object} options - Thumbnail options
 * @returns {Promise<string>} - Thumbnail base64
 */
export const createThumbnail = async (base64Image, options = {}) => {
  const {
    maxWidth = 150,
    maxHeight = 150,
    quality = 0.6
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        const { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight);
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const thumbnail = canvas.toDataURL('image/jpeg', quality);
        resolve(thumbnail);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to create thumbnail'));
    img.src = base64Image;
  });
};

/**
 * Batch compress multiple images
 * @param {Array} files - Array of image files
 * @param {Object} options - Compression options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} - Array of compressed images
 */
export const batchCompressImages = async (files, options = {}, onProgress = null) => {
  const results = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    try {
      const compressed = await compressImageToBase64(files[i], options);
      results.push({
        success: true,
        data: compressed,
        originalFile: files[i]
      });
    } catch (error) {
      results.push({
        success: false,
        error: error.message,
        originalFile: files[i]
      });
    }

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100)
      });
    }
  }

  return results;
};

export default {
  compressImageToBase64,
  compressImageFromUrlToBase64,
  formatFileSize,
  validateImageFile,
  createThumbnail,
  batchCompressImages
};
