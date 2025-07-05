import express from 'express';
import {
  getAllTrips,
  getFeaturedTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripStats,
  searchTrips,
  getTripsByCategory,
  toggleFeatured
} from '../controllers/tripController.js';
import {
  validateTrip,
  validateUUID,
  validateSlug,
  validateSearch
} from '../middleware/validation.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { uploadMixed, cleanupOnError } from '../middleware/upload.js';
import { trackPageView, trackSearch, trackAPIUsage } from '../middleware/analytics.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Public routes
router.get(
  '/',
  optionalAuth,
  trackAPIUsage('trips_list'),
  trackPageView('trip'),
  asyncHandler(getAllTrips)
);

router.get(
  '/featured',
  optionalAuth,
  trackAPIUsage('trips_featured'),
  asyncHandler(getFeaturedTrips)
);

router.get(
  '/search',
  optionalAuth,
  validateSearch,
  trackSearch,
  trackAPIUsage('trips_search'),
  asyncHandler(searchTrips)
);

router.get(
  '/category/:categoryId',
  optionalAuth,
  validateUUID('categoryId'),
  trackAPIUsage('trips_by_category'),
  asyncHandler(getTripsByCategory)
);

router.get(
  '/stats',
  authenticateToken,
  requireAdmin,
  trackAPIUsage('trips_stats'),
  asyncHandler(getTripStats)
);

router.get(
  '/:id',
  optionalAuth,
  trackPageView('trip'),
  trackAPIUsage('trip_detail'),
  asyncHandler(getTrip)
);

// Protected routes (Admin only)
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  uploadMixed([
    { name: 'mainImage', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
  ]),
  cleanupOnError,
  validateTrip,
  trackAPIUsage('trip_create'),
  asyncHandler(createTrip)
);

router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  validateUUID('id'),
  uploadMixed([
    { name: 'mainImage', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
  ]),
  cleanupOnError,
  trackAPIUsage('trip_update'),
  asyncHandler(updateTrip)
);

router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  validateUUID('id'),
  trackAPIUsage('trip_delete'),
  asyncHandler(deleteTrip)
);

router.patch(
  '/:id/featured',
  authenticateToken,
  requireAdmin,
  validateUUID('id'),
  trackAPIUsage('trip_toggle_featured'),
  asyncHandler(toggleFeatured)
);

export default router;
