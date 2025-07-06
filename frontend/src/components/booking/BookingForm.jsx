import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  UsersIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { bookingsAPI, formatCurrency } from '../../utils/postgresApi';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

const BookingForm = ({ 
  item, 
  type, // 'trip' or 'hotel'
  onBookingComplete,
  className = '' 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    guestName: user ? `${user.firstName} ${user.lastName}` : '',
    guestEmail: user ? user.email : '',
    guestPhone: user ? user.phone || '' : '',
    numberOfGuests: 1,
    departureDate: '',
    checkInDate: '',
    checkOutDate: '',
    roomType: '',
    specialRequests: ''
  });

  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [booking, setBooking] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Details, 2: Confirmation, 3: Payment

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        guestName: `${user.firstName} ${user.lastName}`,
        guestEmail: user.email,
        guestPhone: user.phone || ''
      }));
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required';
    }

    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.guestEmail)) {
      newErrors.guestEmail = 'Please enter a valid email';
    }

    if (!formData.guestPhone.trim()) {
      newErrors.guestPhone = 'Phone number is required';
    }

    if (formData.numberOfGuests < 1) {
      newErrors.numberOfGuests = 'At least 1 guest is required';
    }

    if (type === 'trip') {
      if (!formData.departureDate) {
        newErrors.departureDate = 'Departure date is required';
      }
    } else if (type === 'hotel') {
      if (!formData.checkInDate) {
        newErrors.checkInDate = 'Check-in date is required';
      }
      if (!formData.checkOutDate) {
        newErrors.checkOutDate = 'Check-out date is required';
      }
      if (formData.checkInDate && formData.checkOutDate && 
          new Date(formData.checkInDate) >= new Date(formData.checkOutDate)) {
        newErrors.checkOutDate = 'Check-out date must be after check-in date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkAvailability = async () => {
    if (!validateForm()) return;

    setCheckingAvailability(true);
    try {
      const dates = type === 'trip' 
        ? { departureDate: formData.departureDate }
        : { checkInDate: formData.checkInDate, checkOutDate: formData.checkOutDate };

      const response = await bookingsAPI.checkAvailability(type, item.id, dates);
      setAvailability(response.data);
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailability({
        available: false,
        message: 'Unable to check availability. Please try again.'
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const calculateTotal = () => {
    if (type === 'trip') {
      return item.price * formData.numberOfGuests;
    } else if (type === 'hotel') {
      const nights = formData.checkInDate && formData.checkOutDate
        ? Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24))
        : 0;
      return item.price_per_night * nights;
    }
    return 0;
  };

  const handleBooking = async () => {
    if (!validateForm() || !availability?.available) return;

    setBooking(true);
    try {
      const bookingData = {
        userId: user?.id,
        [type === 'trip' ? 'tripId' : 'hotelId']: item.id,
        bookingType: type,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        numberOfGuests: formData.numberOfGuests,
        specialRequests: formData.specialRequests,
        basePrice: type === 'trip' ? item.price : item.price_per_night,
        totalPrice: calculateTotal()
      };

      if (type === 'trip') {
        bookingData.departureDate = formData.departureDate;
      } else {
        bookingData.checkInDate = formData.checkInDate;
        bookingData.checkOutDate = formData.checkOutDate;
        bookingData.numberOfNights = Math.ceil(
          (new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24)
        );
        bookingData.roomType = formData.roomType;
      }

      const response = await bookingsAPI.create(bookingData);
      onBookingComplete?.(response.data);
    } catch (error) {
      console.error('Error creating booking:', error);
      setErrors({ submit: error.message || 'Failed to create booking. Please try again.' });
    } finally {
      setBooking(false);
    }
  };

  const renderAvailabilityStatus = () => {
    if (checkingAvailability) {
      return (
        <div className="flex items-center text-blue-600">
          <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
          Checking availability...
        </div>
      );
    }

    if (!availability) return null;

    return (
      <div className={`flex items-center ${availability.available ? 'text-green-600' : 'text-red-600'}`}>
        {availability.available ? (
          <CheckCircleIcon className="h-5 w-5 mr-2" />
        ) : (
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
        )}
        {availability.message}
      </div>
    );
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Book {type === 'trip' ? 'Trip' : 'Hotel'}
        </h3>
        <p className="text-gray-600">
          {type === 'trip' ? item.title : item.name}
        </p>
      </div>

      <form className="space-y-6">
        {/* Guest Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Guest Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.guestName}
              onChange={(e) => handleInputChange('guestName', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.guestName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
            />
            {errors.guestName && (
              <p className="text-red-500 text-sm mt-1">{errors.guestName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.guestEmail}
                onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.guestEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email"
              />
              {errors.guestEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.guestEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.guestPhone}
                onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.guestPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
              />
              {errors.guestPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.guestPhone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <UsersIcon className="h-4 w-4 inline mr-1" />
              Number of Guests *
            </label>
            <select
              value={formData.numberOfGuests}
              onChange={(e) => handleInputChange('numberOfGuests', parseInt(e.target.value))}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.numberOfGuests ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {Array.from({ length: type === 'trip' ? item.max_participants : 10 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Guest{i > 0 ? 's' : ''}
                </option>
              ))}
            </select>
            {errors.numberOfGuests && (
              <p className="text-red-500 text-sm mt-1">{errors.numberOfGuests}</p>
            )}
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            <CalendarDaysIcon className="h-5 w-5 inline mr-2" />
            {type === 'trip' ? 'Departure Date' : 'Stay Dates'}
          </h4>

          {type === 'trip' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departure Date *
              </label>
              <input
                type="date"
                value={formData.departureDate}
                onChange={(e) => handleInputChange('departureDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.departureDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.departureDate && (
                <p className="text-red-500 text-sm mt-1">{errors.departureDate}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.checkInDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.checkInDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.checkInDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                  min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.checkOutDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.checkOutDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.checkOutDate}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Any special requests or requirements..."
          />
        </div>

        {/* Availability Check */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Availability</h4>
            <Button
              type="button"
              onClick={checkAvailability}
              disabled={checkingAvailability}
              variant="outline"
              size="small"
            >
              {checkingAvailability ? <LoadingSpinner size="small" /> : 'Check Availability'}
            </Button>
          </div>
          {renderAvailabilityStatus()}
        </div>

        {/* Price Summary */}
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Price Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {type === 'trip' ? 'Price per person' : 'Price per night'}
              </span>
              <span className="font-medium">
                {formatCurrency(type === 'trip' ? item.price : item.price_per_night)}
              </span>
            </div>
            {type === 'trip' && (
              <div className="flex justify-between">
                <span className="text-gray-600">Guests</span>
                <span className="font-medium">{formData.numberOfGuests}</span>
              </div>
            )}
            {type === 'hotel' && formData.checkInDate && formData.checkOutDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Nights</span>
                <span className="font-medium">
                  {Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          {errors.submit && (
            <p className="text-red-500 text-sm mb-4">{errors.submit}</p>
          )}
          <Button
            type="button"
            onClick={handleBooking}
            disabled={booking || !availability?.available}
            className="w-full"
            size="large"
            icon={booking ? <LoadingSpinner size="small" /> : <CreditCardIcon />}
          >
            {booking ? 'Processing...' : `Book Now - ${formatCurrency(calculateTotal())}`}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default BookingForm;
