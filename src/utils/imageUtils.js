/**
 * Image utility functions for handling different image field names and fallbacks
 * Supports both regular URLs and compressed image objects
 */

/**
 * Extract image URL from various formats (string URL or compressed object)
 * @param {string|Object} imageData - Image URL string or compressed image object
 * @returns {string|null} - Extracted image URL or null
 */
export const extractImageUrl = (imageData) => {
  if (!imageData) return null;

  // Handle compressed image objects
  if (typeof imageData === 'object' && imageData.base64) {
    return imageData.base64;
  }

  // Handle string URLs
  if (typeof imageData === 'string' && imageData.trim() !== '') {
    return imageData;
  }

  return null;
};

/**
 * Get the main image URL from an item (trip, hotel, etc.)
 * @param {Object} item - The item object
 * @param {string} fallbackCategory - Category for fallback image (trip, hotel, etc.)
 * @param {number} randomSeed - Random seed for fallback image
 * @returns {string} Image URL
 */
export const getMainImage = (item, fallbackCategory = 'general', randomSeed = 100) => {
  if (!item) return `https://picsum.photos/500/300?random=${randomSeed}`;

  // Try different possible field names for main image
  const mainImageFields = [
    item.mainImage,
    item.main_image,
    item.image,
    item.photo,
    item.thumbnail,
    item.cover_image,
    item.featured_image
  ];

  // Find the first valid image URL (handle both compressed objects and strings)
  const mainImage = mainImageFields.find(img => {
    if (!img) return false;

    // Handle compressed image objects
    if (typeof img === 'object' && img.base64) {
      return true;
    }

    // Handle string URLs
    if (typeof img === 'string' && img.trim() !== '') {
      return true;
    }

    return false;
  });

  if (mainImage) {
    // Return base64 if it's a compressed image object
    if (typeof mainImage === 'object' && mainImage.base64) {
      return mainImage.base64;
    }
    // Return string URL
    return mainImage;
  }
  
  // If no main image, try to get first image from gallery
  const galleryImage = getFirstGalleryImage(item);
  if (galleryImage) {
    return galleryImage;
  }
  
  // Return fallback image
  return getFallbackImage(fallbackCategory, randomSeed);
};

/**
 * Get all images from an item's gallery
 * @param {Object} item - The item object
 * @param {string} fallbackCategory - Category for fallback image
 * @param {number} randomSeed - Random seed for fallback image
 * @returns {Array} Array of image URLs
 */
export const getGalleryImages = (item, fallbackCategory = 'general', randomSeed = 100) => {
  if (!item) return [getFallbackImage(fallbackCategory, randomSeed)];
  
  // Try different possible field names for image galleries
  const galleryFields = [
    item.images,
    item.gallery,
    item.image_gallery,
    item.photos,
    item.pictures,
    item.media
  ];
  
  // Find the first non-empty array
  let images = galleryFields.find(field => 
    field && Array.isArray(field) && field.length > 0
  );
  
  // Filter out invalid URLs
  if (images && images.length > 0) {
    images = images.filter(img => 
      img && typeof img === 'string' && img.trim() !== ''
    );
  }
  
  // If no gallery images, try to get main image
  if (!images || images.length === 0) {
    const mainImage = getMainImage(item, fallbackCategory, randomSeed);
    if (mainImage) {
      images = [mainImage];
    }
  }
  
  // If still no images, use fallback
  if (!images || images.length === 0) {
    images = [getFallbackImage(fallbackCategory, randomSeed)];
  }
  
  return images;
};

/**
 * Get the first image from gallery
 * @param {Object} item - The item object
 * @returns {string|null} First gallery image URL or null
 */
export const getFirstGalleryImage = (item) => {
  if (!item) return null;
  
  const galleryFields = [
    item.images,
    item.gallery,
    item.image_gallery,
    item.photos
  ];
  
  for (const field of galleryFields) {
    if (field && Array.isArray(field) && field.length > 0) {
      const firstImage = field.find(img => 
        img && typeof img === 'string' && img.trim() !== ''
      );
      if (firstImage) return firstImage;
    }
  }
  
  return null;
};

/**
 * Get fallback image URL based on category
 * @param {string} category - Image category (trip, hotel, general, etc.)
 * @param {number} randomSeed - Random seed for unique fallback
 * @returns {string} Fallback image URL
 */
export const getFallbackImage = (category = 'general', randomSeed = 100) => {
  const fallbackImages = {
    trip: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&random=${randomSeed}`,
    hotel: `https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&random=${randomSeed}`,
    beach: `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&random=${randomSeed}`,
    mountain: `https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&random=${randomSeed}`,
    city: `https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&random=${randomSeed}`,
    desert: `https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&random=${randomSeed}`,
    general: `https://picsum.photos/500/300?random=${randomSeed}`
  };
  
  return fallbackImages[category.toLowerCase()] || fallbackImages.general;
};

/**
 * Handle image load error by setting fallback
 * @param {Event} event - Image error event
 * @param {string} fallbackCategory - Category for fallback image
 * @param {number} randomSeed - Random seed for fallback
 */
export const handleImageError = (event, fallbackCategory = 'general', randomSeed = 100) => {
  const img = event.target;
  const fallbackUrl = getFallbackImage(fallbackCategory, randomSeed);
  
  // Prevent infinite loop if fallback also fails
  if (img.src !== fallbackUrl) {
    console.log(`🖼️ Image failed to load: ${img.src}, using fallback`);
    img.src = fallbackUrl;
  }
};

/**
 * Preload images to improve performance
 * @param {Array} imageUrls - Array of image URLs to preload
 * @returns {Promise} Promise that resolves when all images are loaded
 */
export const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(url);
        img.src = url;
      });
    })
  );
};

/**
 * Check if an image URL is valid
 * @param {string} url - Image URL to check
 * @returns {Promise<boolean>} Promise that resolves to true if image is valid
 */
export const isValidImageUrl = (url) => {
  return new Promise((resolve) => {
    // Handle compressed image objects
    if (url && typeof url === 'object' && url.base64) {
      url = url.base64;
    }

    if (!url || typeof url !== 'string' || url.trim() === '') {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Get optimized image URL with size parameters
 * @param {string} url - Original image URL
 * @param {number} width - Desired width
 * @param {number} height - Desired height
 * @param {string} quality - Image quality (low, medium, high)
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (url, width = 500, height = 300, quality = 'medium') => {
  if (!url) return getFallbackImage('general');
  
  // If it's already a picsum or unsplash URL, add size parameters
  if (url.includes('picsum.photos')) {
    return `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`;
  }
  
  if (url.includes('unsplash.com')) {
    const qualityMap = {
      low: 60,
      medium: 80,
      high: 95
    };
    return `${url}&w=${width}&h=${height}&q=${qualityMap[quality] || 80}&fit=crop`;
  }
  
  // For other URLs, return as is
  return url;
};

export default {
  extractImageUrl,
  getMainImage,
  getGalleryImages,
  getFirstGalleryImage,
  getFallbackImage,
  handleImageError,
  preloadImages,
  isValidImageUrl,
  getOptimizedImageUrl
};
