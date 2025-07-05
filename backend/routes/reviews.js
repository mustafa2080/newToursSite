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

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Validation middleware
const validateItemType = (req, res, next) => {
  const { itemType } = req.params;
  if (!['trip', 'hotel'].includes(itemType)) {
    return res.status(400).json({ error: 'Invalid item type. Must be "trip" or "hotel"' });
  }
  next();
};

const validateRating = (req, res, next) => {
  const { rating } = req.body;
  if (rating !== undefined && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }
  next();
};

const validateComment = (req, res, next) => {
  const { comment } = req.body;
  if (!comment || comment.trim().length < 10 || comment.trim().length > 2000) {
    return res.status(400).json({ error: 'Comment must be between 10 and 2000 characters' });
  }
  next();
};

// GET /api/reviews/:itemType/:itemId - Get all reviews and ratings for an item
router.get('/:itemType/:itemId', validateItemType, async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get rating statistics
    const ratingStatsQuery = `
      SELECT * FROM rating_stats 
      WHERE item_type = $1 AND item_id = $2
    `;
    const ratingStatsResult = await pool.query(ratingStatsQuery, [itemType, itemId]);
    const ratingStats = ratingStatsResult.rows[0] || {
      total_ratings: 0,
      average_rating: 0,
      five_star_count: 0,
      four_star_count: 0,
      three_star_count: 0,
      two_star_count: 0,
      one_star_count: 0
    };

    // Get reviews with user info
    const reviewsQuery = `
      SELECT 
        r.id,
        r.comment,
        r.is_edited,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.username,
        u.avatar_url,
        rt.rating
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN ratings rt ON r.rating_id = rt.id
      WHERE r.item_type = $1 AND r.item_id = $2 AND r.is_deleted = FALSE
      ORDER BY r.created_at DESC
      LIMIT $3 OFFSET $4
    `;
    const reviewsResult = await pool.query(reviewsQuery, [itemType, itemId, limit, offset]);

    // Get total review count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM reviews 
      WHERE item_type = $1 AND item_id = $2 AND is_deleted = FALSE
    `;
    const countResult = await pool.query(countQuery, [itemType, itemId]);
    const totalReviews = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: {
        ratingStats: {
          totalRatings: parseInt(ratingStats.total_ratings),
          averageRating: parseFloat(ratingStats.average_rating) || 0,
          distribution: {
            5: parseInt(ratingStats.five_star_count),
            4: parseInt(ratingStats.four_star_count),
            3: parseInt(ratingStats.three_star_count),
            2: parseInt(ratingStats.two_star_count),
            1: parseInt(ratingStats.one_star_count)
          }
        },
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
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/reviews/:itemType/:itemId/rating - Submit or update a rating
router.post('/:itemType/:itemId/rating', 
  authenticateToken, 
  validateItemType, 
  validateRating, 
  async (req, res) => {
    try {
      const { itemType, itemId } = req.params;
      const { rating } = req.body;
      const userId = req.user.id;

      // Check if user already has a rating for this item
      const existingRatingQuery = `
        SELECT id FROM ratings 
        WHERE user_id = $1 AND item_type = $2 AND item_id = $3
      `;
      const existingRating = await pool.query(existingRatingQuery, [userId, itemType, itemId]);

      if (existingRating.rows.length > 0) {
        return res.status(400).json({ 
          error: 'You have already rated this item. Ratings cannot be changed once submitted.',
          code: 'RATING_ALREADY_EXISTS'
        });
      }

      // Insert new rating
      const insertRatingQuery = `
        INSERT INTO ratings (user_id, item_type, item_id, rating)
        VALUES ($1, $2, $3, $4)
        RETURNING id, rating, created_at
      `;
      const result = await pool.query(insertRatingQuery, [userId, itemType, itemId, rating]);

      res.status(201).json({
        success: true,
        message: 'Rating submitted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(400).json({ 
          error: 'You have already rated this item',
          code: 'RATING_ALREADY_EXISTS'
        });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
);

// POST /api/reviews/:itemType/:itemId/comment - Submit a new comment
router.post('/:itemType/:itemId/comment', 
  authenticateToken, 
  validateItemType, 
  validateComment, 
  async (req, res) => {
    try {
      const { itemType, itemId } = req.params;
      const { comment } = req.body;
      const userId = req.user.id;

      // Get user's rating for this item (if exists)
      const ratingQuery = `
        SELECT id FROM ratings 
        WHERE user_id = $1 AND item_type = $2 AND item_id = $3
      `;
      const ratingResult = await pool.query(ratingQuery, [userId, itemType, itemId]);
      const ratingId = ratingResult.rows[0]?.id || null;

      // Insert new comment
      const insertCommentQuery = `
        INSERT INTO reviews (user_id, item_type, item_id, comment, rating_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, comment, created_at
      `;
      const result = await pool.query(insertCommentQuery, [userId, itemType, itemId, comment.trim(), ratingId]);

      // Get user info for response
      const userQuery = `SELECT username, avatar_url FROM users WHERE id = $1`;
      const userResult = await pool.query(userQuery, [userId]);

      res.status(201).json({
        success: true,
        message: 'Comment submitted successfully',
        data: {
          ...result.rows[0],
          user: userResult.rows[0]
        }
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PUT /api/reviews/:reviewId - Edit a comment
router.put('/:reviewId', authenticateToken, validateComment, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    // Check if review exists and belongs to user
    const checkQuery = `
      SELECT id FROM reviews 
      WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE
    `;
    const checkResult = await pool.query(checkQuery, [reviewId, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or access denied' });
    }

    // Update comment
    const updateQuery = `
      UPDATE reviews 
      SET comment = $1, is_edited = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, comment, is_edited, updated_at
    `;
    const result = await pool.query(updateQuery, [comment.trim(), reviewId]);

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/reviews/:reviewId - Delete a comment
router.delete('/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Check if review exists and belongs to user
    const checkQuery = `
      SELECT id FROM reviews 
      WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE
    `;
    const checkResult = await pool.query(checkQuery, [reviewId, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or access denied' });
    }

    // Soft delete
    const deleteQuery = `
      UPDATE reviews 
      SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await pool.query(deleteQuery, [reviewId]);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reviews/:itemType/:itemId/user-rating - Get current user's rating
router.get('/:itemType/:itemId/user-rating', 
  authenticateToken, 
  validateItemType, 
  async (req, res) => {
    try {
      const { itemType, itemId } = req.params;
      const userId = req.user.id;

      const query = `
        SELECT rating, created_at 
        FROM ratings 
        WHERE user_id = $1 AND item_type = $2 AND item_id = $3
      `;
      const result = await pool.query(query, [userId, itemType, itemId]);

      res.json({
        success: true,
        data: result.rows[0] || null
      });
    } catch (error) {
      console.error('Error fetching user rating:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
