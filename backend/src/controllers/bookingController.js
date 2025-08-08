import { Booking, Trip, Hotel, User } from '../models/index.js';
import { createSuccessResponse, AppError } from '../middleware/errorHandler.js';
import { trackBookingCompletion } from '../middleware/analytics.js';
import { sendBookingConfirmation, sendBookingCancellation } from '../utils/email.js';
import { daysBetween } from '../utils/helpers.js';

// Create new booking
export const createBooking = async (req, res, next) => {
  try {
    const {
      tripId,
      hotelId,
      bookingType,
      guestName,
      guestEmail,
      guestPhone,
      numberOfGuests,
      departureDate,
      checkInDate,
      checkOutDate,
      roomType,
      specialRequests
    } = req.body;

    // Validate booking type and required fields
    if (bookingType === 'trip' && !tripId) {
      return next(new AppError('Trip ID is required for trip bookings', 400));
    }
    if (bookingType === 'hotel' && !hotelId) {
      return next(new AppError('Hotel ID is required for hotel bookings', 400));
    }

    let basePrice = 0;
    let totalPrice = 0;
    let numberOfNights = null;

    // Calculate pricing based on booking type
    if (bookingType === 'trip') {
      const trip = await Trip.findById(tripId);
      if (!trip) {
        return next(new AppError('Trip not found', 404));
      }
      if (!trip.is_active) {
        return next(new AppError('Trip is not available for booking', 400));
      }

      basePrice = trip.price;
      totalPrice = basePrice * numberOfGuests;

      // Validate departure date
      if (!departureDate) {
        return next(new AppError('Departure date is required for trip bookings', 400));
      }

      // Check if departure date is available
      if (trip.departure_dates && trip.departure_dates.length > 0) {
        const isDateAvailable = trip.departure_dates.some(date => 
          new Date(date).toDateString() === new Date(departureDate).toDateString()
        );
        if (!isDateAvailable) {
          return next(new AppError('Selected departure date is not available', 400));
        }
      }

    } else if (bookingType === 'hotel') {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return next(new AppError('Hotel not found', 404));
      }
      if (!hotel.is_active) {
        return next(new AppError('Hotel is not available for booking', 400));
      }

      // Validate check-in and check-out dates
      if (!checkInDate || !checkOutDate) {
        return next(new AppError('Check-in and check-out dates are required for hotel bookings', 400));
      }

      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      
      if (checkOut <= checkIn) {
        return next(new AppError('Check-out date must be after check-in date', 400));
      }

      numberOfNights = daysBetween(checkInDate, checkOutDate);
      basePrice = hotel.price_per_night;
      totalPrice = basePrice * numberOfNights * numberOfGuests;
    }

    const bookingData = {
      userId: req.user.id,
      tripId,
      hotelId,
      bookingType,
      guestName,
      guestEmail,
      guestPhone,
      numberOfGuests: parseInt(numberOfGuests),
      departureDate,
      checkInDate,
      checkOutDate,
      numberOfNights,
      roomType,
      basePrice,
      totalPrice,
      specialRequests
    };

    const booking = await Booking.create(bookingData);

    // Send confirmation email
    const user = await User.findById(req.user.id);
    await sendBookingConfirmation(booking, user);

    // Track booking completion
    trackBookingCompletion(booking);

    res.status(201).json(createSuccessResponse(
      booking,
      'Booking created successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Get user's bookings
export const getUserBookings = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      bookingType: req.query.bookingType,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };

    const result = await Booking.findByUserId(req.user.id, filters);

    res.json(createSuccessResponse(
      result.bookings,
      'User bookings retrieved successfully',
      { pagination: result.pagination }
    ));
  } catch (error) {
    next(error);
  }
};

// Get all bookings (Admin only)
export const getAllBookings = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      bookingType: req.query.bookingType,
      userId: req.query.userId,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'DESC'
    };

    const result = await Booking.findAll(filters);

    res.json(createSuccessResponse(
      result.bookings,
      'All bookings retrieved successfully',
      { pagination: result.pagination, filters }
    ));
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
export const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check if user owns the booking or is admin
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return next(new AppError('Access denied', 403));
    }

    res.json(createSuccessResponse(
      booking,
      'Booking retrieved successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Get booking by reference
export const getBookingByReference = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const booking = await Booking.findByReference(reference);

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check if user owns the booking or is admin
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return next(new AppError('Access denied', 403));
    }

    res.json(createSuccessResponse(
      booking,
      'Booking retrieved successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Update booking
export const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check if user owns the booking or is admin
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return next(new AppError('Access denied', 403));
    }

    // Prevent updates if booking is completed or cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return next(new AppError('Cannot update completed or cancelled bookings', 400));
    }

    const allowedUpdates = req.user.role === 'admin' 
      ? ['guest_name', 'guest_email', 'guest_phone', 'number_of_guests', 'special_requests', 'status']
      : ['guest_name', 'guest_email', 'guest_phone', 'special_requests'];

    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return next(new AppError('No valid fields to update', 400));
    }

    await booking.update(updateData);

    res.json(createSuccessResponse(
      booking,
      'Booking updated successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Cancel booking
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check if user owns the booking or is admin
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return next(new AppError('Access denied', 403));
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return next(new AppError('Booking is already cancelled', 400));
    }

    if (booking.status === 'completed') {
      return next(new AppError('Cannot cancel completed booking', 400));
    }

    await booking.cancel();

    // Send cancellation email
    const user = await User.findById(booking.user_id);
    await sendBookingCancellation(booking, user);

    res.json(createSuccessResponse(
      booking,
      'Booking cancelled successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Confirm booking (Admin only)
export const confirmBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    if (booking.status === 'confirmed') {
      return next(new AppError('Booking is already confirmed', 400));
    }

    if (booking.status === 'cancelled') {
      return next(new AppError('Cannot confirm cancelled booking', 400));
    }

    await booking.confirm();

    res.json(createSuccessResponse(
      booking,
      'Booking confirmed successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Complete booking (Admin only)
export const completeBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    if (booking.status === 'completed') {
      return next(new AppError('Booking is already completed', 400));
    }

    if (booking.status === 'cancelled') {
      return next(new AppError('Cannot complete cancelled booking', 400));
    }

    await booking.complete();

    res.json(createSuccessResponse(
      booking,
      'Booking completed successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Check availability
export const checkAvailability = async (req, res, next) => {
  try {
    const { type, resourceId, dates } = req.body;

    if (!type || !resourceId || !dates) {
      return next(new AppError('Type, resource ID, and dates are required', 400));
    }

    if (!['trip', 'hotel'].includes(type)) {
      return next(new AppError('Type must be either "trip" or "hotel"', 400));
    }

    const availability = await Booking.checkAvailability(type, resourceId, dates);

    res.json(createSuccessResponse(
      availability,
      'Availability checked successfully'
    ));
  } catch (error) {
    next(error);
  }
};

// Get booking statistics (Admin only)
export const getBookingStats = async (req, res, next) => {
  try {
    const filters = {
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    };

    const stats = await Booking.getStats(filters);

    res.json(createSuccessResponse(
      stats,
      'Booking statistics retrieved successfully'
    ));
  } catch (error) {
    next(error);
  }
};
