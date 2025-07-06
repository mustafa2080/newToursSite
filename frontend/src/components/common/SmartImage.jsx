import React, { useState, useEffect } from 'react';
import { getMainImage, handleImageError, getOptimizedImageUrl } from '../../utils/imageUtils';

/**
 * Smart Image component that handles different image field names,
 * fallbacks, error handling, and optimization
 */
const SmartImage = ({
  item = null,
  src = null,
  alt = '',
  className = '',
  fallbackCategory = 'general',
  randomSeed = null,
  width = null,
  height = null,
  quality = 'medium',
  lazy = true,
  showLoader = true,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  // Generate random seed if not provided
  const seed = randomSeed || Math.floor(Math.random() * 1000);

  useEffect(() => {
    let imageUrl = '';
    
    if (src) {
      // Use provided src directly
      imageUrl = src;
    } else if (item) {
      // Extract image from item object
      imageUrl = getMainImage(item, fallbackCategory, seed);
    } else {
      // Use fallback
      imageUrl = getMainImage(null, fallbackCategory, seed);
    }

    // Optimize image URL if dimensions provided
    if (width && height) {
      imageUrl = getOptimizedImageUrl(imageUrl, width, height, quality);
    }

    setImageSrc(imageUrl);
  }, [item, src, fallbackCategory, seed, width, height, quality]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = (event) => {
    setIsLoading(false);
    setHasError(true);
    handleImageError(event, fallbackCategory, seed);
  };

  const imageProps = {
    src: imageSrc,
    alt: alt || (item?.title || item?.name || 'Image'),
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onLoad: handleLoad,
    onError: handleError,
    ...props
  };

  // Add lazy loading if supported and requested
  if (lazy && 'loading' in HTMLImageElement.prototype) {
    imageProps.loading = 'lazy';
  }

  return (
    <div className="relative">
      {/* Loading placeholder */}
      {showLoader && isLoading && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}>
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Error placeholder */}
      {hasError && (
        <div className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${className}`}>
          <div className="text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Image not available</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      <img {...imageProps} />
    </div>
  );
};

/**
 * Smart Image Gallery component for multiple images
 */
export const SmartImageGallery = ({
  item = null,
  images = null,
  className = '',
  fallbackCategory = 'general',
  randomSeed = null,
  maxImages = 10,
  showIndicators = true,
  showNavigation = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  ...props
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);

  // Generate random seed if not provided
  const seed = randomSeed || Math.floor(Math.random() * 1000);

  useEffect(() => {
    let imageList = [];
    
    if (images && Array.isArray(images)) {
      imageList = images;
    } else if (item) {
      // Extract images from item object using utility function
      const { getGalleryImages } = require('../../utils/imageUtils');
      imageList = getGalleryImages(item, fallbackCategory, seed);
    }

    // Limit number of images
    imageList = imageList.slice(0, maxImages);
    setGalleryImages(imageList);
  }, [item, images, fallbackCategory, seed, maxImages]);

  useEffect(() => {
    if (autoPlay && galleryImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => 
          prev === galleryImages.length - 1 ? 0 : prev + 1
        );
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, galleryImages.length]);

  const nextImage = () => {
    setCurrentIndex((prev) => 
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  if (galleryImages.length === 0) {
    return (
      <SmartImage
        item={item}
        className={className}
        fallbackCategory={fallbackCategory}
        randomSeed={seed}
        {...props}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main image */}
      <SmartImage
        src={galleryImages[currentIndex]}
        alt={`Image ${currentIndex + 1}`}
        className="w-full h-full object-cover"
        fallbackCategory={fallbackCategory}
        randomSeed={seed}
        {...props}
      />

      {/* Navigation buttons */}
      {showNavigation && galleryImages.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            aria-label="Previous image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            aria-label="Next image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && galleryImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image counter */}
      {galleryImages.length > 1 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {currentIndex + 1} / {galleryImages.length}
        </div>
      )}
    </div>
  );
};

export default SmartImage;
