import express from 'express';
import {
  getAllHotels,
  getFeaturedHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  getHotelStats,
  searchHotels,
  getHotelsByCategory,
  toggleFeatured
} from '../controllers/hotelController.js';
import {
  validateHotel,
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
  trackAPIUsage('hotels_list'),
  trackPageView('hotel'),
  asyncHandler(getAllHotels)
);

router.get(
  '/featured',
  optionalAuth,
  trackAPIUsage('hotels_featured'),
  asyncHandler(getFeaturedHotels)
);

router.get(
  '/search',
  optionalAuth,
  validateSearch,
  trackSearch,
  trackAPIUsage('hotels_search'),
  asyncHandler(searchHotels)
);

router.get(
  '/category/:categoryId',
  optionalAuth,
  validateUUID('categoryId'),
  trackAPIUsage('hotels_by_category'),
  asyncHandler(getHotelsByCategory)
);

router.get(
  '/stats',
  authenticateToken,
  requireAdmin,
  trackAPIUsage('hotels_stats'),
  asyncHandler(getHotelStats)
);

router.get(
  '/:id',
  optionalAuth,
  trackPageView('hotel'),
  trackAPIUsage('hotel_detail'),
  asyncHandler(getHotel)
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
  validateHotel,
  trackAPIUsage('hotel_create'),
  asyncHandler(createHotel)
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
  trackAPIUsage('hotel_update'),
  asyncHandler(updateHotel)
);

router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  validateUUID('id'),
  trackAPIUsage('hotel_delete'),
  asyncHandler(deleteHotel)
);

router.patch(
  '/:id/featured',
  authenticateToken,
  requireAdmin,
  validateUUID('id'),
  trackAPIUsage('hotel_toggle_featured'),
  asyncHandler(toggleFeatured)
);

export default router;
