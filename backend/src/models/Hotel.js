import { query } from '../config/database.js';

export class Hotel {
  constructor(data) {
    Object.assign(this, data);
  }

  // Create a new hotel
  static async create(hotelData) {
    const {
      name,
      slug,
      description,
      shortDescription,
      mainImage,
      gallery = [],
      pricePerNight,
      starRating,
      address,
      city,
      categoryId,
      amenities = [],
      roomTypes = {},
      policies = {},
      featured = false,
      metaTitle,
      metaDescription
    } = hotelData;

    const result = await query(`
      INSERT INTO hotels (
        name, slug, description, short_description, main_image, gallery,
        price_per_night, star_rating, address, city, category_id,
        amenities, room_types, policies, featured, meta_title, meta_description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      name, slug, description, shortDescription, mainImage, gallery,
      pricePerNight, starRating, address, city, categoryId,
      amenities, JSON.stringify(roomTypes), JSON.stringify(policies),
      featured, metaTitle, metaDescription
    ]);

    return new Hotel(result.rows[0]);
  }

  // Find hotel by ID
  static async findById(id) {
    const result = await query(`
      SELECT h.*, c.name as category_name, c.slug as category_slug,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as review_count
      FROM hotels h
      LEFT JOIN categories c ON h.category_id = c.id
      LEFT JOIN reviews r ON h.id = r.hotel_id AND r.is_approved = true
      WHERE h.id = $1 AND h.is_active = true
      GROUP BY h.id, c.name, c.slug
    `, [id]);
    
    return result.rows[0] ? new Hotel(result.rows[0]) : null;
  }

  // Find hotel by slug
  static async findBySlug(slug) {
    const result = await query(`
      SELECT h.*, c.name as category_name, c.slug as category_slug,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as review_count
      FROM hotels h
      LEFT JOIN categories c ON h.category_id = c.id
      LEFT JOIN reviews r ON h.id = r.hotel_id AND r.is_approved = true
      WHERE h.slug = $1 AND h.is_active = true
      GROUP BY h.id, c.name, c.slug
    `, [slug]);
    
    return result.rows[0] ? new Hotel(result.rows[0]) : null;
  }

  // Get all hotels with filters and pagination
  static async findAll(filters = {}) {
    const {
      category,
      minPrice,
      maxPrice,
      starRating,
      amenities,
      featured,
      search,
      tags,
      page = 1,
      limit = 12,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    let whereConditions = ['h.is_active = true'];
    let queryParams = [];
    let paramCount = 1;

    // Build WHERE conditions
    if (category) {
      whereConditions.push(`h.category_id = $${paramCount}`);
      queryParams.push(category);
      paramCount++;
    }

    if (minPrice) {
      whereConditions.push(`h.price_per_night >= $${paramCount}`);
      queryParams.push(minPrice);
      paramCount++;
    }

    if (maxPrice) {
      whereConditions.push(`h.price_per_night <= $${paramCount}`);
      queryParams.push(maxPrice);
      paramCount++;
    }

    if (starRating) {
      whereConditions.push(`h.star_rating >= $${paramCount}`);
      queryParams.push(starRating);
      paramCount++;
    }

    if (amenities && amenities.length > 0) {
      whereConditions.push(`h.amenities && $${paramCount}`);
      queryParams.push(amenities);
      paramCount++;
    }

    if (featured !== undefined) {
      whereConditions.push(`h.featured = $${paramCount}`);
      queryParams.push(featured);
      paramCount++;
    }

    if (search) {
      whereConditions.push(`(
        to_tsvector('english', h.name || ' ' || h.description) @@ plainto_tsquery('english', $${paramCount})
        OR h.name ILIKE $${paramCount + 1}
      )`);
      queryParams.push(search, `%${search}%`);
      paramCount += 2;
    }

    if (tags && tags.length > 0) {
      whereConditions.push(`EXISTS (
        SELECT 1 FROM hotel_tags ht 
        JOIN tags tag ON ht.tag_id = tag.id 
        WHERE ht.hotel_id = h.id AND tag.slug = ANY($${paramCount})
      )`);
      queryParams.push(tags);
      paramCount++;
    }

    // Calculate offset
    const offset = (page - 1) * limit;
    queryParams.push(limit, offset);

    // Build the query
    const baseQuery = `
      SELECT h.*, c.name as category_name, c.slug as category_slug,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(DISTINCT r.id) as review_count
      FROM hotels h
      LEFT JOIN categories c ON h.category_id = c.id
      LEFT JOIN reviews r ON h.id = r.hotel_id AND r.is_approved = true
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY h.id, c.name, c.slug
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT h.id) as total
      FROM hotels h
      LEFT JOIN categories c ON h.category_id = c.id
      WHERE ${whereConditions.join(' AND ')}
    `;

    const [hotelsResult, countResult] = await Promise.all([
      query(baseQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const hotels = hotelsResult.rows.map(row => new Hotel(row));
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      hotels,
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

  // Get featured hotels
  static async getFeatured(limit = 6) {
    const result = await query(`
      SELECT h.*, c.name as category_name, c.slug as category_slug,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as review_count
      FROM hotels h
      LEFT JOIN categories c ON h.category_id = c.id
      LEFT JOIN reviews r ON h.id = r.hotel_id AND r.is_approved = true
      WHERE h.is_active = true AND h.featured = true
      GROUP BY h.id, c.name, c.slug
      ORDER BY h.created_at DESC
      LIMIT $1
    `, [limit]);

    return result.rows.map(row => new Hotel(row));
  }

  // Update hotel
  async update(updateData) {
    const allowedFields = [
      'name', 'slug', 'description', 'short_description', 'main_image', 'gallery',
      'price_per_night', 'star_rating', 'address', 'city', 'category_id',
      'amenities', 'room_types', 'policies', 'featured', 'meta_title', 
      'meta_description', 'is_active'
    ];

    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        if (key === 'room_types' || key === 'policies') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(this.id);
    const result = await query(`
      UPDATE hotels 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows[0]) {
      Object.assign(this, result.rows[0]);
    }
    return this;
  }

  // Delete hotel (soft delete)
  async delete() {
    await query('UPDATE hotels SET is_active = false WHERE id = $1', [this.id]);
    this.is_active = false;
    return this;
  }

  // Get hotel statistics
  static async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_hotels,
        COUNT(*) FILTER (WHERE is_active = true) as active_hotels,
        COUNT(*) FILTER (WHERE featured = true) as featured_hotels,
        AVG(price_per_night) as average_price,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_hotels_this_month
      FROM hotels
    `);

    return result.rows[0];
  }

  // Convert to JSON
  toJSON() {
    return {
      ...this,
      average_rating: parseFloat(this.average_rating) || 0,
      review_count: parseInt(this.review_count) || 0,
      room_types: typeof this.room_types === 'string' ? JSON.parse(this.room_types) : this.room_types,
      policies: typeof this.policies === 'string' ? JSON.parse(this.policies) : this.policies
    };
  }
}
