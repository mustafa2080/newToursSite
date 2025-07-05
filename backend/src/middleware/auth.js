import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authentication error'
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }

  if (!['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required'
    });
  }

  next();
};

// Middleware to check if user is super admin
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Super admin access required'
    });
  }

  next();
};

// Role-based permission checker
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Permission-based access control
export const requirePermission = (permission) => {
  const rolePermissions = {
    user: [
      'read:own_profile',
      'update:own_profile',
      'create:booking',
      'read:own_bookings',
      'update:own_bookings',
      'create:review',
      'read:own_reviews',
      'update:own_reviews',
      'create:wishlist',
      'read:own_wishlist',
      'delete:own_wishlist'
    ],
    admin: [
      'read:all_users',
      'update:all_users',
      'create:trip',
      'read:all_trips',
      'update:all_trips',
      'delete:all_trips',
      'create:hotel',
      'read:all_hotels',
      'update:all_hotels',
      'delete:all_hotels',
      'create:category',
      'read:all_categories',
      'update:all_categories',
      'delete:all_categories',
      'read:all_bookings',
      'update:all_bookings',
      'read:all_reviews',
      'update:all_reviews',
      'delete:all_reviews',
      'read:analytics',
      'manage:content_pages'
    ],
    super_admin: [
      'create:admin',
      'delete:admin',
      'manage:system_settings',
      'read:admin_logs',
      'manage:email_templates'
    ]
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userPermissions = rolePermissions[req.user.role] || [];
    const hasPermission = userPermissions.includes(permission) ||
                         (req.user.role === 'super_admin' && rolePermissions.admin.includes(permission));

    if (!hasPermission) {
      return res.status(403).json({
        status: 'error',
        message: `Permission denied: ${permission}`
      });
    }

    next();
  };
};

// Middleware to check if user owns resource or is admin
export const requireOwnershipOrAdmin = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.body[resourceUserIdField] || req.params.userId || req.resource?.[resourceUserIdField];
    
    if (resourceUserId && resourceUserId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.is_active) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    console.log('Optional auth failed:', error.message);
  }
  
  next();
};

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
