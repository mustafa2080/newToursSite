import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  UsersIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChatBubbleLeftIcon,
  CalculatorIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  ChatBubbleLeftEllipsisIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { hotelsAPI, bookingsAPI } from '../utils/firebaseApi';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';
import useToast from '../hooks/useToast';
import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AddDurationButton } from '../utils/addDurationToHotels';

const BookHotel = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();
  
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Get pre-selected data from hotel detail page
  const preSelectedData = location.state || {};

  const [bookingData, setBookingData] = useState({
    // Personal Information
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',

    // Hotel Details - use pre-selected data if available
    checkInDate: preSelectedData.checkIn || '',
    checkOutDate: preSelectedData.checkOut || '',
    numberOfGuests: preSelectedData.guests || 1,
    numberOfRooms: 1,
    roomType: preSelectedData.roomType || '',

    // Additional Information
    specialRequests: '',

    // Terms
    agreeToTerms: false,
    agreeToNewsletter: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/book/hotel/${hotelId}` } } });
      return;
    }
    loadHotel();
    loadReviews();
  }, [hotelId, isAuthenticated]);

  const loadHotel = async () => {
    try {
      setLoading(true);
      const response = await hotelsAPI.getById(hotelId);
      const hotelData = response.data.data;



      setHotel(hotelData);
    } catch (error) {
      console.error('Error loading hotel:', error);
      setError('Hotel not found');
    } finally {
      setLoading(false);
    }
  };

  // Load reviews from Firebase
  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('hotelId', '==', hotelId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const reviewsData = [];
      querySnapshot.forEach((doc) => {
        reviewsData.push({ id: doc.id, ...doc.data() });
      });

      setReviews(reviewsData);

      // Update hotel average rating
      if (reviewsData.length > 0) {
        const avgRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
        const hotelRef = doc(db, 'hotels', hotelId);
        await updateDoc(hotelRef, {
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviewsData.length
        });
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!reviewForm.comment.trim() || reviewForm.rating === 0) {
      showError('Please provide a rating and comment');
      return;
    }

    try {
      setSubmittingReview(true);

      const reviewData = {
        hotelId,
        userId: user.uid,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        userEmail: user.email,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'reviews'), reviewData);

      showSuccess('Review submitted successfully!');
      setReviewForm({ rating: 0, comment: '' });
      setHoverRating(0);

      // Reload reviews
      loadReviews();

    } catch (error) {
      console.error('Error submitting review:', error);
      showError('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Information
    if (!bookingData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!bookingData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!bookingData.email.trim()) newErrors.email = 'Email is required';
    if (!bookingData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Hotel Details
    if (!bookingData.checkInDate) newErrors.checkInDate = 'Check-in date is required';
    if (!bookingData.checkOutDate) newErrors.checkOutDate = 'Check-out date is required';
    if (!bookingData.roomType) newErrors.roomType = 'Please select a room type';
    
    // Date validation
    if (bookingData.checkInDate && bookingData.checkOutDate) {
      const checkIn = new Date(bookingData.checkInDate);
      const checkOut = new Date(bookingData.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkIn < today) {
        newErrors.checkInDate = 'Check-in date cannot be in the past';
      }
      
      if (checkOut <= checkIn) {
        newErrors.checkOutDate = 'Check-out date must be after check-in date';
      }
    }
    
    // Terms
    if (!bookingData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (bookingData.email && !emailRegex.test(bookingData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateNights = () => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return 0;
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!hotel) return 0;
    const nights = calculateNights();
    const roomPrice = getRoomTypePrice(bookingData.roomType);
    return roomPrice * nights * bookingData.numberOfRooms;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const bookingPayload = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelPrice: getHotelPrice(),
        userId: user.uid,
        ...bookingData,
        numberOfNights: calculateNights(),
        totalPrice: calculateTotal(),
        bookingDate: new Date().toISOString(),
        status: 'pending',
        paymentStatus: 'pending',
        type: 'hotel',
      };

      const response = await bookingsAPI.create(bookingPayload);
      
      if (response.success) {
        setSuccess(true);
        showSuccess(`🏨 Hotel booking confirmed! Redirecting to hotel details...`, 5000);
        // Redirect to hotel page after 3 seconds
        setTimeout(() => {
          // Use the hotelId from URL params to ensure correct navigation
          navigate(`/hotels/${hotelId}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Helper function to get hotel price with fallbacks
  const getHotelPrice = () => {
    if (!hotel) return 0;

    // Try different possible price field names
    const priceFields = [
      'price_per_night',
      'pricePerNight',
      'price',
      'basePrice',
      'base_price',
      'nightly_rate',
      'nightlyRate',
      'rate',
      'cost'
    ];

    for (const field of priceFields) {
      const price = hotel[field];
      if (price && (typeof price === 'number' || !isNaN(parseFloat(price)))) {
        return parseFloat(price);
      }
    }

    // If no price found, return a default price based on hotel name or star rating
    if (hotel.star_rating) {
      return hotel.star_rating * 50; // $50 per star as base price
    }

    // Final fallback
    return 150; // Default $150 per night
  };

  // Helper function to get room type price with fallbacks
  const getRoomTypePrice = (roomType) => {
    if (!hotel?.room_types?.[roomType]) return getHotelPrice();

    const room = hotel.room_types[roomType];
    const priceFields = [
      'price',
      'rate',
      'cost',
      'price_per_night',
      'pricePerNight',
      'nightly_rate',
      'nightlyRate'
    ];

    for (const field of priceFields) {
      const price = room[field];
      if (price && (typeof price === 'number' || !isNaN(parseFloat(price)))) {
        return parseFloat(price);
      }
    }

    // Generate price based on room type name if no price found
    const basePrice = getHotelPrice();
    const roomTypeName = (room.name || roomType).toLowerCase();

    if (roomTypeName.includes('suite') || roomTypeName.includes('presidential')) {
      return basePrice * 2.5; // Suites cost 2.5x more
    } else if (roomTypeName.includes('deluxe') || roomTypeName.includes('premium')) {
      return basePrice * 1.5; // Deluxe rooms cost 1.5x more
    } else if (roomTypeName.includes('standard') || roomTypeName.includes('basic')) {
      return basePrice * 0.8; // Standard rooms cost 20% less
    } else if (roomTypeName.includes('family') || roomTypeName.includes('quad')) {
      return basePrice * 1.3; // Family rooms cost 30% more
    } else if (roomTypeName.includes('single')) {
      return basePrice * 0.7; // Single rooms cost 30% less
    }

    return basePrice; // Default to base price
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
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Hotel not found'}</p>
          <Button onClick={() => navigate('/hotels')}>
            Browse All Hotels
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Successful!</h2>
          <p className="text-gray-600 mb-6">
            🏨 Your hotel booking has been confirmed! We'll contact you soon with detailed confirmation and check-in instructions. You can view this booking in your profile anytime.
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate(`/hotels/${hotelId}`)}>
              Back to Hotel Details
            </Button>
            <Button variant="outline" onClick={() => navigate('/profile/bookings')}>
              View My Bookings
            </Button>
            <Button variant="ghost" onClick={() => navigate('/hotels')}>
              Browse More Hotels
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Redirecting to hotel details in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Hotel Booking</h1>
          <p className="text-gray-600 mb-4">You're almost there! Just fill in the details below</p>

          {/* Pre-selected Summary */}
          {(preSelectedData.checkIn || preSelectedData.checkOut || preSelectedData.guests || preSelectedData.roomType) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
            >
              <div className="flex items-center mb-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-semibold text-green-900">Your Selection</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {preSelectedData.checkIn && (
                  <div className="flex items-center text-green-800">
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    <span>
                      <strong>Check-in:</strong> {new Date(preSelectedData.checkIn).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {preSelectedData.checkOut && (
                  <div className="flex items-center text-green-800">
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    <span>
                      <strong>Check-out:</strong> {new Date(preSelectedData.checkOut).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {preSelectedData.guests && (
                  <div className="flex items-center text-green-800">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    <span>
                      <strong>Guests:</strong> {preSelectedData.guests} {preSelectedData.guests === 1 ? 'guest' : 'guests'}
                    </span>
                  </div>
                )}
                {preSelectedData.roomType && (
                  <div className="flex items-center text-green-800">
                    <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                    <span>
                      <strong>Room:</strong> {preSelectedData.roomType}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Hotel Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">{hotel?.name}</h3>
                <div className="flex items-center text-sm text-blue-700 mt-1">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {hotel?.address || hotel?.location}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-700">Starting from</div>
                <div className="text-xl font-bold text-blue-900">{formatPrice(getHotelPrice())}</div>
                <div className="text-xs text-blue-600">per night</div>
              </div>
            </div>
          </div>
        </div>



        {/* Hotel Details Section */}
        <div className="mb-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BuildingOfficeIcon className="h-6 w-6 mr-2 text-blue-600" />
              Hotel Details & Information
            </h2>

            <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 gap-6">
              {/* Hotel Images */}
              <div className="xl:col-span-2 lg:col-span-2">
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative">
                    <img
                      src={hotel.main_image || 'https://picsum.photos/800/400?random=hotel'}
                      alt={hotel.name}
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        e.target.src = 'https://picsum.photos/800/400?random=hotel';
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      Main View
                    </div>
                  </div>

                  {/* Gallery */}
                  {hotel.gallery && hotel.gallery.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {hotel.gallery.slice(0, 6).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${hotel.name} - ${index + 1}`}
                          className="w-full h-20 object-cover rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onError={(e) => {
                            e.target.src = `https://picsum.photos/200/150?random=${index}`;
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Hotel Information */}
              <div className="xl:col-span-2 lg:col-span-1 space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{hotel.name}</h3>

                  {/* Rating Display */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center mr-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`h-4 w-4 ${
                            reviews.length > 0 && star <= Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
                              ? 'text-yellow-400' // ذهبي للفنادق المقيمة
                              : 'text-gray-400'   // فضي للفنادق غير المقيمة
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {reviews.length > 0 ? (
                        <>
                          {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}/5.0
                          ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                        </>
                      ) : (
                        <span className="text-gray-500">No reviews yet</span>
                      )}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{hotel.address || hotel.location}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex">
                        {Array.from({ length: hotel.star_rating || 5 }, (_, i) => (
                          <span key={i} className="text-yellow-400 text-lg">★</span>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {hotel.star_rating || 5} Star Hotel
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(getHotelPrice())}
                      <span className="text-sm text-gray-500 font-normal"> / night</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {hotel.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">About This Hotel</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {hotel.description.length > 200
                        ? hotel.description.substring(0, 200) + '...'
                        : hotel.description}
                    </p>
                  </div>
                )}

                {/* Amenities */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Hotel Amenities</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {hotel.amenities.slice(0, 8).map((amenity, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                      {hotel.amenities.length > 8 && (
                        <div className="text-sm text-blue-600 font-medium">
                          +{hotel.amenities.length - 8} more amenities
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pricing Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Pricing & Room Rates</h4>

                  {/* Base Price */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-blue-700 font-medium">Starting Price</div>
                        <div className="text-xs text-blue-600">Base rate per night</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-900">
                          {formatPrice(getHotelPrice())}
                        </div>
                        <div className="text-xs text-blue-700">per night</div>
                      </div>
                    </div>
                  </div>

                  {/* Room Type Prices */}
                  {hotel.room_types && Object.keys(hotel.room_types).length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700 border-b pb-1">
                        Room Type Pricing
                      </div>
                      {Object.entries(hotel.room_types).map(([type, details]) => (
                        <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              {details.name || type}
                            </div>
                            <div className="text-xs text-gray-600">
                              {details.capacity ? `Up to ${details.capacity} guests` : 'Standard capacity'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              {formatPrice(getRoomTypePrice(type))}
                            </div>
                            <div className="text-xs text-gray-500">per night</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Additional Fees */}
                  {(hotel.additional_fees || hotel.taxes || hotel.service_charge) && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-sm font-medium text-yellow-800 mb-2">Additional Charges</div>
                      <div className="space-y-1 text-xs text-yellow-700">
                        {hotel.taxes && (
                          <div className="flex justify-between">
                            <span>Taxes & Fees:</span>
                            <span>{hotel.taxes}</span>
                          </div>
                        )}
                        {hotel.service_charge && (
                          <div className="flex justify-between">
                            <span>Service Charge:</span>
                            <span>{hotel.service_charge}</span>
                          </div>
                        )}
                        {hotel.additional_fees && (
                          <div className="flex justify-between">
                            <span>Additional Fees:</span>
                            <span>{hotel.additional_fees}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Special Offers */}
                  {(hotel.discount || hotel.special_offer) && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm font-medium text-green-800 mb-2">🎉 Special Offers</div>
                      <div className="space-y-1 text-xs text-green-700">
                        {hotel.discount && (
                          <div className="flex justify-between">
                            <span>Current Discount:</span>
                            <span className="font-bold">{hotel.discount}% OFF</span>
                          </div>
                        )}
                        {hotel.special_offer && (
                          <div className="text-xs">{hotel.special_offer}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {hotel.viewCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {hotel.bookingCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {hotel.duration || hotel.recommendedStay || '2-3'}
                    </div>
                    <div className="text-xs text-gray-500">Days</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="xl:col-span-3 lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={bookingData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={bookingData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={bookingData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={bookingData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </Card>

              {/* Step 1: Stay Details */}
              <Card className="p-6 border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Stay Details & Dates
                  </h2>
                </div>

                {/* Check-in/Check-out Dates */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Select Your Stay Dates *
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        name="checkInDate"
                        value={bookingData.checkInDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border-2 rounded-lg text-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.checkInDate ? 'border-red-500' :
                          bookingData.checkInDate
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      />
                      {errors.checkInDate && <p className="text-red-500 text-sm mt-1">{errors.checkInDate}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        name="checkOutDate"
                        value={bookingData.checkOutDate}
                        onChange={handleInputChange}
                        min={bookingData.checkInDate || new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border-2 rounded-lg text-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.checkOutDate ? 'border-red-500' :
                          bookingData.checkOutDate
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      />
                      {errors.checkOutDate && <p className="text-red-500 text-sm mt-1">{errors.checkOutDate}</p>}
                    </div>

                    {/* Stay Duration Info - Only show on XL screens */}
                    <div className="hidden xl:block">
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Stay Duration
                      </label>
                      <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                        {bookingData.checkInDate && bookingData.checkOutDate && calculateNights() > 0 ? (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{calculateNights()}</div>
                            <div className="text-sm text-gray-600">
                              {calculateNights() === 1 ? 'Night' : 'Nights'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-400">
                            <div className="text-2xl font-bold">-</div>
                            <div className="text-sm">Select dates</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stay Summary */}
                  {bookingData.checkInDate && bookingData.checkOutDate && calculateNights() > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                          <div>
                            <div className="font-semibold text-green-900">
                              {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'} selected
                            </div>
                            <div className="text-sm text-green-700">
                              {preSelectedData.checkIn === bookingData.checkInDate && preSelectedData.checkOut === bookingData.checkOutDate ?
                                '✨ These were your pre-selected dates' :
                                '✅ Great choice! These dates are available'
                              }
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {formatPrice(calculateTotal())}
                          </div>
                          <div className="text-xs text-green-600">Total Cost</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Guests Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
                    How many guests? *
                  </label>

                  <div className="grid grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-3">
                    {Array.from({ length: 8 }, (_, i) => i + 1).map(num => {
                      const isSelected = bookingData.numberOfGuests === num;
                      const isPreSelected = preSelectedData.guests === num;

                      return (
                        <motion.button
                          key={num}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleInputChange({ target: { name: 'numberOfGuests', value: num } })}
                          className={`p-4 border-2 rounded-lg text-center transition-all relative ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="text-2xl font-bold mb-1">{num}</div>
                          <div className="text-xs">
                            {num === 1 ? 'Guest' : 'Guests'}
                          </div>
                          {isPreSelected && (
                            <div className="absolute -top-2 -right-2">
                              <span className="bg-green-500 text-white text-xs px-1 py-0.5 rounded-full">
                                ✓
                              </span>
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Rooms Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Number of rooms *
                  </label>

                  <div className="grid grid-cols-5 md:grid-cols-7 xl:grid-cols-10 gap-3">
                    {Array.from({ length: 5 }, (_, i) => i + 1).map(num => {
                      const isSelected = bookingData.numberOfRooms === num;

                      return (
                        <motion.button
                          key={num}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleInputChange({ target: { name: 'numberOfRooms', value: num } })}
                          className={`p-4 border-2 rounded-lg text-center transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="text-xl font-bold mb-1">{num}</div>
                          <div className="text-xs">
                            {num === 1 ? 'Room' : 'Rooms'}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Room Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Choose your room type *
                  </label>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {hotel?.room_types ? (
                      Object.entries(hotel.room_types).map(([type, details]) => {
                        const isSelected = bookingData.roomType === type;
                        const isPreSelected = preSelectedData.roomType === type;

                        return (
                          <motion.div
                            key={type}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleInputChange({ target: { name: 'roomType', value: type } })}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h4 className="font-semibold text-gray-900">{details.name || type}</h4>
                                  {isPreSelected && (
                                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      Pre-selected
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm mt-1">{details.description}</p>
                                {details.features && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {details.features.slice(0, 3).map((feature, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                      >
                                        {feature}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-xl font-bold text-gray-900">
                                  {formatPrice(getRoomTypePrice(type))}
                                </div>
                                <div className="text-gray-600 text-sm">per night</div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleInputChange({ target: { name: 'roomType', value: 'standard' } })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          bookingData.roomType === 'standard'
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-gray-900">Standard Room</h4>
                            <p className="text-gray-600 text-sm">Comfortable room with all basic amenities</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              {formatPrice(getHotelPrice())}
                            </div>
                            <div className="text-gray-600 text-sm">per night</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  {errors.roomType && <p className="text-red-500 text-sm mt-2">{errors.roomType}</p>}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special requests, room preferences, or accessibility needs..."
                  />
                </div>
              </Card>

              {/* Terms and Conditions */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Terms & Conditions</h2>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={bookingData.agreeToTerms}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm text-gray-700">
                      I agree to the{' '}
                      <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                        Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </a>
                      *
                    </label>
                  </div>
                  {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>}

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeToNewsletter"
                      checked={bookingData.agreeToNewsletter}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm text-gray-700">
                      I would like to receive hotel deals and special offers via email
                    </label>
                  </div>
                </div>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="large"
                  loading={submitting}
                  disabled={submitting}
                  className="px-8"
                >
                  {submitting ? 'Processing...' : 'Submit Booking Request'}
                </Button>
              </div>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="xl:col-span-1 lg:col-span-1 order-1 lg:order-2">
            <div className="sticky top-4 lg:top-8">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CalculatorIcon className="h-5 w-5 mr-2" />
                  Booking Summary
                </h2>

                {/* Hotel Info */}
                <div className="mb-6">
                  <img
                    src={hotel.main_image || 'https://picsum.photos/400/200?random=hotel'}
                    alt={hotel.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {hotel.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <div className="flex">
                      {Array.from({ length: hotel.star_rating || 5 }, (_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                    <span className="ml-2">{hotel.star_rating || 5} Star Hotel</span>
                  </div>
                </div>

                {/* Room Types Info */}
                {hotel.room_types && Object.keys(hotel.room_types).length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">Available Room Types</h4>
                    <div className="space-y-3">
                      {Object.entries(hotel.room_types).map(([type, details]) => (
                        <div key={type} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900 text-sm">
                              {details.name || type}
                            </h5>
                            <div className="text-right">
                              <span className="text-sm font-bold text-blue-600">
                                {formatPrice(getRoomTypePrice(type))}
                              </span>
                              <div className="text-xs text-gray-500">per night</div>
                              {/* Show if this is the cheapest option */}
                              {hotel.room_types && Object.keys(hotel.room_types).length > 1 && (
                                (() => {
                                  const prices = Object.keys(hotel.room_types).map(roomType => getRoomTypePrice(roomType));
                                  const minPrice = Math.min(...prices);
                                  const currentPrice = getRoomTypePrice(type);
                                  return minPrice === currentPrice && minPrice > 0 && (
                                    <div className="text-xs text-green-600 font-medium">Best Value!</div>
                                  );
                                })()
                              )}
                            </div>
                          </div>
                          {details.description && (
                            <p className="text-xs text-gray-600 mb-2">
                              {details.description.length > 60
                                ? details.description.substring(0, 60) + '...'
                                : details.description}
                            </p>
                          )}
                          {details.features && details.features.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {details.features.slice(0, 3).map((feature, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {feature}
                                </span>
                              ))}
                              {details.features.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{details.features.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Offers & Discounts */}
                {(hotel.discount || hotel.special_offer || hotel.early_bird_discount) && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">🎉 Special Offers</h4>
                    <div className="space-y-3">
                      {hotel.discount && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-red-900 text-sm">Current Discount</div>
                              <div className="text-xs text-red-700">Limited time offer</div>
                            </div>
                            <div className="text-xl font-bold text-red-600">
                              {hotel.discount}% OFF
                            </div>
                          </div>
                        </div>
                      )}

                      {hotel.early_bird_discount && (
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-blue-900 text-sm">Early Bird Special</div>
                              <div className="text-xs text-blue-700">Book 30 days in advance</div>
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              {hotel.early_bird_discount}% OFF
                            </div>
                          </div>
                        </div>
                      )}

                      {hotel.special_offer && (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                          <div className="text-sm font-medium text-green-900 mb-1">Special Offer</div>
                          <div className="text-xs text-green-800">{hotel.special_offer}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stay Details */}
                {(bookingData.checkInDate || bookingData.checkOutDate) && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Stay Details</h4>
                    <div className="space-y-2 text-sm">
                      {bookingData.checkInDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-in</span>
                          <span className="font-medium">
                            {new Date(bookingData.checkInDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {bookingData.checkOutDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-out</span>
                          <span className="font-medium">
                            {new Date(bookingData.checkOutDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {calculateNights() > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nights</span>
                          <span className="font-medium">{calculateNights()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pricing Breakdown */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Booking Details</h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                        Room type
                      </span>
                      <span className="font-medium">
                        {bookingData.roomType ?
                          hotel?.room_types?.[bookingData.roomType]?.name || bookingData.roomType
                          : 'Not selected'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center">
                        <UsersIcon className="h-4 w-4 mr-1" />
                        Guests & Rooms
                      </span>
                      <div className="text-right">
                        <span className="font-medium">{bookingData.numberOfGuests} guests</span>
                        <div className="text-xs text-gray-500">
                          {bookingData.numberOfRooms} {bookingData.numberOfRooms === 1 ? 'room' : 'rooms'}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        Duration
                      </span>
                      <div className="text-right">
                        <span className="font-medium text-lg text-blue-600">{calculateNights()}</span>
                        <div className="text-xs text-gray-500">
                          {calculateNights() === 1 ? 'night' : 'nights'}
                        </div>
                      </div>
                    </div>

                    {/* Price Comparison */}
                    {bookingData.roomType && hotel.room_types && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Selected Room Rate</h5>
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-green-900">
                                {hotel.room_types[bookingData.roomType]?.name || bookingData.roomType}
                              </div>
                              <div className="text-xs text-green-700">
                                {hotel.room_types[bookingData.roomType]?.description &&
                                 hotel.room_types[bookingData.roomType].description.substring(0, 40) + '...'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-900">
                                {formatPrice(getRoomTypePrice(bookingData.roomType))}
                              </div>
                              <div className="text-xs text-green-700">per night</div>
                            </div>
                          </div>

                          {/* Show savings if applicable */}
                          {(() => {
                            const roomPrice = getRoomTypePrice(bookingData.roomType);
                            const basePrice = getHotelPrice();
                            return roomPrice > 0 && basePrice > 0 && roomPrice < basePrice && (
                              <div className="mt-2 text-xs text-green-800 bg-green-100 px-2 py-1 rounded">
                                💰 Save {formatPrice(basePrice - roomPrice)} per night!
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Price calculation */}
                    {calculateNights() > 0 && bookingData.roomType && (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <div className="text-sm text-blue-700 mb-2 font-medium">Price Calculation:</div>
                        <div className="text-sm text-blue-800 font-mono">
                          {formatPrice(getRoomTypePrice(bookingData.roomType))} × {calculateNights()} nights × {bookingData.numberOfRooms} rooms
                        </div>
                        <div className="text-sm text-blue-800 font-mono font-bold mt-1">
                          = {formatPrice(calculateTotal())}
                        </div>
                      </div>
                    )}

                    {calculateNights() > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                          <div className="text-right">
                            <motion.span
                              key={calculateTotal()}
                              initial={{ scale: 1.1 }}
                              animate={{ scale: 1 }}
                              className="text-2xl font-bold text-green-600"
                            >
                              {formatPrice(calculateTotal())}
                            </motion.span>
                            <div className="text-xs text-gray-500">
                              for {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hotel Policies */}
                {hotel.policies && Object.keys(hotel.policies).length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">Hotel Policies</h4>
                    <div className="space-y-3 text-sm">
                      {hotel.policies.checkIn && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-in Time:</span>
                          <span className="font-medium">{hotel.policies.checkIn}</span>
                        </div>
                      )}
                      {hotel.policies.checkOut && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-out Time:</span>
                          <span className="font-medium">{hotel.policies.checkOut}</span>
                        </div>
                      )}
                      {hotel.policies.cancellation && (
                        <div>
                          <span className="text-gray-600 block mb-1">Cancellation Policy:</span>
                          <span className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                            {hotel.policies.cancellation}
                          </span>
                        </div>
                      )}
                      {hotel.policies.pets && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pets Policy:</span>
                          <span className="font-medium">{hotel.policies.pets}</span>
                        </div>
                      )}
                      {hotel.policies.smoking && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Smoking Policy:</span>
                          <span className="font-medium">{hotel.policies.smoking}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reviews Summary */}
                {reviews.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">Guest Reviews</h4>
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="text-lg font-bold text-yellow-600 mr-2">
                            {reviews.length > 0
                              ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                              : '0.0'
                            }
                            <span className="text-sm text-gray-500">/5.0</span>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className={`h-4 w-4 ${
                                  reviews.length > 0 && star <= Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
                                    ? 'text-yellow-400' // ذهبي للفنادق المقيمة
                                    : 'text-gray-400'   // فضي للفنادق غير المقيمة
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-yellow-700">
                        Based on {reviews.length} guest {reviews.length === 1 ? 'review' : 'reviews'}
                      </div>
                      {reviews.length > 0 && (
                        <div className="mt-2 text-xs text-yellow-800">
                          Latest: "{reviews[0].title}"
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 border-b pb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    {hotel.phone && (
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">{hotel.phone}</span>
                      </div>
                    )}
                    {hotel.email && (
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">{hotel.email}</span>
                      </div>
                    )}
                    {hotel.website && (
                      <div className="flex items-center">
                        <GlobeAltIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <a
                          href={hotel.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• This is a booking request, not a confirmed reservation</li>
                    <li>• We'll contact you within 24 hours for confirmation</li>
                    <li>• Payment will be processed after confirmation</li>
                    <li>• Free cancellation up to 24 hours before check-in</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Reviews & Ratings Section */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <ChatBubbleLeftEllipsisIcon className="h-6 w-6 mr-2 text-blue-600" />
                Reviews & Ratings
                {reviews.length > 0 && (
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                  </span>
                )}
              </h2>
            </div>

            {/* Average Rating Display */}
            {reviews.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-3xl font-bold text-yellow-600 mr-3">
                      {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
                      <span className="text-lg text-gray-500">/5.0</span>
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
                                ? 'text-yellow-400' // ذهبي للفنادق المقيمة
                                : 'text-gray-400'   // فضي للفنادق غير المقيمة
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                      </div>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Rating Distribution</div>
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviews.filter(r => r.rating === rating).length;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={rating} className="flex items-center text-xs mb-1">
                          <span className="w-3">{rating}</span>
                          <StarIcon className="h-3 w-3 text-yellow-400 mx-1" />
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-500">({count})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Add Review Form */}
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <StarIcon
                            className={`h-8 w-8 ${
                              star <= (hoverRating || reviewForm.rating)
                                ? 'text-yellow-400 drop-shadow-sm' // ذهبي للنجوم المحددة أو المُشار إليها
                                : 'text-gray-400' // فضي للنجوم غير المحددة
                            } transition-colors duration-200`}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      Selected: <span className="font-medium text-yellow-600">{reviewForm.rating}/5.0</span> stars
                    </div>
                  </div>

                  {/* Review Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience with this hotel..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      disabled={submittingReview}
                      className="flex items-center"
                    >
                      {submittingReview ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviewsLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                  <p className="text-gray-600 mt-2">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <ChatBubbleLeftEllipsisIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No reviews yet. Be the first to review this hotel!</p>
                </div>
              ) : (
                reviews.slice(0, 3).map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="font-semibold text-gray-900 mr-2">
                            {review.userName}
                          </div>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? 'text-yellow-400' // ذهبي للنجوم المقيمة
                                    : 'text-gray-400'   // فضي للنجوم غير المقيمة
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-600 font-medium">
                              {review.rating}/5.0
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt.toDate()).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </motion.div>
                ))
              )}

              {/* Show more reviews link */}
              {reviews.length > 3 && (
                <div className="text-center pt-4 border-t">
                  <Link
                    to={`/hotel/${hotelId}/reviews`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all {reviews.length} reviews
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Toast Notifications */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            isVisible={toast.isVisible}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
            position="top-right"
          />
        ))}
      </div>
    </div>
  );
};

export default BookHotel;
