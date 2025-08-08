/**
 * Advanced Image Compression Utility
 * Provides smart compression based on image type and use case
 */

/**
 * Compress image with smart settings based on use case
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<string>} - Compressed image as base64
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.7,
      outputFormat = 'image/jpeg',
      useSmartCompression = true
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const originalSize = file.size;
      
      // Smart compression settings based on file size and type
      let finalMaxWidth = maxWidth;
      let finalMaxHeight = maxHeight;
      let finalQuality = quality;

      if (useSmartCompression) {
        if (originalSize > 10 * 1024 * 1024) { // > 10MB
          finalMaxWidth = 800;
          finalMaxHeight = 800;
          finalQuality = 0.3;
        } else if (originalSize > 5 * 1024 * 1024) { // > 5MB
          finalMaxWidth = 1000;
          finalMaxHeight = 1000;
          finalQuality = 0.4;
        } else if (originalSize > 2 * 1024 * 1024) { // > 2MB
          finalMaxWidth = 1200;
          finalMaxHeight = 1200;
          finalQuality = 0.5;
        } else if (originalSize > 1 * 1024 * 1024) { // > 1MB
          finalMaxWidth = 1400;
          finalMaxHeight = 1400;
          finalQuality = 0.6;
        } else {
          finalMaxWidth = 1600;
          finalMaxHeight = 1600;
          finalQuality = 0.7;
        }
      }

      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      const aspectRatio = width / height;
      
      if (width > height) {
        if (width > finalMaxWidth) {
          width = finalMaxWidth;
          height = width / aspectRatio;
        }
      } else {
        if (height > finalMaxHeight) {
          height = finalMaxHeight;
          width = height * aspectRatio;
        }
      }

      // Ensure dimensions are integers
      width = Math.round(width);
      height = Math.round(height);

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Enable high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill with white background for JPEG (prevents transparency issues)
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      // Draw image with high quality
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 with specified quality
      const compressedBase64 = canvas.toDataURL(outputFormat, finalQuality);
      
      // Calculate compression stats
      const compressedSize = Math.round(compressedBase64.length * 0.75);
      const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);

      console.log('🖼️ Image compression stats:', {
        originalSize: `${Math.round(originalSize / 1024)}KB`,
        compressedSize: `${Math.round(compressedSize / 1024)}KB`,
        compression: `${compressionRatio}%`,
        dimensions: `${width}x${height}`,
        quality: finalQuality,
        format: outputFormat
      });

      resolve({
        base64: compressedBase64,
        originalSize,
        compressedSize,
        compressionRatio,
        width,
        height,
        quality: finalQuality
      });
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Preset compression settings for different use cases
 */
export const compressionPresets = {
  // For trip main images - high quality
  tripMain: {
    maxWidth: 1600,
    maxHeight: 1200,
    quality: 0.8,
    outputFormat: 'image/jpeg'
  },
  
  // For trip gallery images - balanced quality
  tripGallery: {
    maxWidth: 1200,
    maxHeight: 900,
    quality: 0.7,
    outputFormat: 'image/jpeg'
  },
  
  // For hotel main images - high quality
  hotelMain: {
    maxWidth: 1600,
    maxHeight: 1200,
    quality: 0.8,
    outputFormat: 'image/jpeg'
  },
  
  // For hotel gallery images - balanced quality
  hotelGallery: {
    maxWidth: 1200,
    maxHeight: 900,
    quality: 0.7,
    outputFormat: 'image/jpeg'
  },
  
  // For thumbnails - small size, lower quality
  thumbnail: {
    maxWidth: 400,
    maxHeight: 300,
    quality: 0.6,
    outputFormat: 'image/jpeg'
  },
  
  // For profile images - medium size
  profile: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.7,
    outputFormat: 'image/jpeg'
  }
};

/**
 * Compress multiple images with progress callback
 * @param {File[]} files - Array of image files
 * @param {Object} options - Compression options
 * @param {Function} onProgress - Progress callback (current, total)
 * @returns {Promise<Array>} - Array of compressed image data
 */
export const compressMultipleImages = async (files, options = {}, onProgress = null) => {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      const result = await compressImage(files[i], options);
      results.push({
        ...result,
        originalFile: files[i],
        index: i
      });
      
      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`Failed to compress image ${files[i].name}:`, error);
      results.push({
        error: error.message,
        originalFile: files[i],
        index: i
      });
    }
  }
  
  return results;
};

/**
 * Get optimal compression settings based on file size and type
 * @param {File} file - The image file
 * @param {string} useCase - The use case (tripMain, tripGallery, etc.)
 * @returns {Object} - Optimal compression settings
 */
export const getOptimalSettings = (file, useCase = 'default') => {
  const preset = compressionPresets[useCase] || compressionPresets.tripGallery;
  const fileSize = file.size;
  
  // Adjust quality based on file size
  let adjustedQuality = preset.quality;
  
  if (fileSize > 10 * 1024 * 1024) { // > 10MB
    adjustedQuality = Math.min(preset.quality, 0.4);
  } else if (fileSize > 5 * 1024 * 1024) { // > 5MB
    adjustedQuality = Math.min(preset.quality, 0.5);
  } else if (fileSize > 2 * 1024 * 1024) { // > 2MB
    adjustedQuality = Math.min(preset.quality, 0.6);
  }
  
  return {
    ...preset,
    quality: adjustedQuality,
    useSmartCompression: true
  };
};
