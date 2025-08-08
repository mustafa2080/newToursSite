/**
 * Firebase Utilities
 * Helper functions for Firebase operations
 */

/**
 * Clean object by removing undefined values recursively
 * Firebase doesn't allow undefined values
 * @param {Object} obj - Object to clean
 * @returns {Object} - Cleaned object
 */
export const cleanFirebaseData = (obj) => {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj
      .map(item => cleanFirebaseData(item))
      .filter(item => item !== undefined);
  }

  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanFirebaseData(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }

  return obj;
};

/**
 * Prepare image data for Firebase storage
 * @param {Object} imageData - Image data object
 * @returns {Object} - Cleaned image data
 */
export const prepareImageForFirebase = (imageData) => {
  if (!imageData) return null;

  const cleaned = {
    base64: imageData.base64 || imageData.url || '',
    name: imageData.name || 'image',
    compressedSize: imageData.compressedSize || imageData.size || 0,
    compressionRatio: imageData.compressionRatio || 0,
    compressed: imageData.compressed || false,
  };

  // Only add firebaseId if it exists and is not undefined
  if (imageData.firebaseId && imageData.firebaseId !== undefined) {
    cleaned.firebaseId = imageData.firebaseId;
  }

  return cleaned;
};

/**
 * Prepare gallery images for Firebase storage
 * @param {Array} images - Array of image objects
 * @returns {Array} - Array of cleaned image objects
 */
export const prepareGalleryForFirebase = (images) => {
  if (!Array.isArray(images)) return [];

  return images
    .map(img => prepareImageForFirebase(img))
    .filter(img => img && img.base64);
};

/**
 * Convert Firebase timestamp to JavaScript Date
 * @param {Object} timestamp - Firebase timestamp
 * @returns {Date} - JavaScript Date object
 */
export const timestampToDate = (timestamp) => {
  if (!timestamp) return new Date();
  
  if (timestamp.toDate) {
    return timestamp.toDate();
  }
  
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  
  return new Date(timestamp);
};

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = {};
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = `${field} is required`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Generate slug from title
 * @param {string} title - Title to convert to slug
 * @returns {string} - URL-friendly slug
 */
export const generateSlug = (title) => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Format price for display
 * @param {number} price - Price value
 * @param {string} currency - Currency symbol
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price, currency = '$') => {
  if (!price || isNaN(price)) return `${currency}0`;
  
  return `${currency}${parseFloat(price).toLocaleString()}`;
};

/**
 * Calculate average rating
 * @param {Array} ratings - Array of rating objects
 * @returns {Object} - Average rating and count
 */
export const calculateAverageRating = (ratings) => {
  if (!Array.isArray(ratings) || ratings.length === 0) {
    return { average: 0, count: 0 };
  }
  
  const validRatings = ratings.filter(r => r.rating && !isNaN(r.rating));
  const total = validRatings.reduce((sum, r) => sum + parseFloat(r.rating), 0);
  
  return {
    average: validRatings.length > 0 ? (total / validRatings.length).toFixed(1) : 0,
    count: validRatings.length
  };
};

/**
 * Sanitize HTML content
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHtml = (html) => {
  if (!html) return '';
  
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/gi, '');
};

export default {
  cleanFirebaseData,
  prepareImageForFirebase,
  prepareGalleryForFirebase,
  timestampToDate,
  validateRequiredFields,
  generateSlug,
  formatPrice,
  calculateAverageRating,
  sanitizeHtml
};
