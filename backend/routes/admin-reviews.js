const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tourism_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Check if user is admin (you should have an is_admin field in users table)
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = user;
    next();
  });
};

// GET /api/admin/reviews - Get all reviews with filters
router.get('/reviews', authenticateAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      itemType, 
      search, 
      sortBy = 'created_at',
      sortOrder = 'DESC' 
    } = req.query;
    
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE r.is_deleted = FALSE';
    const queryParams = [];
    let paramCount = 0;

    // Add filters
    if (itemType && ['trip', 'hotel'].includes(itemType)) {
      paramCount++;
      whereClause += ` AND r.item_type = $${paramCount}`;
      queryParams.push(itemType);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (r.comment ILIKE $${paramCount} OR u.username ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Validate sort parameters
    const validSortColumns = ['created_at', 'updated_at', 'username', 'item_type'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const reviewsQuery = `
      SELECT 
        r.id,
        r.comment,
        r.item_type,
        r.item_id,
        r.is_edited,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.username,
        u.email,
        u.avatar_url,
        rt.rating,
        i.title as item_title
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN ratings rt ON r.rating_id = rt.id
      LEFT JOIN items i ON r.item_type = i.item_type AND r.item_id = i.item_id
      ${whereClause}
      ORDER BY ${sortColumn === 'username' ? 'u.username' : 'r.' + sortColumn} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    queryParams.push(limit, offset);
    const reviewsResult = await pool.query(reviewsQuery, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const totalReviews = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: {
        reviews: reviewsResult.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNextPage: offset + limit < totalReviews,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/reviews/stats - Get review statistics
router.get('/reviews/stats', authenticateAdmin, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_reviews,
        COUNT(DISTINCT user_id) as unique_reviewers,
        COUNT(CASE WHEN item_type = 'trip' THEN 1 END) as trip_reviews,
        COUNT(CASE WHEN item_type = 'hotel' THEN 1 END) as hotel_reviews,
        COUNT(CASE WHEN is_edited = TRUE THEN 1 END) as edited_reviews,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as reviews_last_week,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as reviews_last_month
      FROM reviews 
      WHERE is_deleted = FALSE
    `;
    
    const ratingsStatsQuery = `
      SELECT 
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_ratings,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_ratings,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_ratings,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_ratings,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_ratings
      FROM ratings
    `;

    const [reviewStats, ratingStats] = await Promise.all([
      pool.query(statsQuery),
      pool.query(ratingsStatsQuery)
    ]);

    res.json({
      success: true,
      data: {
        reviews: reviewStats.rows[0],
        ratings: ratingStats.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/reviews/:reviewId - Delete a review (admin)
router.delete('/reviews/:reviewId', authenticateAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    // Check if review exists
    const checkQuery = `
      SELECT id, user_id, comment FROM reviews 
      WHERE id = $1 AND is_deleted = FALSE
    `;
    const checkResult = await pool.query(checkQuery, [reviewId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Soft delete with admin reason
    const deleteQuery = `
      UPDATE reviews 
      SET is_deleted = TRUE, 
          updated_at = CURRENT_TIMESTAMP,
          admin_delete_reason = $2,
          deleted_by_admin = $3
      WHERE id = $1
    `;
    await pool.query(deleteQuery, [reviewId, reason || 'Deleted by admin', req.user.id]);

    // Log the action (you might want to create an admin_actions table)
    console.log(`Admin ${req.user.id} deleted review ${reviewId}. Reason: ${reason}`);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review (admin):', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/reviews/flagged - Get flagged/reported reviews
router.get('/reviews/flagged', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // This assumes you have a reports table or flagged field
    // For now, we'll return reviews that might need attention (very short, very long, etc.)
    const flaggedQuery = `
      SELECT 
        r.id,
        r.comment,
        r.item_type,
        r.item_id,
        r.created_at,
        u.username,
        u.email,
        i.title as item_title,
        CASE 
          WHEN LENGTH(r.comment) < 20 THEN 'Too short'
          WHEN LENGTH(r.comment) > 1500 THEN 'Very long'
          WHEN r.comment ILIKE '%spam%' OR r.comment ILIKE '%fake%' THEN 'Potential spam'
          ELSE 'Manual review needed'
        END as flag_reason
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN items i ON r.item_type = i.item_type AND r.item_id = i.item_id
      WHERE r.is_deleted = FALSE 
        AND (
          LENGTH(r.comment) < 20 
          OR LENGTH(r.comment) > 1500
          OR r.comment ILIKE '%spam%'
          OR r.comment ILIKE '%fake%'
        )
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(flaggedQuery, [limit, offset]);

    res.json({
      success: true,
      data: {
        flaggedReviews: result.rows,
        pagination: {
          currentPage: parseInt(page),
          hasNextPage: result.rows.length === parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching flagged reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/reviews/:reviewId/approve - Approve a flagged review
router.put('/reviews/:reviewId/approve', authenticateAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Add approved_by_admin field to track admin approval
    const approveQuery = `
      UPDATE reviews 
      SET approved_by_admin = TRUE,
          approved_by = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_deleted = FALSE
    `;
    
    const result = await pool.query(approveQuery, [reviewId, req.user.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({
      success: true,
      message: 'Review approved successfully'
    });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
