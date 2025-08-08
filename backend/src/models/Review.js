import { query } from '../config/database.js';

export class Review {
  constructor(data) {
    Object.assign(this, data);
  }

  // Create a new review
  static async create(reviewData) {
    const {
      userId,
      tripId,
      hotelId,
      bookingId,
      rating,
      title,
      comment
    } = reviewData;

    const result = await query(`
      INSERT INTO reviews (
        user_id, trip_id, hotel_id, booking_id, rating, title, comment
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [userId, tripId, hotelId, bookingId, rating, title, comment]);

    return new Review(result.rows[0]);
  }

  // Find review by ID
  static async findById(id) {
    const result = await query(`
      SELECT r.*, 
             u.first_name, u.last_name, u.profile_image,
             t.title as trip_title, t.slug as trip_slug,
             h.name as hotel_name, h.slug as hotel_slug,
             b.booking_reference
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN trips t ON r.trip_id = t.id
      LEFT JOIN hotels h ON r.hotel_id = h.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      WHERE r.id = $1
    `, [id]);
    
    return result.rows[0] ? new Review(result.rows[0]) : null;
  }

  // Get reviews for a trip
  static async findByTripId(tripId, filters = {}) {
    const {
      approved = true,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    let whereConditions = ['r.trip_id = $1'];
    let queryParams = [tripId];
    let paramCount = 2;

    if (approved !== null) {
      whereConditions.push(`r.is_approved = $${paramCount}`);
      queryParams.push(approved);
      paramCount++;
    }

    const offset = (page - 1) * limit;
    queryParams.push(limit, offset);

    const baseQuery = `
      SELECT r.*, 
             u.first_name, u.last_name, u.profile_image,
             b.booking_reference
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM reviews r
      WHERE ${whereConditions.join(' AND ')}
    `;

    const [reviewsResult, countResult] = await Promise.all([
      query(baseQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2))
    ]);

    const reviews = reviewsResult.rows.map(row => new Review(row));
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  // Get reviews for a hotel
  static async findByHotelId(hotelId, filters = {}) {
    const {
      approved = true,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    let whereConditions = ['r.hotel_id = $1'];
    let queryParams = [hotelId];
    let paramCount = 2;

    if (approved !== null) {
      whereConditions.push(`r.is_approved = $${paramCount}`);
      queryParams.push(approved);
      paramCount++;
    }

    const offset = (page - 1) * limit;
    queryParams.push(limit, offset);

    const baseQuery = `
      SELECT r.*, 
             u.first_name, u.last_name, u.profile_image,
             b.booking_reference
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM reviews r
      WHERE ${whereConditions.join(' AND ')}
    `;

    const [reviewsResult, countResult] = await Promise.all([
      query(baseQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2))
    ]);

    const reviews = reviewsResult.rows.map(row => new Review(row));
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  // Get user reviews
  static async findByUserId(userId, filters = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;

    const baseQuery = `
      SELECT r.*, 
             t.title as trip_title, t.slug as trip_slug,
             h.name as hotel_name, h.slug as hotel_slug,
             b.booking_reference
      FROM reviews r
      LEFT JOIN trips t ON r.trip_id = t.id
      LEFT JOIN hotels h ON r.hotel_id = h.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      WHERE r.user_id = $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM reviews r
      WHERE r.user_id = $1
    `;

    const [reviewsResult, countResult] = await Promise.all([
      query(baseQuery, [userId, limit, offset]),
      query(countQuery, [userId])
    ]);

    const reviews = reviewsResult.rows.map(row => new Review(row));
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  // Get all reviews (admin)
  static async findAll(filters = {}) {
    const {
      approved,
      rating,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    if (approved !== undefined) {
      whereConditions.push(`r.is_approved = $${paramCount}`);
      queryParams.push(approved);
      paramCount++;
    }

    if (rating) {
      whereConditions.push(`r.rating = $${paramCount}`);
      queryParams.push(rating);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    queryParams.push(limit, offset);

    const baseQuery = `
      SELECT r.*, 
             u.first_name, u.last_name, u.email as user_email,
             t.title as trip_title, t.slug as trip_slug,
             h.name as hotel_name, h.slug as hotel_slug,
             b.booking_reference
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN trips t ON r.trip_id = t.id
      LEFT JOIN hotels h ON r.hotel_id = h.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM reviews r
      ${whereClause}
    `;

    const [reviewsResult, countResult] = await Promise.all([
      query(baseQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2))
    ]);

    const reviews = reviewsResult.rows.map(row => new Review(row));
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  // Check if user can review (has completed booking)
  static async canUserReview(userId, tripId = null, hotelId = null) {
    let whereCondition = 'b.user_id = $1 AND b.status = $2';
    let queryParams = [userId, 'completed'];
    let paramCount = 3;

    if (tripId) {
      whereCondition += ` AND b.trip_id = $${paramCount}`;
      queryParams.push(tripId);
      paramCount++;
    }

    if (hotelId) {
      whereCondition += ` AND b.hotel_id = $${paramCount}`;
      queryParams.push(hotelId);
      paramCount++;
    }

    // Check if user has completed booking
    const bookingResult = await query(`
      SELECT COUNT(*) as booking_count
      FROM bookings b
      WHERE ${whereCondition}
    `, queryParams);

    const hasBooking = parseInt(bookingResult.rows[0].booking_count) > 0;

    if (!hasBooking) {
      return { canReview: false, reason: 'No completed booking found' };
    }

    // Check if user already reviewed
    let reviewWhereCondition = 'r.user_id = $1';
    let reviewParams = [userId];
    let reviewParamCount = 2;

    if (tripId) {
      reviewWhereCondition += ` AND r.trip_id = $${reviewParamCount}`;
      reviewParams.push(tripId);
      reviewParamCount++;
    }

    if (hotelId) {
      reviewWhereCondition += ` AND r.hotel_id = $${reviewParamCount}`;
      reviewParams.push(hotelId);
      reviewParamCount++;
    }

    const reviewResult = await query(`
      SELECT COUNT(*) as review_count
      FROM reviews r
      WHERE ${reviewWhereCondition}
    `, reviewParams);

    const hasReview = parseInt(reviewResult.rows[0].review_count) > 0;

    if (hasReview) {
      return { canReview: false, reason: 'Already reviewed' };
    }

    return { canReview: true };
  }

  // Update review
  async update(updateData) {
    const allowedFields = ['rating', 'title', 'comment'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(this.id);
    const result = await query(`
      UPDATE reviews 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows[0]) {
      Object.assign(this, result.rows[0]);
    }
    return this;
  }

  // Approve review
  async approve() {
    const result = await query(`
      UPDATE reviews 
      SET is_approved = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [this.id]);

    if (result.rows[0]) {
      Object.assign(this, result.rows[0]);
    }
    return this;
  }

  // Reject review
  async reject() {
    const result = await query(`
      UPDATE reviews 
      SET is_approved = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [this.id]);

    if (result.rows[0]) {
      Object.assign(this, result.rows[0]);
    }
    return this;
  }

  // Delete review
  async delete() {
    await query('DELETE FROM reviews WHERE id = $1', [this.id]);
    return true;
  }

  // Get review statistics
  static async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_reviews,
        COUNT(*) FILTER (WHERE is_approved = true) as approved_reviews,
        COUNT(*) FILTER (WHERE is_approved = false) as pending_reviews,
        AVG(rating) FILTER (WHERE is_approved = true) as average_rating,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_reviews_this_month
      FROM reviews
    `);

    return result.rows[0];
  }

  // Convert to JSON
  toJSON() {
    return {
      ...this,
      rating: parseInt(this.rating),
      user_name: this.first_name && this.last_name ? `${this.first_name} ${this.last_name}` : null
    };
  }
}
