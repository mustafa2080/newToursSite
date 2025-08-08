import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  StarIcon,
  MapPinIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  WifiIcon,
  TruckIcon,
  SwatchIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  UsersIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { getHotel } from '../services/firebase/hotels';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ShareButton from '../components/common/ShareButton';
import StarRatingSystem from '../components/reviews/StarRatingSystem';
import QuickRating from '../components/reviews/QuickRating';
import WishlistButton from '../components/wishlist/WishlistButton';
import CommentsSection from '../components/common/CommentsSection';

const HotelDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState(null);



  const amenityIcons = {
    wifi: WifiIcon,
    parking: TruckIcon,
    pool: SwatchIcon,
    gym: BuildingOfficeIcon,
    spa: SwatchIcon,
    restaurant: BuildingOfficeIcon,
  };

  useEffect(() => {
    loadHotel();
  }, [slug]);



  useEffect(() => {
    if (hotel && hotel.room_types && Object.keys(hotel.room_types).length > 0) {
      setSelectedRoomType(Object.keys(hotel.room_types)[0]);
    }
  }, [hotel]);

  const loadHotel = async () => {
    try {
      setLoading(true);
      console.log('🏨 Loading hotel details for slug:', slug);

      const response = await getHotel(slug);
      console.log('🏨 Hotel detail Firebase response:', response);

      if (response.success && response.hotel) {
        setHotel(response.hotel);
      } else {
        throw new Error(response.error || 'Hotel not found');
      }
    } catch (error) {
      console.error('Error loading hotel:', error);
      setError('Hotel not found');
    } finally {
      setLoading(false);
    }
  };



  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/hotels/${slug}` } } });
      return;
    }

    // Navigate directly to booking page without pre-selected data
    navigate(`/book/hotel/${hotel.id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };



  const renderStars = (rating, filled = false) => {
    if (!rating || rating === 0) return null;

    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          filled
            ? (i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300')
            : (i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300')
        }`}
      />
    ));
  };

  const nextImage = () => {
    const imageList = hotel.images || [];
    if (imageList.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === imageList.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    const imageList = hotel.images || [];
    if (imageList.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? imageList.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading hotel details..." />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hotel Not Found</h2>
          <p className="text-gray-600 mb-6">The hotel you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/hotels')}>
            Browse All Hotels
          </Button>
        </div>
      </div>
    );
  }

  // Handle different image field names and ensure we have valid images
  const getImages = () => {
    console.log('🏨 Hotel data for images:', {
      hotel: hotel,
      images: hotel.images,
      gallery: hotel.gallery,
      mainImage: hotel.mainImage,
      main_image: hotel.main_image,
      image: hotel.image,
      photo: hotel.photo
    });

    // Combine all possible image sources
    let allImages = [];

    // First, try to get the main/cover image
    const mainImage = hotel.mainImage || hotel.main_image || hotel.image || hotel.photo;
    if (mainImage && typeof mainImage === 'string' && mainImage.trim() !== '') {
      allImages.push(mainImage);
      console.log('🏨 Main/Cover image found:', mainImage.substring(0, 100) + '...');
    }

    // Then add gallery images
    const galleryFields = [
      hotel.gallery,
      hotel.images,
      hotel.image_gallery,
      hotel.photos
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

    console.log('🏨 Combined images:', allImages);

    // If no images found, use fallback
    if (allImages.length === 0) {
      console.log('🏨 No images found, using fallback');
      allImages = ['https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];
    }

    // Remove duplicates and ensure we have valid URLs
    const uniqueImages = [...new Set(allImages)].filter(img =>
      img && typeof img === 'string' && img.trim() !== ''
    );

    console.log('🏨 Final unique images:', uniqueImages);
    return uniqueImages;
  };

  const images = getImages();

  return (
    <div className="min-h-screen bg-gray-50 container-safe">
      {/* Image Gallery */}
      <div className="relative h-96 md:h-[500px] overflow-hidden bg-gray-200">
        <img
          src={images[currentImageIndex] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
          alt={`${hotel.name} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          style={{
            backgroundColor: '#f3f4f6',
            minHeight: '500px'
          }}
          onLoad={(e) => {
            console.log(`✅ Hotel image ${currentImageIndex + 1} loaded successfully`);
            e.target.style.backgroundColor = 'transparent';
          }}
          onError={(e) => {
            console.log('🖼️ Hotel image failed to load:', e.target.src);
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            e.target.style.backgroundColor = '#fef3c7';
            e.target.style.border = '2px solid #f59e0b';
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
                    e.target.src = 'https://picsum.photos/64/48?random=' + (200 + index);
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

        {/* Overlay Content */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="text-white">
              <div className="flex flex-wrap items-center mb-2 gap-2">
                {hotel.featured && (
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight break-words">
                {hotel.name}
              </h1>
              <div className="flex items-center text-sm sm:text-base lg:text-lg">
                <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 flex-shrink-0" />
                <span className="break-words overflow-wrap-anywhere">
                  {hotel.address || hotel.location || 'Location'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Hotel Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <QuickRating itemId={hotel.id} itemType="hotel" size="md" />
                </div>
                <div className="flex items-center space-x-2">
                  <WishlistButton
                    itemId={hotel.id}
                    itemType="hotel"
                    itemTitle={hotel.name}
                    itemImage={hotel.mainImage || hotel.main_image}
                    itemPrice={hotel.pricePerNight || hotel.price_per_night}
                    itemLocation={hotel.location}
                    size="small"
                    variant="ghost"
                  />
                  <ShareButton
                    title={hotel.name}
                    description={hotel.description || `Experience luxury at ${hotel.name} - Book your perfect stay!`}
                    url={window.location.href}
                    size="small"
                    variant="ghost"
                  />
                </div>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">About This Hotel</h2>
              <p className="text-gray-600 leading-relaxed break-words overflow-wrap-anywhere">
                {hotel.description}
              </p>
            </Card>

            {/* Hotel Facilities */}
            {(hotel.facilities || hotel.amenities) && ((hotel.facilities && hotel.facilities.length > 0) || (hotel.amenities && hotel.amenities.length > 0)) && (
              <Card className="p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600 mr-2" />
                  Hotel Facilities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(hotel.facilities || hotel.amenities || []).map((facility, index) => {
                    const IconComponent = amenityIcons[facility.toLowerCase()] || CheckIcon;
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <IconComponent className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 break-words overflow-wrap-anywhere font-medium">
                          {facility}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Location & Maps */}
            {(hotel.full_address || hotel.google_maps_link || hotel.address) && (
              <Card className="p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MapPinIcon className="h-6 w-6 text-blue-600 mr-2" />
                  Location & Address
                </h2>
                <div className="space-y-4">
                  {(hotel.full_address || hotel.address) && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Full Address</h3>
                      <p className="text-gray-600 leading-relaxed break-words overflow-wrap-anywhere">
                        {hotel.full_address || hotel.address}
                      </p>
                    </div>
                  )}

                  {hotel.google_maps_link && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">View on Map</h3>
                      <a
                        href={hotel.google_maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Room Types */}
            {hotel.room_types && Object.keys(hotel.room_types).length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Room Types</h2>
                <div className="space-y-4">
                  {Object.entries(hotel.room_types).map(([roomType, details]) => (
                    <motion.div
                      key={roomType}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedRoomType === roomType
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRoomType(roomType)}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2 break-words">
                            {roomType}
                          </h3>
                          <p className="text-gray-600 mb-3 break-words overflow-wrap-anywhere leading-relaxed">
                            {details.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {details.features?.map((feature, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 break-words"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl sm:text-2xl font-bold text-gray-900">
                            {formatPrice(details.price || hotel.price_per_night)}
                          </div>
                          <div className="text-gray-600 text-sm">per night</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}

            {/* Booking & Cancellation Policies */}
            {(hotel.booking_policy || hotel.cancellation_policy || (hotel.policies && Object.keys(hotel.policies).length > 0)) && (
              <Card className="p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
                  Booking & Cancellation Policies
                </h2>
                <div className="space-y-6">
                  {hotel.booking_policy && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
                        Booking Policy
                      </h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-gray-700 leading-relaxed break-words overflow-wrap-anywhere">
                          {hotel.booking_policy}
                        </p>
                      </div>
                    </div>
                  )}

                  {hotel.cancellation_policy && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CheckIcon className="h-5 w-5 text-red-600 mr-2" />
                        Cancellation Policy
                      </h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-gray-700 leading-relaxed break-words overflow-wrap-anywhere">
                          {hotel.cancellation_policy}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Legacy policies support */}
                  {hotel.policies && Object.keys(hotel.policies).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(hotel.policies).map(([policyType, policyText]) => (
                        <div key={policyType}>
                          <h3 className="font-semibold text-gray-900 mb-2 capitalize break-words">
                            {policyType.replace('_', ' ')}
                          </h3>
                          <p className="text-gray-600 text-sm break-words overflow-wrap-anywhere leading-relaxed">
                            {policyText}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Star Rating Section */}
            <div>
              <StarRatingSystem
                itemId={hotel.id}
                itemType="hotel"
                itemTitle={hotel.name}
                size="lg"
                showStats={true}
              />
            </div>
          </div>

          {/* Right Column - Interactive Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="p-6 border-2 border-blue-200">
                {/* Price Display */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(
                      selectedRoomType && hotel.room_types && hotel.room_types[selectedRoomType]?.price
                        ? hotel.room_types[selectedRoomType].price
                        : hotel.pricePerNight || hotel.price_per_night || 0
                    )}
                  </div>
                  <div className="text-gray-600">per night</div>


                </div>



                {/* Book Now Button */}
                <div className="mb-6">
                  <Button
                    fullWidth
                    size="large"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleBookNow}
                  >
                    Book This Hotel
                  </Button>
                </div>

                {/* Booking Guidelines */}
                <div className="text-center text-xs text-gray-500 space-y-1">
                  <div>✅ Free cancellation up to 24 hours before check-in</div>
                  <div>💳 No payment required today</div>
                  <div>📞 24/7 customer support</div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <CommentsSection
            itemId={hotel.id}
            itemType="hotel"
            title={`Comments for ${hotel.name}`}
          />
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
