import { User } from '../models/User.js';
import { Trip } from '../models/Trip.js';
import { Hotel } from '../models/Hotel.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';
import { Category } from '../models/Category.js';
import { query } from '../config/database.js';

// Dashboard Analytics
export const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const [usersResult, tripsResult, hotelsResult, bookingsResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['user']),
      query('SELECT COUNT(*) as count FROM trips WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM hotels WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM bookings')
    ]);

    // Get revenue data
    const revenueResult = await query(`
      SELECT 
        SUM(total_price) as total_revenue,
        COUNT(*) as total_bookings,
        AVG(total_price) as avg_booking_value
      FROM bookings 
      WHERE status = 'confirmed'
    `);

    // Get monthly revenue for the last 12 months
    const monthlyRevenueResult = await query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(total_price) as revenue,
        COUNT(*) as bookings
      FROM bookings 
      WHERE status = 'confirmed' 
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    // Get top performing trips/hotels
    const topTripsResult = await query(`
      SELECT 
        t.title,
        t.slug,
        COUNT(b.id) as booking_count,
        SUM(b.total_price) as revenue
      FROM trips t
      LEFT JOIN bookings b ON t.id = b.trip_id AND b.status = 'confirmed'
      WHERE t.is_active = true
      GROUP BY t.id, t.title, t.slug
      ORDER BY booking_count DESC
      LIMIT 5
    `);

    const topHotelsResult = await query(`
      SELECT 
        h.name,
        h.slug,
        COUNT(b.id) as booking_count,
        SUM(b.total_price) as revenue
      FROM hotels h
      LEFT JOIN bookings b ON h.id = b.hotel_id AND b.status = 'confirmed'
      WHERE h.is_active = true
      GROUP BY h.id, h.name, h.slug
      ORDER BY booking_count DESC
      LIMIT 5
    `);

    // Get recent bookings
    const recentBookingsResult = await query(`
      SELECT 
        b.*,
        u.first_name,
        u.last_name,
        u.email,
        t.title as trip_title,
        h.name as hotel_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN trips t ON b.trip_id = t.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `);

    res.json({
      status: 'success',
      data: {
        overview: {
          totalUsers: parseInt(usersResult.rows[0].count),
          totalTrips: parseInt(tripsResult.rows[0].count),
          totalHotels: parseInt(hotelsResult.rows[0].count),
          totalBookings: parseInt(bookingsResult.rows[0].count),
          totalRevenue: parseFloat(revenueResult.rows[0].total_revenue || 0),
          avgBookingValue: parseFloat(revenueResult.rows[0].avg_booking_value || 0)
        },
        monthlyRevenue: monthlyRevenueResult.rows,
        topTrips: topTripsResult.rows,
        topHotels: topHotelsResult.rows,
        recentBookings: recentBookingsResult.rows
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// User Management
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (role) {
      paramCount++;
      whereClause += ` AND role = $${paramCount}`;
      params.push(role);
    }

    const countResult = await query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
    const totalUsers = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const usersResult = await query(`
      SELECT 
        id, email, first_name, last_name, phone, role, is_active, 
        email_verified, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, params);

    res.json({
      status: 'success',
      data: {
        users: usersResult.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNext: page < Math.ceil(totalUsers / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
};

// Update user status
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const result = await query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [isActive, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Log admin action
    await logAdminAction(req.user.id, 'update_user_status', 'user', userId, {
      isActive,
      targetUser: result.rows[0].email
    }, req);

    res.json({
      status: 'success',
      message: 'User status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user status'
    });
  }
};

// Booking Management
export const getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const type = req.query.type || '';

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND b.status = $${paramCount}`;
      params.push(status);
    }

    if (type) {
      paramCount++;
      whereClause += ` AND b.booking_type = $${paramCount}`;
      params.push(type);
    }

    const countResult = await query(`SELECT COUNT(*) FROM bookings b ${whereClause}`, params);
    const totalBookings = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const bookingsResult = await query(`
      SELECT 
        b.*,
        u.first_name,
        u.last_name,
        u.email,
        t.title as trip_title,
        h.name as hotel_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN trips t ON b.trip_id = t.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, params);

    res.json({
      status: 'success',
      data: {
        bookings: bookingsResult.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalBookings / limit),
          totalBookings,
          hasNext: page < Math.ceil(totalBookings / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const result = await query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Log admin action
    await logAdminAction(req.user.id, 'update_booking_status', 'booking', bookingId, {
      status,
      bookingReference: result.rows[0].booking_reference
    }, req);

    res.json({
      status: 'success',
      message: 'Booking status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update booking status'
    });
  }
};

// Helper function to log admin actions
const logAdminAction = async (adminId, action, resourceType, resourceId, details, req) => {
  try {
    await query(`
      INSERT INTO admin_logs (admin_id, action, resource_type, resource_id, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      adminId,
      action,
      resourceType,
      resourceId,
      JSON.stringify(details),
      req.ip,
      req.get('User-Agent')
    ]);
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};
