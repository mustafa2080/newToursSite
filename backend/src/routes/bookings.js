import express from 'express';
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBooking,
  getBookingByReference,
  updateBooking,
  cancelBooking,
  confirmBooking,
  completeBooking,
  checkAvailability,
  getBookingStats
} from '../controllers/bookingController.js';
import {
  validateBooking,
  validateUUID
} from '../middleware/validation.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { trackBookingAttempt, trackAPIUsage } from '../middleware/analytics.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Public routes
router.post(
  '/check-availability',
  trackAPIUsage('availability_check'),
  asyncHandler(checkAvailability)
);

// Protected routes (User)
router.post(
  '/',
  authenticateToken,
  validateBooking,
  trackBookingAttempt,
  trackAPIUsage('booking_create'),
  asyncHandler(createBooking)
);

router.get(
  '/my-bookings',
  authenticateToken,
  trackAPIUsage('user_bookings'),
  asyncHandler(getUserBookings)
);

router.get(
  '/reference/:reference',
  authenticateToken,
  trackAPIUsage('booking_by_reference'),
  asyncHandler(getBookingByReference)
);

router.get(
  '/:id',
  authenticateToken,
  validateUUID('id'),
  trackAPIUsage('booking_detail'),
  asyncHandler(getBooking)
);

router.put(
  '/:id',
  authenticateToken,
  validateUUID('id'),
  trackAPIUsage('booking_update'),
  asyncHandler(updateBooking)
);

router.patch(
  '/:id/cancel',
  authenticateToken,
  validateUUID('id'),
  trackAPIUsage('booking_cancel'),
  asyncHandler(cancelBooking)
);

// Admin routes
router.get(
  '/',
  authenticateToken,
  requireAdmin,
  trackAPIUsage('bookings_list'),
  asyncHandler(getAllBookings)
);

router.get(
  '/stats/overview',
  authenticateToken,
  requireAdmin,
  trackAPIUsage('booking_stats'),
  asyncHandler(getBookingStats)
);

router.patch(
  '/:id/confirm',
  authenticateToken,
  requireAdmin,
  validateUUID('id'),
  trackAPIUsage('booking_confirm'),
  asyncHandler(confirmBooking)
);

router.patch(
  '/:id/complete',
  authenticateToken,
  requireAdmin,
  validateUUID('id'),
  trackAPIUsage('booking_complete'),
  asyncHandler(completeBooking)
);

export default router;
