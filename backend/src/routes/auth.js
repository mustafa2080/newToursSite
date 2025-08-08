import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile
} from '../controllers/authController.js';
import {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate
} from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateUserUpdate, updateProfile);

export default router;
