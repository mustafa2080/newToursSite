import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllBookings,
  updateBookingStatus
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard & Analytics
router.get('/dashboard/stats', requirePermission('read:analytics'), getDashboardStats);

// User Management
router.get('/users', requirePermission('read:all_users'), getAllUsers);
router.patch('/users/:userId/status', requirePermission('update:all_users'), updateUserStatus);

// Booking Management
router.get('/bookings', requirePermission('read:all_bookings'), getAllBookings);
router.patch('/bookings/:bookingId/status', requirePermission('update:all_bookings'), updateBookingStatus);

// Content Management Routes (to be implemented)
router.get('/content-pages', requirePermission('manage:content_pages'), (req, res) => {
  res.json({ status: 'success', message: 'Content pages endpoint - to be implemented' });
});

router.put('/content-pages/:type', requirePermission('manage:content_pages'), (req, res) => {
  res.json({ status: 'success', message: 'Update content page endpoint - to be implemented' });
});

// Review Management
router.get('/reviews', requirePermission('read:all_reviews'), (req, res) => {
  res.json({ status: 'success', message: 'Reviews management endpoint - to be implemented' });
});

router.patch('/reviews/:reviewId/approve', requirePermission('update:all_reviews'), (req, res) => {
  res.json({ status: 'success', message: 'Approve review endpoint - to be implemented' });
});

// Admin Logs
router.get('/logs', requirePermission('read:admin_logs'), (req, res) => {
  res.json({ status: 'success', message: 'Admin logs endpoint - to be implemented' });
});

export default router;
