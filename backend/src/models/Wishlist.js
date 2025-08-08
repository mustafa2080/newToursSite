import { query } from '../config/database.js';

export class Wishlist {
  constructor(data) {
    Object.assign(this, data);
  }

  // Add item to wishlist
  static async addItem(userId, tripId = null, hotelId = null) {
    if (!tripId && !hotelId) {
      throw new Error('Either tripId or hotelId must be provided');
    }

    if (tripId && hotelId) {
      throw new Error('Cannot add both trip and hotel in the same wishlist item');
    }

    try {
      const result = await query(`
        INSERT INTO wishlist (user_id, trip_id, hotel_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, trip_id) DO NOTHING
        ON CONFLICT (user_id, hotel_id) DO NOTHING
        RETURNING *
      `, [userId, tripId, hotelId]);

      return result.rows[0] ? new Wishlist(result.rows[0]) : null;
    } catch (error) {
      console.error('Error adding item to wishlist:', error);
      throw error;
    }
  }

  // Remove item from wishlist
  static async removeItem(userId, tripId = null, hotelId = null) {
    if (!tripId && !hotelId) {
      throw new Error('Either tripId or hotelId must be provided');
    }

    let whereCondition = 'user_id = $1';
    let queryParams = [userId];
    let paramCount = 2;

    if (tripId) {
      whereCondition += ` AND trip_id = $${paramCount}`;
      queryParams.push(tripId);
    } else if (hotelId) {
      whereCondition += ` AND hotel_id = $${paramCount}`;
      queryParams.push(hotelId);
    }

    const result = await query(`
      DELETE FROM wishlist
      WHERE ${whereCondition}
      RETURNING *
    `, queryParams);

    return result.rows[0] ? new Wishlist(result.rows[0]) : null;
  }

  // Check if item is in wishlist
  static async isInWishlist(userId, tripId = null, hotelId = null) {
    if (!tripId && !hotelId) {
      return false;
    }

    let whereCondition = 'user_id = $1';
    let queryParams = [userId];
    let paramCount = 2;

    if (tripId) {
      whereCondition += ` AND trip_id = $${paramCount}`;
      queryParams.push(tripId);
    } else if (hotelId) {
      whereCondition += ` AND hotel_id = $${paramCount}`;
      queryParams.push(hotelId);
    }

    const result = await query(`
      SELECT COUNT(*) as count
      FROM wishlist
      WHERE ${whereCondition}
    `, queryParams);

    return parseInt(result.rows[0].count) > 0;
  }

