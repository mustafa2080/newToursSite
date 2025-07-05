// Import all models
import { User } from './User.js';
import { Trip } from './Trip.js';
import { Hotel } from './Hotel.js';
import { Category } from './Category.js';
import { Booking } from './Booking.js';
import { Review } from './Review.js';
import { Tag } from './Tag.js';
import { Wishlist } from './Wishlist.js';
import { Analytics } from './Analytics.js';

// Export all models for easy importing
export { User, Trip, Hotel, Category, Booking, Review, Tag, Wishlist, Analytics };

// Model utilities and helpers
export const Models = {
  User,
  Trip,
  Hotel,
  Category,
  Booking,
  Review,
  Tag,
  Wishlist,
  Analytics
};

// Common model operations
export const ModelHelpers = {
  // Generate slug from title/name
  generateSlug: (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  },

  // Validate UUID format
  isValidUUID: (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // Format price for display
  formatPrice: (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  },

  // Calculate pagination metadata
  calculatePagination: (page, limit, total) => {
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
  },

  // Sanitize search query
  sanitizeSearchQuery: (query) => {
    if (!query || typeof query !== 'string') return '';
    return query
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 100); // Limit length
  },

  // Generate booking reference
  generateBookingReference: (prefix = 'BK') => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${date}-${random}`;
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Calculate average rating
  calculateAverageRating: (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
  },

  // Format date for display
  formatDate: (date, locale = 'en-US') => {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Calculate date difference in days
  daysBetween: (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
  },

  // Validate date range
  isValidDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    return start >= now && end > start;
  },

  // Generate meta description from content
  generateMetaDescription: (content, maxLength = 160) => {
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
  },

  // Validate image file
  isValidImageFile: (filename) => {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return validExtensions.includes(extension);
  },

  // Generate image alt text
  generateImageAlt: (title, type = 'image') => {
    return `${title} - ${type}`.substring(0, 125); // Alt text should be under 125 characters
  },

  // Validate phone number (basic)
  isValidPhoneNumber: (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },

  // Calculate reading time (words per minute)
  calculateReadingTime: (content, wordsPerMinute = 200) => {
    if (!content) return 0;
    
    const wordCount = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    
    return Math.ceil(wordCount / wordsPerMinute);
  },

  // Generate SEO-friendly URL
  generateSEOUrl: (baseUrl, slug, id = null) => {
    const cleanSlug = ModelHelpers.generateSlug(slug);
    return id ? `${baseUrl}/${cleanSlug}-${id}` : `${baseUrl}/${cleanSlug}`;
  },

  // Validate and sanitize HTML content
  sanitizeHtmlContent: (content) => {
    if (!content) return '';
    
    // Basic HTML sanitization (in production, use a proper library like DOMPurify)
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .trim();
  }
};

export default Models;
