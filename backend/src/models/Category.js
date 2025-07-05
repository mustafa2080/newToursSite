import { query } from '../config/database.js';

export class Category {
  constructor(data) {
    Object.assign(this, data);
  }

  // Create a new category
  static async create(categoryData) {
    const {
      name,
      slug,
      description,
      image
    } = categoryData;

    const result = await query(`
      INSERT INTO categories (name, slug, description, image)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, slug, description, image]);

    return new Category(result.rows[0]);
  }

  // Find category by ID
  static async findById(id) {
    const result = await query(`
      SELECT c.*,
             COUNT(DISTINCT t.id) as trips_count,
             COUNT(DISTINCT h.id) as hotels_count
      FROM categories c
      LEFT JOIN trips t ON c.id = t.category_id AND t.is_active = true
      LEFT JOIN hotels h ON c.id = h.category_id AND h.is_active = true
      WHERE c.id = $1 AND c.is_active = true
      GROUP BY c.id
    `, [id]);
    
    return result.rows[0] ? new Category(result.rows[0]) : null;
  }

  // Find category by slug
  static async findBySlug(slug) {
    const result = await query(`
      SELECT c.*,
             COUNT(DISTINCT t.id) as trips_count,
             COUNT(DISTINCT h.id) as hotels_count
      FROM categories c
      LEFT JOIN trips t ON c.id = t.category_id AND t.is_active = true
      LEFT JOIN hotels h ON c.id = h.category_id AND h.is_active = true
      WHERE c.slug = $1 AND c.is_active = true
      GROUP BY c.id
    `, [slug]);
    
    return result.rows[0] ? new Category(result.rows[0]) : null;
  }

  // Get all categories
  static async findAll(includeInactive = false) {
    const whereClause = includeInactive ? '' : 'WHERE c.is_active = true';
    
    const result = await query(`
      SELECT c.*,
             COUNT(DISTINCT t.id) as trips_count,
             COUNT(DISTINCT h.id) as hotels_count
      FROM categories c
      LEFT JOIN trips t ON c.id = t.category_id AND t.is_active = true
      LEFT JOIN hotels h ON c.id = h.category_id AND h.is_active = true
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    return result.rows.map(row => new Category(row));
  }

  // Get categories with content counts
  static async getWithCounts() {
    const result = await query(`
      SELECT c.*,
             COUNT(DISTINCT t.id) as trips_count,
             COUNT(DISTINCT h.id) as hotels_count,
             COUNT(DISTINCT b.id) as bookings_count,
             COALESCE(AVG(tr.rating), 0) as average_rating
      FROM categories c
      LEFT JOIN trips t ON c.id = t.category_id AND t.is_active = true
      LEFT JOIN hotels h ON c.id = h.category_id AND h.is_active = true
      LEFT JOIN bookings b ON (b.trip_id = t.id OR b.hotel_id = h.id) AND b.status = 'confirmed'
      LEFT JOIN reviews tr ON (tr.trip_id = t.id OR tr.hotel_id = h.id) AND tr.is_approved = true
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    return result.rows.map(row => new Category(row));
  }

  // Get popular categories (by booking count)
  static async getPopular(limit = 6) {
    const result = await query(`
      SELECT c.*,
             COUNT(DISTINCT t.id) as trips_count,
             COUNT(DISTINCT h.id) as hotels_count,
             COUNT(DISTINCT b.id) as bookings_count
      FROM categories c
      LEFT JOIN trips t ON c.id = t.category_id AND t.is_active = true
      LEFT JOIN hotels h ON c.id = h.category_id AND h.is_active = true
      LEFT JOIN bookings b ON (b.trip_id = t.id OR b.hotel_id = h.id) AND b.status = 'confirmed'
      WHERE c.is_active = true
      GROUP BY c.id
      HAVING COUNT(DISTINCT t.id) > 0 OR COUNT(DISTINCT h.id) > 0
      ORDER BY bookings_count DESC, c.name ASC
      LIMIT $1
    `, [limit]);

    return result.rows.map(row => new Category(row));
  }

  // Update category
  async update(updateData) {
    const allowedFields = ['name', 'slug', 'description', 'image', 'is_active'];
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
      UPDATE categories 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows[0]) {
      Object.assign(this, result.rows[0]);
    }
    return this;
  }

  // Delete category (soft delete)
  async delete() {
    // Check if category has associated trips or hotels
    const result = await query(`
      SELECT 
        COUNT(DISTINCT t.id) as trips_count,
        COUNT(DISTINCT h.id) as hotels_count
      FROM categories c
      LEFT JOIN trips t ON c.id = t.category_id AND t.is_active = true
      LEFT JOIN hotels h ON c.id = h.category_id AND h.is_active = true
      WHERE c.id = $1
      GROUP BY c.id
    `, [this.id]);

    const counts = result.rows[0];
    if (counts && (parseInt(counts.trips_count) > 0 || parseInt(counts.hotels_count) > 0)) {
      throw new Error('Cannot delete category with associated trips or hotels');
    }

    await query('UPDATE categories SET is_active = false WHERE id = $1', [this.id]);
    this.is_active = false;
    return this;
  }

  // Get category statistics
  static async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_categories,
        COUNT(*) FILTER (WHERE is_active = true) as active_categories,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_categories_this_month
      FROM categories
    `);

    return result.rows[0];
  }

  // Search categories
  static async search(searchTerm, limit = 10) {
    const result = await query(`
      SELECT c.*,
             COUNT(DISTINCT t.id) as trips_count,
             COUNT(DISTINCT h.id) as hotels_count
      FROM categories c
      LEFT JOIN trips t ON c.id = t.category_id AND t.is_active = true
      LEFT JOIN hotels h ON c.id = h.category_id AND h.is_active = true
      WHERE c.is_active = true 
      AND (
        to_tsvector('english', c.name || ' ' || COALESCE(c.description, '')) @@ plainto_tsquery('english', $1)
        OR c.name ILIKE $2
      )
      GROUP BY c.id
      ORDER BY c.name ASC
      LIMIT $3
    `, [searchTerm, `%${searchTerm}%`, limit]);

    return result.rows.map(row => new Category(row));
  }

  // Get category with featured content
  async getFeaturedContent(limit = 6) {
    const result = await query(`
      (
        SELECT 'trip' as type, t.id, t.title as name, t.slug, t.main_image, 
               t.price, t.short_description, COALESCE(AVG(r.rating), 0) as rating
        FROM trips t
        LEFT JOIN reviews r ON t.id = r.trip_id AND r.is_approved = true
        WHERE t.category_id = $1 AND t.is_active = true AND t.featured = true
        GROUP BY t.id
        ORDER BY t.created_at DESC
        LIMIT $2
      )
      UNION ALL
      (
        SELECT 'hotel' as type, h.id, h.name, h.slug, h.main_image,
               h.price_per_night as price, h.short_description, COALESCE(AVG(r.rating), 0) as rating
        FROM hotels h
        LEFT JOIN reviews r ON h.id = r.hotel_id AND r.is_approved = true
        WHERE h.category_id = $1 AND h.is_active = true AND h.featured = true
        GROUP BY h.id
        ORDER BY h.created_at DESC
        LIMIT $2
      )
      ORDER BY type, name
    `, [this.id, Math.ceil(limit / 2)]);

    return result.rows;
  }

  // Convert to JSON
  toJSON() {
    return {
      ...this,
      trips_count: parseInt(this.trips_count) || 0,
      hotels_count: parseInt(this.hotels_count) || 0,
      bookings_count: parseInt(this.bookings_count) || 0,
      average_rating: parseFloat(this.average_rating) || 0
    };
  }
}
