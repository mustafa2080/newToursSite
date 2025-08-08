import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  UsersIcon,
  MapPinIcon,
  ClockIcon,
  CreditCardIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  GlobeAltIcon,
  CalculatorIcon,
  ArrowPathIcon,
  ChatBubbleLeftIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { tripsAPI, bookingsAPI } from '../utils/firebaseApi';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';
import useToast from '../hooks/useToast';

const BookTrip = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Get pre-selected data from trip detail page
  const preSelectedData = location.state || {};

  const [bookingData, setBookingData] = useState({
    // Trip Details - use pre-selected data if available
    selectedDate: preSelectedData.date || '',
    numberOfParticipants: preSelectedData.participants || 1,

    // Additional Information
    specialRequests: '',
    emergencyContactName: '',
    emergencyContactPhone: '',

    // Terms
    agreeToTerms: false,
    agreeToNewsletter: false,
  });

  // Separate state for participants data
  const [participants, setParticipants] = useState([
    {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: '',
      dateOfBirth: '',
      nationality: '',
      isMainBooker: true
    }
  ]);

  // UI state for collapsible forms
  const [expandedParticipants, setExpandedParticipants] = useState([0]); // First participant expanded by default
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/book/trip/${tripId}` } } });
      return;
    }
    loadTrip();
  }, [tripId, isAuthenticated]);

  // Initialize participants when component mounts
  useEffect(() => {
    if (user) {
      // Create participants array based on pre-selected count
      const participantCount = preSelectedData.participants || 1;
      const newParticipants = [];

      for (let i = 0; i < participantCount; i++) {
        newParticipants.push({
          firstName: i === 0 ? (user?.firstName || '') : '',
          lastName: i === 0 ? (user?.lastName || '') : '',
          email: i === 0 ? (user?.email || '') : '',
          phone: '',
          dateOfBirth: '',
          nationality: '',
          isMainBooker: i === 0
        });
      }

      setParticipants(newParticipants);

      // Expand all participant forms initially
      setExpandedParticipants(Array.from({ length: participantCount }, (_, i) => i));
    }
  }, [user, preSelectedData.participants]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const response = await tripsAPI.getById(tripId);
      const tripData = response.data.data;

      console.log('🗺️ Trip loaded from Firebase:', tripData);
      console.log('🗓️ Trip duration fields:', {
        duration_days: tripData.duration_days,
        durationDays: tripData.durationDays,
        duration: tripData.duration,
        all_fields: Object.keys(tripData)
      });

      setTrip(tripData);
    } catch (error) {
      console.error('Error loading trip:', error);
      setError('Trip not found');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle number of participants change
    if (name === 'numberOfParticipants') {
      const newCount = parseInt(value);
      setBookingData(prev => ({ ...prev, [name]: newCount }));

      // Update participants array
      setParticipants(prev => {
        const newParticipants = [...prev];

        // Add new participants if count increased
        while (newParticipants.length < newCount) {
          newParticipants.push({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            nationality: '',
            isMainBooker: false
          });
        }

        // Update expanded participants to include new ones
        setExpandedParticipants(prev => {
          const newExpanded = [...prev];
          for (let i = prev.length; i < newCount; i++) {
            newExpanded.push(i);
          }
          return newExpanded.filter(index => index < newCount);
        });

        // Remove participants if count decreased (but keep main booker)
        if (newParticipants.length > newCount) {
          newParticipants.splice(newCount);
        }

        return newParticipants;
      });
    } else {
      setBookingData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleParticipantChange = (index, field, value) => {
    setParticipants(prev => {
      const newParticipants = [...prev];
      newParticipants[index] = {
        ...newParticipants[index],
        [field]: value
      };
      return newParticipants;
    });

    // Clear participant-specific errors
    const errorKey = `participant_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const toggleParticipantExpansion = (index) => {
    setExpandedParticipants(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const setMainBooker = (index) => {
    setParticipants(prev => {
      return prev.map((participant, i) => ({
        ...participant,
        isMainBooker: i === index
      }));
    });
  };

  const getParticipantCompletionStatus = (participant) => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'nationality'];
    const completedFields = requiredFields.filter(field => participant[field]?.trim());
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: (completedFields.length / requiredFields.length) * 100,
      isComplete: completedFields.length === requiredFields.length
    };
  };

  const validateForm = () => {
    const newErrors = {};

    // Trip Details - Date validation
    if (!bookingData.selectedDate) {
      newErrors.selectedDate = 'Please select a departure date';
    } else {
      const selectedDate = new Date(bookingData.selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

      if (selectedDate < today) {
        newErrors.selectedDate = 'Departure date cannot be in the past';
      }
    }

    // Participants validation
    if (bookingData.numberOfParticipants < 1) newErrors.numberOfParticipants = 'At least 1 participant required';
    if (bookingData.numberOfParticipants > trip?.max_participants) {
      newErrors.numberOfParticipants = `Maximum ${trip.max_participants} participants allowed`;
    }

    // Validate all participants
    participants.forEach((participant, index) => {
      const prefix = `participant_${index}`;

      // Required field validation
      if (!participant.firstName.trim()) {
        newErrors[`${prefix}_firstName`] = 'First name is required';
      } else if (participant.firstName.trim().length < 2) {
        newErrors[`${prefix}_firstName`] = 'First name must be at least 2 characters';
      }

      if (!participant.lastName.trim()) {
        newErrors[`${prefix}_lastName`] = 'Last name is required';
      } else if (participant.lastName.trim().length < 2) {
        newErrors[`${prefix}_lastName`] = 'Last name must be at least 2 characters';
      }

      if (!participant.email.trim()) {
        newErrors[`${prefix}_email`] = 'Email is required';
      }

      if (!participant.phone.trim()) {
        newErrors[`${prefix}_phone`] = 'Phone number is required';
      }

      if (!participant.dateOfBirth) {
        newErrors[`${prefix}_dateOfBirth`] = 'Date of birth is required';
      } else {
        // Age validation (must be at least 1 year old)
        const birthDate = new Date(participant.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 1 || (age === 1 && today < new Date(birthDate.setFullYear(birthDate.getFullYear() + 1)))) {
          newErrors[`${prefix}_dateOfBirth`] = 'Participant must be at least 1 year old';
        }
      }

      if (!participant.nationality.trim()) {
        newErrors[`${prefix}_nationality`] = 'Nationality is required';
      }

      // Email validation (enhanced)
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (participant.email && !emailRegex.test(participant.email)) {
        newErrors[`${prefix}_email`] = 'Please enter a valid email address';
      }

      // Phone validation (enhanced - international format)
      const phoneRegex = /^[\+]?[1-9]\d{1,14}$/;
      const cleanPhone = participant.phone.replace(/[\s\-\(\)]/g, '');
      if (participant.phone && !phoneRegex.test(cleanPhone)) {
        newErrors[`${prefix}_phone`] = 'Please enter a valid phone number (e.g., +1234567890)';
      }
    });

    // Ensure at least one main booker is selected
    const hasMainBooker = participants.some(p => p.isMainBooker);
    if (!hasMainBooker && participants.length > 0) {
      newErrors.mainBooker = 'Please select a main booker';
    }

    // Emergency Contact
    if (!bookingData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!bookingData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Emergency contact phone is required';

    // Terms
    if (!bookingData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Show error toast
      showError('Please fill in all required fields correctly');

      // Scroll to first error
      const firstErrorElement = document.querySelector('.border-red-500');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Show confirmation modal instead of submitting directly
    setShowConfirmationModal(true);
    showSuccess('Form validated successfully! Please review your booking details.');
  };

  const confirmBooking = async () => {
    try {
      setSubmitting(true);
      setShowConfirmationModal(false);

      const mainBooker = participants.find(p => p.isMainBooker) || participants[0];

      const bookingPayload = {
        tripId: trip.id,
        tripTitle: trip.title,
        tripPrice: trip.price,
        userId: user.uid,
        ...bookingData,
        participants: participants,
        mainBooker: mainBooker,
        totalPrice: trip.price * bookingData.numberOfParticipants,
        bookingDate: new Date().toISOString(),
        status: 'pending',
        paymentStatus: 'pending',
        bookingReference: `TRP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      };

      console.log('Submitting booking:', bookingPayload);

      const response = await bookingsAPI.create(bookingPayload);

      if (response.success) {
        setBookingConfirmation({
          reference: bookingPayload.bookingReference,
          totalAmount: bookingPayload.totalPrice,
          participants: participants.length,
          mainBooker: mainBooker
        });
        setSuccess(true);
        showSuccess(`🎉 Booking confirmed! Reference: ${bookingPayload.bookingReference}`, 6000);

        // Redirect to trip page after 5 seconds
        setTimeout(() => {
          // Use the tripId from URL params to ensure correct navigation
          navigate(`/trips/${tripId}`);
        }, 5000);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create booking. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
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

  // Calculate end date based on start date and trip duration
  const calculateEndDate = (startDate, durationDays) => {
    if (!startDate) return null;

    // Get duration from multiple possible fields
    const duration = durationDays || trip?.duration_days || trip?.durationDays || trip?.duration || 1;

    console.log('🗓️ Calculating end date:', {
      startDate,
      duration,
      tripData: {
        duration_days: trip?.duration_days,
        durationDays: trip?.durationDays,
        duration: trip?.duration
      }
    });

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + parseInt(duration) - 1); // -1 because if trip is 3 days, it ends on day 3, not day 4

    return end;
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return '';

    const start = new Date(startDate);
    const end = new Date(endDate);

    const startFormatted = start.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    const endFormatted = end.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return `${startFormatted} - ${endFormatted}`;
  };

  const calculateTotal = () => {
    return trip ? trip.price * bookingData.numberOfParticipants : 0;
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
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Trip not found'}</p>
          <Button onClick={() => navigate('/trips')}>
            Browse All Trips
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full mx-4"
        >
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>

            {bookingConfirmation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-green-900 mb-3">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Reference:</span>
                    <span className="font-mono font-semibold text-green-900">
                      {bookingConfirmation.reference}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Participants:</span>
                    <span className="font-semibold text-green-900">
                      {bookingConfirmation.participants} {bookingConfirmation.participants === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Total Amount:</span>
                    <span className="font-semibold text-green-900">
                      {formatPrice(bookingConfirmation.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Main Contact:</span>
                    <span className="font-semibold text-green-900">
                      {bookingConfirmation.mainBooker?.firstName} {bookingConfirmation.mainBooker?.lastName}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-600 mb-6">
              🎉 Your trip booking has been confirmed! We'll contact you within 24 hours with detailed confirmation and payment instructions. You can view this booking in your profile anytime.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => navigate(`/trips/${tripId}`)}
                className="w-full"
              >
                Back to Trip Details
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/profile/bookings')}
                className="w-full"
              >
                View My Bookings
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/trips')}
                className="w-full"
              >
                Browse More Trips
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Redirecting to trip details in 5 seconds...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600 mb-4">You're almost there! Just fill in the details below</p>

          {/* Pre-selected Summary */}
          {(preSelectedData.date || preSelectedData.participants) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
            >
              <div className="flex items-center mb-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-semibold text-green-900">Your Selection</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {preSelectedData.date && (
                  <div className="flex items-center text-green-800">
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    <span>
                      <strong>Date:</strong> {new Date(preSelectedData.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {preSelectedData.participants && (
                  <div className="flex items-center text-green-800">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    <span>
                      <strong>Travelers:</strong> {preSelectedData.participants} {preSelectedData.participants === 1 ? 'person' : 'people'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Trip Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">{trip.title}</h3>
                <div className="flex items-center text-sm text-blue-700 mt-1">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {trip.location}
                  <ClockIcon className="h-4 w-4 ml-3 mr-1" />
                  {trip.duration_days} {trip.duration_days === 1 ? 'day' : 'days'}
                </div>

                {/* Trip Dates Display */}
                {bookingData.selectedDate && (
                  <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                    <div className="text-xs text-blue-600 font-medium mb-2">TRIP DATES</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Departure:</span>
                        <span className="font-medium text-blue-900">
                          {new Date(bookingData.selectedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Return:</span>
                        <span className="font-medium text-blue-900">
                          {calculateEndDate(bookingData.selectedDate)?.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          }) || 'Calculating...'}
                        </span>
                      </div>
                      <div className="text-center pt-1 border-t border-blue-100">
                        <span className="text-xs text-blue-700 font-medium">
                          {trip?.duration_days || trip?.durationDays || trip?.duration || 1} {(trip?.duration_days || trip?.durationDays || trip?.duration || 1) === 1 ? 'day' : 'days'} total
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-700">Starting from</div>
                <div className="text-xl font-bold text-blue-900">{formatPrice(trip.price)}</div>
                <div className="text-xs text-blue-600">per person</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Trip Selection */}
              <Card className="p-6 border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Trip Details & Participants
                  </h2>
                </div>

                {/* Departure Date Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <CalendarDaysIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Choose Your Departure Date *
                  </label>

                  <div className="relative">
                    <input
                      type="date"
                      name="selectedDate"
                      value={bookingData.selectedDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]} // Today's date as minimum
                      className={`w-full p-4 border-2 rounded-lg text-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.selectedDate ? 'border-red-500' :
                        bookingData.selectedDate
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    />

                    {bookingData.selectedDate && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-start">
                          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-semibold text-green-900 mb-2">
                              Trip Dates Confirmed
                            </div>

                            {/* Date Range Display */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div className="bg-white p-3 rounded-lg border border-green-200">
                                <div className="text-xs text-green-600 font-medium mb-1">DEPARTURE</div>
                                <div className="font-semibold text-gray-900">
                                  {new Date(bookingData.selectedDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>

                              <div className="bg-white p-3 rounded-lg border border-green-200">
                                <div className="text-xs text-green-600 font-medium mb-1">RETURN</div>
                                <div className="font-semibold text-gray-900">
                                  {calculateEndDate(bookingData.selectedDate)?.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  }) || 'Calculating...'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Day {trip?.duration_days || trip?.durationDays || trip?.duration || 1} of trip
                                </div>
                              </div>
                            </div>

                            {/* Trip Duration Summary */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="text-green-700">
                                {preSelectedData.date === bookingData.selectedDate ?
                                  '✨ Pre-selected from trip page' :
                                  '✅ Date confirmed and available'
                                }
                              </div>
                              <div className="bg-green-100 px-2 py-1 rounded-full text-green-800 font-medium">
                                {trip?.duration_days || trip?.durationDays || trip?.duration || 1} {(trip?.duration_days || trip?.durationDays || trip?.duration || 1) === 1 ? 'day' : 'days'} trip
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {!bookingData.selectedDate && (
                      <div className="mt-2 text-sm text-gray-500 flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        Please select your preferred departure date
                      </div>
                    )}
                  </div>

                  {errors.selectedDate && <p className="text-red-500 text-sm mt-2">{errors.selectedDate}</p>}

                  {/* Date Guidelines */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                      <InformationCircleIcon className="h-4 w-4 mr-1" />
                      Booking Guidelines:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Book anytime - no advance booking restrictions</li>
                      <li>• Weather conditions may affect some dates</li>
                      <li>• Free date changes up to 48 hours before departure</li>
                    </ul>
                  </div>
                </div>

                {/* Participants Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <UsersIcon className="h-5 w-5 mr-2 text-blue-600" />
                    How many people are traveling? *
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {Array.from({ length: Math.min(trip.max_participants, 12) }, (_, i) => i + 1).map(num => {
                      const isSelected = bookingData.numberOfParticipants === num;
                      const isPreSelected = preSelectedData.participants === num;

                      return (
                        <motion.button
                          key={num}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleInputChange({ target: { name: 'numberOfParticipants', value: num } })}
                          className={`p-4 border-2 rounded-lg text-center transition-all relative ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="text-2xl font-bold mb-1">{num}</div>
                          <div className="text-xs">
                            {num === 1 ? 'Person' : 'People'}
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

                  {trip.max_participants > 12 && (
                    <div className="mt-3">
                      <label className="block text-sm text-gray-600 mb-2">
                        For groups larger than 12 people:
                      </label>
                      <select
                        name="numberOfParticipants"
                        value={bookingData.numberOfParticipants > 12 ? bookingData.numberOfParticipants : ''}
                        onChange={handleInputChange}
                        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select group size</option>
                        {Array.from({ length: trip.max_participants - 12 }, (_, i) => i + 13).map(num => (
                          <option key={num} value={num}>
                            {num} People
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {errors.numberOfParticipants && <p className="text-red-500 text-sm mt-2">{errors.numberOfParticipants}</p>}

                  {/* Selection Summary */}
                  {bookingData.numberOfParticipants > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">
                            🎉 Great choice! You're booking for {bookingData.numberOfParticipants} {bookingData.numberOfParticipants === 1 ? 'person' : 'people'}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Next, you'll need to fill in details for each participant
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {formatPrice(calculateTotal())}
                          </div>
                          <div className="text-xs text-gray-500">Total Cost</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <ChatBubbleLeftIcon className="h-4 w-4 mr-2 text-gray-500" />
                    Special Requests (Optional)
                  </label>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Any dietary restrictions, accessibility needs, or special requests..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Let us know about any special requirements to make your trip perfect!
                  </p>
                </div>
              </Card>

              {/* Step 2: Participants Information */}
              {bookingData.numberOfParticipants > 0 && (
                <Card className="p-6 border-l-4 border-l-green-500 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                      Participant Details ({bookingData.numberOfParticipants} {bookingData.numberOfParticipants === 1 ? 'Person' : 'People'})
                    </h2>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Please provide the required information for each participant. The first person will be the main contact for this booking.
                  </p>
                </Card>
              )}

              {/* Individual Participant Forms */}
              {participants.map((participant, index) => {
                const isExpanded = expandedParticipants.includes(index);
                const completionStatus = getParticipantCompletionStatus(participant);

                return (
                  <Card key={index} className="overflow-hidden border-l-4 border-l-blue-300">
                    {/* Participant Header */}
                    <div
                      className="p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleParticipantExpansion(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <UserIcon className="h-5 w-5 text-gray-600" />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {participant.firstName && participant.lastName
                                ? `${participant.firstName} ${participant.lastName}`
                                : index === 0
                                  ? `Main Booker (Participant ${index + 1})`
                                  : `Participant ${index + 1}`
                              }
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              {participant.isMainBooker && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  Main Booker
                                </span>
                              )}
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                completionStatus.isComplete
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {completionStatus.completed}/{completionStatus.total} fields
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Progress indicator */}
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                completionStatus.isComplete ? 'bg-green-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${completionStatus.percentage}%` }}
                            />
                          </div>

                          {/* Main booker toggle */}
                          {!participant.isMainBooker && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMainBooker(index);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              Set as Main
                            </button>
                          )}

                          {/* Expand/collapse icon */}
                          {isExpanded ? (
                            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Participant Form */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* First Name */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                  <UserIcon className="h-4 w-4 mr-1" />
                                  First Name *
                                </label>
                                <input
                                  type="text"
                                  value={participant.firstName}
                                  onChange={(e) => handleParticipantChange(index, 'firstName', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                    errors[`participant_${index}_firstName`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  placeholder="Enter first name"
                                />
                                {errors[`participant_${index}_firstName`] && (
                                  <p className="text-red-500 text-sm mt-1">{errors[`participant_${index}_firstName`]}</p>
                                )}
                              </div>

                              {/* Last Name */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                  <UserIcon className="h-4 w-4 mr-1" />
                                  Last Name *
                                </label>
                                <input
                                  type="text"
                                  value={participant.lastName}
                                  onChange={(e) => handleParticipantChange(index, 'lastName', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                    errors[`participant_${index}_lastName`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  placeholder="Enter last name"
                                />
                                {errors[`participant_${index}_lastName`] && (
                                  <p className="text-red-500 text-sm mt-1">{errors[`participant_${index}_lastName`]}</p>
                                )}
                              </div>

                              {/* Email */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                  <EnvelopeIcon className="h-4 w-4 mr-1" />
                                  Email Address *
                                </label>
                                <input
                                  type="email"
                                  value={participant.email}
                                  onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                    errors[`participant_${index}_email`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  placeholder="Enter email address"
                                />
                                {errors[`participant_${index}_email`] && (
                                  <p className="text-red-500 text-sm mt-1">{errors[`participant_${index}_email`]}</p>
                                )}
                              </div>

                              {/* Phone */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                  <PhoneIcon className="h-4 w-4 mr-1" />
                                  Phone Number *
                                </label>
                                <input
                                  type="tel"
                                  value={participant.phone}
                                  onChange={(e) => handleParticipantChange(index, 'phone', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                    errors[`participant_${index}_phone`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  placeholder="+1 234 567 8900"
                                />
                                {errors[`participant_${index}_phone`] && (
                                  <p className="text-red-500 text-sm mt-1">{errors[`participant_${index}_phone`]}</p>
                                )}
                              </div>

                              {/* Date of Birth */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                  <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                  Date of Birth *
                                </label>
                                <input
                                  type="date"
                                  value={participant.dateOfBirth}
                                  onChange={(e) => handleParticipantChange(index, 'dateOfBirth', e.target.value)}
                                  max={new Date().toISOString().split('T')[0]}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                    errors[`participant_${index}_dateOfBirth`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                />
                                {errors[`participant_${index}_dateOfBirth`] && (
                                  <p className="text-red-500 text-sm mt-1">{errors[`participant_${index}_dateOfBirth`]}</p>
                                )}
                              </div>

                              {/* Nationality */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                  <GlobeAltIcon className="h-4 w-4 mr-1" />
                                  Nationality *
                                </label>
                                <select
                                  value={participant.nationality}
                                  onChange={(e) => handleParticipantChange(index, 'nationality', e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                    errors[`participant_${index}_nationality`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                >
                                  <option value="">Select nationality</option>
                                  <option value="US">United States</option>
                                  <option value="CA">Canada</option>
                                  <option value="GB">United Kingdom</option>
                                  <option value="AU">Australia</option>
                                  <option value="DE">Germany</option>
                                  <option value="FR">France</option>
                                  <option value="IT">Italy</option>
                                  <option value="ES">Spain</option>
                                  <option value="NL">Netherlands</option>
                                  <option value="JP">Japan</option>
                                  <option value="KR">South Korea</option>
                                  <option value="CN">China</option>
                                  <option value="IN">India</option>
                                  <option value="BR">Brazil</option>
                                  <option value="MX">Mexico</option>
                                  <option value="ZA">South Africa</option>
                                  <option value="EG">Egypt</option>
                                  <option value="AE">United Arab Emirates</option>
                                  <option value="SA">Saudi Arabia</option>
                                  <option value="other">Other</option>
                                </select>
                                {errors[`participant_${index}_nationality`] && (
                                  <p className="text-red-500 text-sm mt-1">{errors[`participant_${index}_nationality`]}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}



              {/* Step 3: Emergency Contact */}
              <Card className="p-6 border-l-4 border-l-orange-500">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                    Emergency Contact Information
                  </h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Please provide emergency contact details for safety purposes during your trip.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={bookingData.emergencyContactName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Emergency contact name"
                    />
                    {errors.emergencyContactName && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={bookingData.emergencyContactPhone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Emergency contact phone"
                    />
                    {errors.emergencyContactPhone && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactPhone}</p>}
                  </div>
                </div>
              </Card>

              {/* Step 4: Terms and Conditions */}
              <Card className="p-6 border-l-4 border-l-purple-500">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                    Terms & Conditions
                  </h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Please review and accept our terms to complete your booking.
                </p>

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
                      I would like to receive travel tips and special offers via email
                    </label>
                  </div>
                </div>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  size="large"
                  loading={submitting}
                  disabled={submitting}
                  className="px-12 py-3 text-lg"
                  icon={submitting ? <ArrowPathIcon className="animate-spin" /> : <CheckCircleIcon />}
                >
                  {submitting ? 'Processing Booking...' : 'Review & Confirm Booking'}
                </Button>
              </div>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="sticky top-4 lg:top-8">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>

                {/* Trip Info */}
                <div className="mb-6">
                  <img
                    src={trip.main_image || 'https://picsum.photos/400/200?random=booking'}
                    alt={trip.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-900">{trip.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {trip.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {trip.duration_days} days
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900 border-b pb-2 flex items-center">
                    <CalculatorIcon className="h-5 w-5 mr-2" />
                    Booking Summary
                  </h4>

                  <div className="space-y-4">
                    {/* Base price */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center">
                        <CreditCardIcon className="h-4 w-4 mr-1" />
                        Price per person
                      </span>
                      <span className="font-medium">{formatPrice(trip.price)}</span>
                    </div>

                    {/* Participants count */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center">
                        <UsersIcon className="h-4 w-4 mr-1" />
                        Participants
                      </span>
                      <div className="text-right">
                        <span className="font-medium text-lg text-blue-600">{bookingData.numberOfParticipants}</span>
                        <div className="text-xs text-gray-500">
                          {bookingData.numberOfParticipants === 1 ? 'person' : 'people'}
                        </div>
                      </div>
                    </div>

                    {/* Calculation formula */}
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <div className="text-sm text-blue-700 mb-2 font-medium">Price Calculation:</div>
                      <div className="text-sm text-blue-800 font-mono">
                        {formatPrice(trip.price)} × {bookingData.numberOfParticipants} = {formatPrice(calculateTotal())}
                      </div>
                    </div>

                    {/* Total amount */}
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
                            All taxes included
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Savings indicator (if applicable) */}
                    {bookingData.numberOfParticipants >= 4 && (
                      <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                        <div className="text-sm text-green-700 font-medium">
                          🎉 Group Booking Eligible!
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          Contact us for potential group discounts
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Participants Status */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Participants Status</h4>
                  <div className="space-y-2">
                    {participants.map((participant, index) => {
                      const isComplete = participant.firstName && participant.lastName &&
                                       participant.email && participant.phone && participant.dateOfBirth;

                      return (
                        <div key={index} className={`p-3 rounded-lg border ${
                          isComplete ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                isComplete ? 'bg-green-500' : 'bg-yellow-500'
                              }`}></div>
                              <span className="text-sm font-medium">
                                {index === 0 ? 'Main Booker' : `Participant ${index + 1}`}
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isComplete
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {isComplete ? 'Complete' : 'Pending'}
                            </span>
                          </div>

                          {participant.firstName && participant.lastName && (
                            <div className="mt-2">
                              <div className="text-sm font-medium text-gray-900">
                                {participant.firstName} {participant.lastName}
                              </div>
                              {participant.email && (
                                <div className="text-xs text-gray-600">{participant.email}</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress indicator */}
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-800 mb-1">Form Progress</div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(participants.filter(p =>
                            p.firstName && p.lastName && p.email && p.phone && p.dateOfBirth
                          ).length / participants.length) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {participants.filter(p => p.firstName && p.lastName && p.email && p.phone && p.dateOfBirth).length} of {participants.length} completed
                    </div>
                  </div>
                </div>

                {/* Selected Date */}
                {bookingData.selectedDate && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Date</h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-blue-900">
                        {new Date(bookingData.selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Important Notes */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• This is a booking request, not a confirmed booking</li>
                    <li>• We'll contact you within 24 hours for confirmation</li>
                    <li>• Payment will be processed after confirmation</li>
                    <li>• Free cancellation up to 24 hours before departure</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmationModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowConfirmationModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Confirm Your Booking</h2>
                    <button
                      onClick={() => setShowConfirmationModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ExclamationTriangleIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Trip Summary */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Trip Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={trip.main_image || 'https://picsum.photos/100/100?random=trip'}
                          alt={trip.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-semibold">{trip.title}</h4>
                          <div className="text-sm text-gray-600 flex items-center mt-1">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {trip.location}
                          </div>
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center mb-1">
                              <CalendarDaysIcon className="h-4 w-4 mr-1" />
                              <span className="font-medium">Trip Dates:</span>
                            </div>
                            {bookingData.selectedDate && (
                              <div className="ml-5 space-y-1">
                                <div>
                                  <span className="text-xs text-gray-500">Departure:</span> {new Date(bookingData.selectedDate).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                                {trip.duration_days && (
                                  <div>
                                    <span className="text-xs text-gray-500">Return:</span> {calculateEndDate(bookingData.selectedDate, trip.duration_days)?.toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </div>
                                )}
                                <div className="text-xs text-blue-600 font-medium">
                                  ({trip.duration_days} {trip.duration_days === 1 ? 'day' : 'days'} trip)
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Participants Summary */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Participants ({participants.length})</h3>
                    <div className="space-y-2">
                      {participants.map((participant, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {participant.firstName} {participant.lastName}
                                {participant.isMainBooker && (
                                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    Main Booker
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {participant.email} • {participant.phone}
                              </div>
                              <div className="text-sm text-gray-600">
                                {participant.nationality} • Born: {new Date(participant.dateOfBirth).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Price Summary</h3>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span>Price per person:</span>
                        <span className="font-medium">{formatPrice(trip.price)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span>Number of participants:</span>
                        <span className="font-medium">{bookingData.numberOfParticipants}</span>
                      </div>
                      <div className="border-t border-blue-300 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total Amount:</span>
                          <span className="text-xl font-bold text-blue-600">
                            {formatPrice(calculateTotal())}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {bookingData.specialRequests && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Special Requests</h3>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-700">{bookingData.specialRequests}</p>
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Emergency Contact</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700">
                        {bookingData.emergencyContactName} - {bookingData.emergencyContactPhone}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmationModal(false)}
                      className="flex-1"
                    >
                      Back to Edit
                    </Button>
                    <Button
                      onClick={confirmBooking}
                      loading={submitting}
                      disabled={submitting}
                      className="flex-1"
                      icon={submitting ? <ArrowPathIcon className="animate-spin" /> : <CheckCircleIcon />}
                    >
                      {submitting ? 'Processing...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

export default BookTrip;