  // Get user's wishlist
  static async getUserWishlist(userId, filters = {}) {
    const {
      type, // 'trip' or 'hotel'
      page = 1,
      limit = 12,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    let whereConditions = ['w.user_id = $1'];
    let queryParams = [userId];
    let paramCount = 2;

    if (type === 'trip') {
      whereConditions.push('w.trip_id IS NOT NULL');
    } else if (type === 'hotel') {
      whereConditions.push('w.hotel_id IS NOT NULL');
    }

    const offset = (page - 1) * limit;
    queryParams.push(limit, offset);

    const baseQuery = `
      SELECT w.*,
             t.title as trip_title, t.slug as trip_slug, t.main_image as trip_image,
             t.price as trip_price, t.short_description as trip_description,
             h.name as hotel_name, h.slug as hotel_slug, h.main_image as hotel_image,
             h.price_per_night as hotel_price, h.short_description as hotel_description,
             c.name as category_name, c.slug as category_slug,
             COALESCE(AVG(rt.rating), 0) as trip_rating,
             COALESCE(AVG(rh.rating), 0) as hotel_rating,
             COUNT(DISTINCT rt.id) as trip_review_count,
             COUNT(DISTINCT rh.id) as hotel_review_count
      FROM wishlist w
      LEFT JOIN trips t ON w.trip_id = t.id AND t.is_active = true
      LEFT JOIN hotels h ON w.hotel_id = h.id AND h.is_active = true
      LEFT JOIN categories c ON (t.category_id = c.id OR h.category_id = c.id)
      LEFT JOIN reviews rt ON t.id = rt.trip_id AND rt.is_approved = true
      LEFT JOIN reviews rh ON h.id = rh.hotel_id AND rh.is_approved = true
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY w.id, t.id, h.id, c.id
      ORDER BY w.${sortBy} ${sortOrder}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM wishlist w
      LEFT JOIN trips t ON w.trip_id = t.id AND t.is_active = true
      LEFT JOIN hotels h ON w.hotel_id = h.id AND h.is_active = true
      WHERE ${whereConditions.join(' AND ')}
    `;

    const [wishlistResult, countResult] = await Promise.all([
      query(baseQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2))
    ]);

    const wishlistItems = wishlistResult.rows.map(row => new Wishlist(row));
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      wishlistItems,
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

  // Get wishlist item by ID
  static async findById(id) {
    const result = await query(`
      SELECT w.*,
             t.title as trip_title, t.slug as trip_slug, t.main_image as trip_image,
             t.price as trip_price, t.short_description as trip_description,
             h.name as hotel_name, h.slug as hotel_slug, h.main_image as hotel_image,
             h.price_per_night as hotel_price, h.short_description as hotel_description,
             c.name as category_name, c.slug as category_slug
      FROM wishlist w
      LEFT JOIN trips t ON w.trip_id = t.id
      LEFT JOIN hotels h ON w.hotel_id = h.id
      LEFT JOIN categories c ON (t.category_id = c.id OR h.category_id = c.id)
      WHERE w.id = $1
    `, [id]);

    return result.rows[0] ? new Wishlist(result.rows[0]) : null;
  }

  // Get wishlist statistics for user
  static async getUserStats(userId) {
    const result = await query(`
      SELECT 
        COUNT(*) as total_items,
        COUNT(*) FILTER (WHERE trip_id IS NOT NULL) as trip_items,
        COUNT(*) FILTER (WHERE hotel_id IS NOT NULL) as hotel_items,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as recent_items
      FROM wishlist
      WHERE user_id = $1
    `, [userId]);

    return result.rows[0];
  }

  // Get popular wishlist items (most saved)
  static async getPopularItems(type = null, limit = 10) {
    let whereCondition = '';
    let queryParams = [];
    let paramCount = 1;

    if (type === 'trip') {
      whereCondition = 'WHERE w.trip_id IS NOT NULL';
    } else if (type === 'hotel') {
      whereCondition = 'WHERE w.hotel_id IS NOT NULL';
    }

    queryParams.push(limit);

    const result = await query(`
      SELECT 
        COALESCE(t.id, h.id) as item_id,
        COALESCE(t.title, h.name) as item_name,
        COALESCE(t.slug, h.slug) as item_slug,
        COALESCE(t.main_image, h.main_image) as item_image,
        CASE WHEN t.id IS NOT NULL THEN 'trip' ELSE 'hotel' END as item_type,
        COUNT(w.id) as wishlist_count,
        c.name as category_name
      FROM wishlist w
      LEFT JOIN trips t ON w.trip_id = t.id AND t.is_active = true
      LEFT JOIN hotels h ON w.hotel_id = h.id AND h.is_active = true
      LEFT JOIN categories c ON (t.category_id = c.id OR h.category_id = c.id)
      ${whereCondition}
      GROUP BY t.id, h.id, t.title, h.name, t.slug, h.slug, t.main_image, h.main_image, c.name
      HAVING COUNT(w.id) > 0
      ORDER BY wishlist_count DESC, item_name ASC
      LIMIT $${paramCount}
    `, queryParams);

    return result.rows;
  }

  // Clear user's wishlist
  static async clearUserWishlist(userId) {
    const result = await query(`
      DELETE FROM wishlist
      WHERE user_id = $1
      RETURNING COUNT(*) as deleted_count
    `, [userId]);

    return parseInt(result.rows[0]?.deleted_count) || 0;
  }

  // Get wishlist statistics (admin)
  static async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_wishlist_items,
        COUNT(DISTINCT user_id) as users_with_wishlist,
        COUNT(*) FILTER (WHERE trip_id IS NOT NULL) as trip_wishlist_items,
        COUNT(*) FILTER (WHERE hotel_id IS NOT NULL) as hotel_wishlist_items,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_wishlist_items_this_month
      FROM wishlist
    `);

    return result.rows[0];
  }

  // Delete wishlist item
  async delete() {
    await query('DELETE FROM wishlist WHERE id = $1', [this.id]);
    return true;
  }

  // Convert to JSON
  toJSON() {
    const baseData = {
      id: this.id,
      user_id: this.user_id,
      created_at: this.created_at
    };

    if (this.trip_id) {
      return {
        ...baseData,
        type: 'trip',
        item: {
          id: this.trip_id,
          title: this.trip_title,
          slug: this.trip_slug,
          image: this.trip_image,
          price: parseFloat(this.trip_price),
          description: this.trip_description,
          category: {
            name: this.category_name,
            slug: this.category_slug
          },
          rating: parseFloat(this.trip_rating) || 0,
          review_count: parseInt(this.trip_review_count) || 0
        }
      };
    } else if (this.hotel_id) {
      return {
        ...baseData,
        type: 'hotel',
        item: {
          id: this.hotel_id,
          name: this.hotel_name,
          slug: this.hotel_slug,
          image: this.hotel_image,
          price: parseFloat(this.hotel_price),
          description: this.hotel_description,
          category: {
            name: this.category_name,
            slug: this.category_slug
          },
          rating: parseFloat(this.hotel_rating) || 0,
          review_count: parseInt(this.hotel_review_count) || 0
        }
      };
    }

    return baseData;
  }
}
