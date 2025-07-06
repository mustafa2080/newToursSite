import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PhotoIcon } from '@heroicons/react/24/outline';

const ImageGalleryTest = () => {
  // Test data with both main_image and images/gallery arrays
  const testTrip = {
    title: 'Test Trip with Images',
    main_image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Image handling logic (same as in TripDetail)
  const getImages = () => {
    console.log('🖼️ Test data for images:', {
      trip: testTrip,
      images: testTrip.images,
      gallery: testTrip.gallery,
      mainImage: testTrip.mainImage,
      main_image: testTrip.main_image,
      image: testTrip.image,
      photo: testTrip.photo
    });

    // Combine all possible image sources
    let allImages = [];
    
    // First, try to get the main/cover image
    const mainImage = testTrip.mainImage || testTrip.main_image || testTrip.image || testTrip.photo;
    if (mainImage && typeof mainImage === 'string' && mainImage.trim() !== '') {
      allImages.push(mainImage);
    }

    // Then add gallery images
    const galleryFields = [
      testTrip.gallery,
      testTrip.images,
      testTrip.image_gallery,
      testTrip.photos
    ];

    for (const field of galleryFields) {
      if (field && Array.isArray(field) && field.length > 0) {
        const validGalleryImages = field.filter(img => 
          img && typeof img === 'string' && img.trim() !== '' && !allImages.includes(img)
        );
        allImages = [...allImages, ...validGalleryImages];
        break; // Use the first valid gallery we find
      }
    }

    console.log('🖼️ Combined images:', allImages);

    // If no images found, use fallback
    if (allImages.length === 0) {
      console.log('🖼️ No images found, using fallback');
      allImages = ['https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];
    }

    // Remove duplicates and ensure we have valid URLs
    const uniqueImages = [...new Set(allImages)].filter(img => 
      img && typeof img === 'string' && img.trim() !== ''
    );
    
    console.log('🖼️ Final unique images:', uniqueImages);
    return uniqueImages;
  };

  const images = getImages();

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Image Gallery Test</h1>
      
      {/* Debug Info */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-semibold mb-2">Debug Info:</h2>
        <p><strong>Total Images Found:</strong> {images.length}</p>
        <p><strong>Current Image Index:</strong> {currentImageIndex}</p>
        <p><strong>Main Image:</strong> {testTrip.main_image ? '✅' : '❌'}</p>
        <p><strong>Images Array:</strong> {testTrip.images?.length || 0} items</p>
        <p><strong>Gallery Array:</strong> {testTrip.gallery?.length || 0} items</p>
      </div>

      {/* Image Gallery */}
      <div className="relative h-96 md:h-[500px] overflow-hidden bg-gray-200 rounded-lg">
        <img
          src={images[currentImageIndex] || 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
          alt={testTrip.title}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            console.log('🖼️ Image failed to load:', e.target.src);
            e.target.src = 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
        
        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all shadow-lg"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Gallery Button */}
        {images.length > 1 && (
          <button
            className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg hover:bg-opacity-75 transition-all flex items-center"
          >
            <PhotoIcon className="h-5 w-5 mr-2" />
            View Gallery ({images.length})
          </button>
        )}

        {/* Thumbnail gallery */}
        {images.length > 1 && (
          <div className="absolute bottom-16 left-4 flex space-x-2 max-w-xs overflow-x-auto">
            {images.slice(0, 5).map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&q=80';
                  }}
                />
              </button>
            ))}
            {images.length > 5 && (
              <div className="flex-shrink-0 w-16 h-12 bg-black bg-opacity-50 rounded-lg flex items-center justify-center text-white text-xs">
                +{images.length - 5}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image List */}
      <div className="mt-6">
        <h3 className="font-semibold mb-3">All Images ({images.length}):</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {images.map((image, index) => (
            <div key={index} className="p-2 bg-gray-50 rounded">
              <span className="font-medium">Image {index + 1}:</span>
              <br />
              <span className="text-gray-600 break-all">{image}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGalleryTest;
