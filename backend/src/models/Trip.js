import { query } from '../config/database.js';

export class Trip {
  constructor(data) {
    Object.assign(this, data);
  }

  // Create a new trip
  static async create(tripData) {
    const {
      title,
      slug,
      description,
      shortDescription,
      mainImage,
      gallery = [],
      price,
      durationDays,
      maxParticipants,
      difficultyLevel,
      categoryId,
      itinerary = {},
      includedServices = [],
      excludedServices = [],
      departureDates = [],
      featured = false,
      metaTitle,
      metaDescription
    } = tripData;

    const result = await query(`
      INSERT INTO trips (
        title, slug, description, short_description, main_image, gallery,
        price, duration_days, max_participants, difficulty_level, category_id,
        itinerary, included_services, excluded_services, departure_dates,
        featured, meta_title, meta_description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `, [
      title, slug, description, shortDescription, mainImage, gallery,
      price, durationDays, maxParticipants, difficultyLevel, categoryId,
      JSON.stringify(itinerary), includedServices, excludedServices, departureDates,
      featured, metaTitle, metaDescription
    ]);

    return new Trip(result.rows[0]);
  }

  // Find trip by ID
  static async findById(id) {
    const result = await query(`
      SELECT t.*, c.name as category_name, c.slug as category_slug,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as review_count
      FROM trips t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN reviews r ON t.id = r.trip_id AND r.is_approved = true
      WHERE t.id = $1 AND t.is_active = true
      GROUP BY t.id, c.name, c.slug
    `, [id]);
    
    return result.rows[0] ? new Trip(result.rows[0]) : null;
  }

  // Find trip by slug
  static async findBySlug(slug) {
    const result = await query(`
      SELECT t.*, c.name as category_name, c.slug as category_slug,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as review_count
      FROM trips t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN reviews r ON t.id = r.trip_id AND r.is_approved = true
      WHERE t.slug = $1 AND t.is_active = true
      GROUP BY t.id, c.name, c.slug
    `, [slug]);
    
    return result.rows[0] ? new Trip(result.rows[0]) : null;
  }

  // Get all trips with filters and pagination
  static async findAll(filters = {}) {
    const {
      category,
      minPrice,
      maxPrice,
      difficulty,
      featured,
      search,
      tags,
      page = 1,
      limit = 12,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    let whereConditions = ['t.is_active = true'];
    let queryParams = [];
    let paramCount = 1;

    // Build WHERE conditions
    if (category) {
      whereConditions.push(`t.category_id = $${paramCount}`);
      queryParams.push(category);
      paramCount++;
    }

    if (minPrice) {
      whereConditions.push(`t.price >= $${paramCount}`);
      queryParams.push(minPrice);
      paramCount++;
    }

    if (maxPrice) {
      whereConditions.push(`t.price <= $${paramCount}`);
      queryParams.push(maxPrice);
      paramCount++;
    }

    if (difficulty) {
      whereConditions.push(`t.difficulty_level = $${paramCount}`);
      queryParams.push(difficulty);
      paramCount++;
    }

    if (featured !== undefined) {
      whereConditions.push(`t.featured = $${paramCount}`);
      queryParams.push(featured);
      paramCount++;
    }

    if (search) {
      whereConditions.push(`(
        to_tsvector('english', t.title || ' ' || t.description) @@ plainto_tsquery('english', $${paramCount})
        OR t.title ILIKE $${paramCount + 1}
      )`);
      queryParams.push(search, `%${search}%`);
      paramCount += 2;
    }

    if (tags && tags.length > 0) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM trip_tags tt 
        JOIN tags tag ON tt.tag_id = tag.id 
        WHERE tt.trip_id = t.id AND tag.slug = ANY($${paramCount})
      )`);
      queryParams.push(tags);
      paramCount++;
    }

    // Calculate offset
    const offset = (page - 1) * limit;
    queryParams.push(limit, offset);

    // Build the query
    const baseQuery = `
      SELECT t.*, c.name as category_name, c.slug as category_slug,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(DISTINCT r.id) as review_count
      FROM trips t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN reviews r ON t.id = r.trip_id AND r.is_approved = true
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY t.id, c.name, c.slug
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT t.id) as total
      FROM trips t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE ${whereConditions.join(' AND ')}
    `;

    const [tripsResult, countResult] = await Promise.all([
      query(baseQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const trips = tripsResult.rows.map(row => new Trip(row));
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      trips,
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

  // Get featured trips
  static async getFeatured(limit = 6) {
    const result = await query(`
      SELECT t.*, c.name as category_name, c.slug as category_slug,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as review_count
      FROM trips t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN reviews r ON t.id = r.trip_id AND r.is_approved = true
      WHERE t.is_active = true AND t.featured = true
      GROUP BY t.id, c.name, c.slug
      ORDER BY t.created_at DESC
      LIMIT $1
    `, [limit]);

    return result.rows.map(row => new Trip(row));
  }

  // Update trip
  async update(updateData) {
    const allowedFields = [
      'title', 'slug', 'description', 'short_description', 'main_image', 'gallery',
      'price', 'duration_days', 'max_participants', 'difficulty_level', 'category_id',
      'itinerary', 'included_services', 'excluded_services', 'departure_dates',
      'featured', 'meta_title', 'meta_description', 'is_active'
    ];

    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(key === 'itinerary' ? JSON.stringify(value) : value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(this.id);
    const result = await query(`
      UPDATE trips 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows[0]) {
      Object.assign(this, result.rows[0]);
    }
    return this;
  }

  // Delete trip (soft delete)
  async delete() {
    await query('UPDATE trips SET is_active = false WHERE id = $1', [this.id]);
    this.is_active = false;
    return this;
  }

  // Get trip statistics
  static async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_trips,
        COUNT(*) FILTER (WHERE is_active = true) as active_trips,
        COUNT(*) FILTER (WHERE featured = true) as featured_trips,
        AVG(price) as average_price,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_trips_this_month
      FROM trips
    `);

    return result.rows[0];
  }

  // Convert to JSON
  toJSON() {
    return {
      ...this,
      average_rating: parseFloat(this.average_rating) || 0,
      review_count: parseInt(this.review_count) || 0
    };
  }
}
