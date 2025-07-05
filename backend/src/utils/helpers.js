import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Generate random string
export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate secure random token
export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash password
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Compare password
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate slug from text
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate UUID format
export const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Validate phone number (basic)
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Format price for display
export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price);
};

// Format date for display
export const formatDate = (date, locale = 'en-US') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Calculate date difference in days
export const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

// Validate date range
export const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  return start >= now && end > start;
};

// Calculate pagination metadata
export const calculatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(total),
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    offset: (page - 1) * limit
  };
};

// Sanitize search query
export const sanitizeSearchQuery = (query) => {
  if (!query || typeof query !== 'string') return '';
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 100); // Limit length
};

// Generate meta description from content
export const generateMetaDescription = (content, maxLength = 160) => {
  if (!content) return '';
  
  // Remove HTML tags and extra whitespace
  const cleanContent = content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleanContent.length <= maxLength) return cleanContent;
  
  // Truncate at word boundary
  const truncated = cleanContent.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
};

// Calculate average rating
export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
};

// Generate booking reference
export const generateBookingReference = (prefix = 'BK') => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${date}-${random}`;
};

// Validate image file
export const isValidImageFile = (filename) => {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return validExtensions.includes(extension);
};

// Generate image alt text
export const generateImageAlt = (title, type = 'image') => {
  return `${title} - ${type}`.substring(0, 125); // Alt text should be under 125 characters
};

// Calculate reading time (words per minute)
export const calculateReadingTime = (content, wordsPerMinute = 200) => {
  if (!content) return 0;
  
  const wordCount = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .split(/\s+/)
    .filter(word => word.length > 0).length;
  
  return Math.ceil(wordCount / wordsPerMinute);
};

// Generate SEO-friendly URL
export const generateSEOUrl = (baseUrl, slug, id = null) => {
  const cleanSlug = generateSlug(slug);
  return id ? `${baseUrl}/${cleanSlug}-${id}` : `${baseUrl}/${cleanSlug}`;
};

// Sanitize HTML content (basic)
export const sanitizeHtmlContent = (content) => {
  if (!content) return '';
  
  // Basic HTML sanitization (in production, use a proper library like DOMPurify)
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .trim();
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Remove undefined/null values from object
export const cleanObject = (obj) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

// Convert string to boolean
export const stringToBoolean = (str) => {
  if (typeof str === 'boolean') return str;
  if (typeof str === 'string') {
    return str.toLowerCase() === 'true' || str === '1';
  }
  return false;
};

// Generate random color (hex)
export const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

// Escape regex special characters
export const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Convert bytes to human readable format
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Debounce function
export const debounce = (func, wait, immediate) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Get client IP address
export const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

// Generate cache key
export const generateCacheKey = (...parts) => {
  return parts.filter(Boolean).join(':');
};

// Check if date is in the past
export const isDateInPast = (date) => {
  return new Date(date) < new Date();
};

// Check if date is in the future
export const isDateInFuture = (date) => {
  return new Date(date) > new Date();
};

// Get age from date of birth
export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export default {
  generateRandomString,
  generateSecureToken,
  hashPassword,
  comparePassword,
  generateSlug,
  isValidEmail,
  isValidUUID,
  isValidPhoneNumber,
  formatPrice,
  formatDate,
  daysBetween,
  isValidDateRange,
  calculatePagination,
  sanitizeSearchQuery,
  generateMetaDescription,
  calculateAverageRating,
  generateBookingReference,
  isValidImageFile,
  generateImageAlt,
  calculateReadingTime,
  generateSEOUrl,
  sanitizeHtmlContent,
  deepClone,
  cleanObject,
  stringToBoolean,
  generateRandomColor,
  escapeRegex,
  formatBytes,
  debounce,
  throttle,
  getClientIP,
  generateCacheKey,
  isDateInPast,
  isDateInFuture,
  calculateAge
};
