import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  StarIcon,
  CalendarDaysIcon,
  UsersIcon,
  MapPinIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ShareButton from '../components/common/ShareButton';
import StarRatingSystem from '../components/reviews/StarRatingSystem';
import QuickRating from '../components/reviews/QuickRating';
import WishlistButton from '../components/wishlist/WishlistButton';
import CommentsSection from '../components/common/CommentsSection';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const TripDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);



  useEffect(() => {
    loadTrip();
  }, [slug]);



  const loadTrip = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading trip with slug:', slug);

      let tripData = null;

      // First try to get by slug
      const tripsQuery = query(
        collection(db, 'trips'),
        where('slug', '==', slug)
      );

      const querySnapshot = await getDocs(tripsQuery);

      if (!querySnapshot.empty) {
        // Found by slug
        const tripDoc = querySnapshot.docs[0];
        tripData = { id: tripDoc.id, ...tripDoc.data() };
        console.log('🗺️ Trip found by slug:', tripData.title);
      } else {
        // Try to get by ID (in case slug is actually an ID)
        try {
          const tripDocRef = doc(db, 'trips', slug);
          const tripDoc = await getDoc(tripDocRef);

          if (tripDoc.exists()) {
            tripData = { id: tripDoc.id, ...tripDoc.data() };
            console.log('🗺️ Trip found by ID:', tripData.title);
          }
        } catch (idError) {
          console.log('🔍 Not a valid document ID, continuing...');
        }
      }

      if (!tripData) {
        // If still not found, let's check what trips exist
        console.log('🔍 Trip not found, checking available trips...');
        const allTripsQuery = query(collection(db, 'trips'));
        const allTripsSnapshot = await getDocs(allTripsQuery);

        console.log('📋 Available trips:');
        allTripsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log(`- ID: ${doc.id}, Slug: ${data.slug}, Title: ${data.title}`);
        });

        throw new Error(`Trip not found. Searched for: "${slug}"`);
      }

      setTrip(tripData);
    } catch (error) {
      console.error('Error loading trip:', error);
      setError(error.message || 'Trip not found');
    } finally {
      setLoading(false);
    }
  };



  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/trips/${slug}` } } });
      return;
    }

    // Navigate directly to booking page without pre-selected data
    navigate(`/book/trip/${trip.id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Calculate end date based on start date and trip duration
  const calculateEndDate = (startDate, durationDays) => {
    if (!startDate || !durationDays) return null;

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + parseInt(durationDays) - 1);

    return end;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    challenging: 'bg-orange-100 text-orange-800',
    difficult: 'bg-red-100 text-red-800',
  };

  const nextImage = () => {
    if (trip.gallery && trip.gallery.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === trip.gallery.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (trip.gallery && trip.gallery.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? trip.gallery.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading trip details..." />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Not Found</h2>
          <p className="text-gray-600 mb-6">The trip you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/trips')}>
            Browse All Trips
          </Button>
        </div>
      </div>
    );
  }

  // Handle different image field names and ensure we have valid images
  const getImages = () => {
    console.log('🖼️ Trip data for images:', {
      trip: trip,
      images: trip.images,
      gallery: trip.gallery,
      mainImage: trip.mainImage,
      main_image: trip.main_image,
      image: trip.image,
      photo: trip.photo
    });

    // Combine all possible image sources
    let allImages = [];

    // First, try to get the main/cover image
    const mainImage = trip.mainImage || trip.main_image || trip.image || trip.photo;
    if (mainImage && typeof mainImage === 'string' && mainImage.trim() !== '') {
      allImages.push(mainImage);
      console.log('🖼️ Main/Cover image found:', mainImage.substring(0, 100) + '...');
    }

    // Then add gallery images
    const galleryFields = [
      trip.gallery,
      trip.images,
      trip.image_gallery,
      trip.photos
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

  return (
    <div className="min-h-screen bg-gray-50 container-safe">
      {/* Image Gallery */}
      <div className="relative h-96 md:h-[500px] overflow-hidden bg-gray-200">
        <img
          src={images[currentImageIndex] || 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
          alt={`${trip.title} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          style={{
            backgroundColor: '#f3f4f6',
            minHeight: '500px'
          }}
          onLoad={(e) => {
            console.log(`✅ Trip image ${currentImageIndex + 1} loaded successfully`);
            e.target.style.backgroundColor = 'transparent';
          }}
          onError={(e) => {
            console.log('🖼️ Trip image failed to load:', e.target.src);
            e.target.src = 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
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
            onClick={() => setShowGallery(true)}
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
                    e.target.src = 'https://picsum.photos/64/48?random=' + (100 + index);
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[trip.difficultyLevel || trip.difficulty_level] || 'bg-gray-100 text-gray-800'}`}>
                  {trip.difficultyLevel || trip.difficulty_level || 'Easy'}
                </span>
                {trip.featured && (
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight break-words">
                {trip.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base lg:text-lg">
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {trip.durationDays || trip.duration_days || 'N/A'} days
                  </span>
                </div>
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    Max {trip.maxParticipants || trip.max_participants || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 flex-shrink-0" />
                  <span className="truncate max-w-xs">
                    {trip.location || trip.categoryName || trip.category_name || 'Location'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trip Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <QuickRating itemId={trip.id} itemType="trip" size="md" />
                </div>
                <div className="flex items-center space-x-2">
                  <WishlistButton
                    itemId={trip.id}
                    itemType="trip"
                    itemTitle={trip.title}
                    itemImage={trip.mainImage || trip.main_image}
                    itemPrice={trip.price}
                    itemLocation={trip.location}
                    size="small"
                    variant="ghost"
                  />
                  <ShareButton
                    title={trip.title}
                    description={trip.description || trip.shortDescription || `Discover ${trip.title} - An amazing travel experience!`}
                    url={window.location.href}
                    size="small"
                    variant="ghost"
                  />
                </div>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">About This Trip</h2>
              <p className="text-gray-600 leading-relaxed break-words overflow-wrap-anywhere">
                {trip.description || trip.shortDescription || 'No description available.'}
              </p>
            </Card>

            {/* Itinerary */}
            {trip.itinerary && trip.itinerary.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Itinerary</h2>
                <div className="space-y-6">
                  {trip.itinerary.map((day, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-2 break-words">
                          Day {index + 1}: {day.title}
                        </h3>
                        <p className="text-gray-600 break-words overflow-wrap-anywhere leading-relaxed">
                          {day.description}
                        </p>
                        {day.activities && day.activities.length > 0 && (
                          <ul className="mt-3 space-y-2">
                            {day.activities.map((activity, actIndex) => (
                              <li key={actIndex} className="text-sm text-gray-500 flex items-start gap-2">
                                <ClockIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span className="break-words overflow-wrap-anywhere">
                                  {activity}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}

            {/* What's Included & Excluded */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Included Services */}
              {(trip.included || trip.included_services) && (trip.included || trip.included_services).length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
                    Included Services
                  </h3>
                  <ul className="space-y-3">
                    {(trip.included || trip.included_services).map((service, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600">
                        <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="break-words overflow-wrap-anywhere leading-relaxed">
                          {service}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Excluded Services */}
              {(trip.excluded || trip.excluded_services) && (trip.excluded || trip.excluded_services).length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <XMarkIcon className="h-5 w-5 text-red-600 mr-2" />
                    Not Included
                  </h3>
                  <ul className="space-y-3">
                    {(trip.excluded || trip.excluded_services).map((service, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600">
                        <XMarkIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="break-words overflow-wrap-anywhere leading-relaxed">
                          {service}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            {/* Location & Maps */}
            {(trip.google_maps_link || (trip.coordinates && (trip.coordinates.lat || trip.coordinates.lng))) && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="h-5 w-5 text-blue-600 mr-2" />
                  Location & Maps
                </h3>
                <div className="space-y-4">
                  {trip.google_maps_link && (
                    <div>
                      <p className="text-gray-600 mb-3">View this location on Google Maps:</p>
                      <a
                        href={trip.google_maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </a>
                    </div>
                  )}
                  {trip.coordinates && (trip.coordinates.lat || trip.coordinates.lng) && (
                    <div className="text-sm text-gray-600">
                      <p>Coordinates: {trip.coordinates.lat}, {trip.coordinates.lng}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Star Rating Section */}
            <div>
              <StarRatingSystem
                itemId={trip.id}
                itemType="trip"
                itemTitle={trip.title}
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
                    {formatPrice(trip.price)}
                  </div>
                  <div className="text-gray-600">per person</div>

                </div>





                {/* Book Now Button */}
                <div className="mb-6">
                  <Button
                    fullWidth
                    size="large"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleBookNow}
                  >
                    Book This Trip
                  </Button>
                </div>

                {/* Trip Details */}
                <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{trip.durationDays || trip.duration_days || 'N/A'} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Group Size</span>
                    <span className="font-medium">{trip.maxParticipants || trip.max_participants || 'N/A'} people</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Difficulty</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[trip.difficultyLevel || trip.difficulty_level] || 'bg-gray-100 text-gray-800'}`}>
                      {trip.difficultyLevel || trip.difficulty_level || 'Easy'}
                    </span>
                  </div>
                </div>

                <div className="text-center text-xs text-gray-500">
                  ✅ Free cancellation up to 24 hours before departure
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <CommentsSection
            itemId={trip.id}
            itemType="trip"
            title={`Comments for ${trip.title}`}
          />
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
