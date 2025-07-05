import { query } from '../config/database.js';

export class Tag {
  constructor(data) {
    Object.assign(this, data);
  }

  // Create a new tag
  static async create(tagData) {
    const {
      name,
      slug,
      type,
      description,
      color
    } = tagData;

    const result = await query(`
      INSERT INTO tags (name, slug, type, description, color)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, slug, type, description, color]);

    return new Tag(result.rows[0]);
  }

  // Find tag by ID
  static async findById(id) {
    const result = await query(`
      SELECT t.*,
             COUNT(DISTINCT tt.trip_id) as trips_count,
             COUNT(DISTINCT ht.hotel_id) as hotels_count
      FROM tags t
      LEFT JOIN trip_tags tt ON t.id = tt.tag_id
      LEFT JOIN hotel_tags ht ON t.id = ht.tag_id
      WHERE t.id = $1 AND t.is_active = true
      GROUP BY t.id
    `, [id]);
    
    return result.rows[0] ? new Tag(result.rows[0]) : null;
  }

  // Find tag by slug
  static async findBySlug(slug) {
    const result = await query(`
      SELECT t.*,
             COUNT(DISTINCT tt.trip_id) as trips_count,
             COUNT(DISTINCT ht.hotel_id) as hotels_count
      FROM tags t
      LEFT JOIN trip_tags tt ON t.id = tt.tag_id
      LEFT JOIN hotel_tags ht ON t.id = ht.tag_id
      WHERE t.slug = $1 AND t.is_active = true
      GROUP BY t.id
    `, [slug]);
    
    return result.rows[0] ? new Tag(result.rows[0]) : null;
  }

  // Get all tags
  static async findAll(filters = {}) {
    const {
      type,
      includeInactive = false,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = filters;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    if (!includeInactive) {
      whereConditions.push('t.is_active = true');
    }

    if (type) {
      whereConditions.push(`t.type = $${paramCount}`);
      queryParams.push(type);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await query(`
      SELECT t.*,
             COUNT(DISTINCT tt.trip_id) as trips_count,
             COUNT(DISTINCT ht.hotel_id) as hotels_count
      FROM tags t
      LEFT JOIN trip_tags tt ON t.id = tt.tag_id
      LEFT JOIN hotel_tags ht ON t.id = ht.tag_id
      ${whereClause}
      GROUP BY t.id
      ORDER BY ${sortBy} ${sortOrder}
    `, queryParams);

    return result.rows.map(row => new Tag(row));
  }

  // Get tags by type
  static async findByType(type) {
    const result = await query(`
      SELECT t.*,
             COUNT(DISTINCT tt.trip_id) as trips_count,
             COUNT(DISTINCT ht.hotel_id) as hotels_count
      FROM tags t
      LEFT JOIN trip_tags tt ON t.id = tt.tag_id
      LEFT JOIN hotel_tags ht ON t.id = ht.tag_id
      WHERE t.type = $1 AND t.is_active = true
      GROUP BY t.id
      ORDER BY t.name ASC
    `, [type]);

    return result.rows.map(row => new Tag(row));
  }

  // Get popular tags (by usage count)
  static async getPopular(limit = 20) {
    const result = await query(`
      SELECT t.*,
             COUNT(DISTINCT tt.trip_id) as trips_count,
             COUNT(DISTINCT ht.hotel_id) as hotels_count,
             (COUNT(DISTINCT tt.trip_id) + COUNT(DISTINCT ht.hotel_id)) as total_usage
      FROM tags t
      LEFT JOIN trip_tags tt ON t.id = tt.tag_id
      LEFT JOIN hotel_tags ht ON t.id = ht.tag_id
      WHERE t.is_active = true
      GROUP BY t.id
      HAVING COUNT(DISTINCT tt.trip_id) > 0 OR COUNT(DISTINCT ht.hotel_id) > 0
      ORDER BY total_usage DESC, t.name ASC
      LIMIT $1
    `, [limit]);

    return result.rows.map(row => new Tag(row));
  }

  // Search tags
  static async search(searchTerm, limit = 10) {
    const result = await query(`
      SELECT t.*,
             COUNT(DISTINCT tt.trip_id) as trips_count,
             COUNT(DISTINCT ht.hotel_id) as hotels_count
      FROM tags t
      LEFT JOIN trip_tags tt ON t.id = tt.tag_id
      LEFT JOIN hotel_tags ht ON t.id = ht.tag_id
      WHERE t.is_active = true 
      AND (
        t.name ILIKE $1
        OR t.description ILIKE $1
      )
      GROUP BY t.id
      ORDER BY t.name ASC
      LIMIT $2
    `, [`%${searchTerm}%`, limit]);

    return result.rows.map(row => new Tag(row));
  }

  // Get tags for a trip
  static async findByTripId(tripId) {
    const result = await query(`
      SELECT t.*
      FROM tags t
      JOIN trip_tags tt ON t.id = tt.tag_id
      WHERE tt.trip_id = $1 AND t.is_active = true
      ORDER BY t.type, t.name
    `, [tripId]);

    return result.rows.map(row => new Tag(row));
  }

  // Get tags for a hotel
  static async findByHotelId(hotelId) {
    const result = await query(`
      SELECT t.*
      FROM tags t
      JOIN hotel_tags ht ON t.id = ht.tag_id
      WHERE ht.hotel_id = $1 AND t.is_active = true
      ORDER BY t.type, t.name
    `, [hotelId]);

    return result.rows.map(row => new Tag(row));
  }

  // Add tag to trip
  static async addToTrip(tagId, tripId) {
    try {
      await query(`
        INSERT INTO trip_tags (tag_id, trip_id)
        VALUES ($1, $2)
        ON CONFLICT (tag_id, trip_id) DO NOTHING
      `, [tagId, tripId]);
      return true;
    } catch (error) {
      console.error('Error adding tag to trip:', error);
      return false;
    }
  }

  // Remove tag from trip
  static async removeFromTrip(tagId, tripId) {
    try {
      await query(`
        DELETE FROM trip_tags
        WHERE tag_id = $1 AND trip_id = $2
      `, [tagId, tripId]);
      return true;
    } catch (error) {
      console.error('Error removing tag from trip:', error);
      return false;
    }
  }

  // Add tag to hotel
  static async addToHotel(tagId, hotelId) {
    try {
      await query(`
        INSERT INTO hotel_tags (tag_id, hotel_id)
        VALUES ($1, $2)
        ON CONFLICT (tag_id, hotel_id) DO NOTHING
      `, [tagId, hotelId]);
      return true;
    } catch (error) {
      console.error('Error adding tag to hotel:', error);
      return false;
    }
  }

  // Remove tag from hotel
  static async removeFromHotel(tagId, hotelId) {
    try {
      await query(`
        DELETE FROM hotel_tags
        WHERE tag_id = $1 AND hotel_id = $2
      `, [tagId, hotelId]);
      return true;
    } catch (error) {
      console.error('Error removing tag from hotel:', error);
      return false;
    }
  }

  // Update tag
  async update(updateData) {
    const allowedFields = ['name', 'slug', 'type', 'description', 'color', 'is_active'];
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
      UPDATE tags 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows[0]) {
      Object.assign(this, result.rows[0]);
    }
    return this;
  }

  // Delete tag (soft delete)
  async delete() {
    // Check if tag is being used
    const result = await query(`
      SELECT 
        COUNT(DISTINCT tt.trip_id) as trips_count,
        COUNT(DISTINCT ht.hotel_id) as hotels_count
      FROM tags t
      LEFT JOIN trip_tags tt ON t.id = tt.tag_id
      LEFT JOIN hotel_tags ht ON t.id = ht.tag_id
      WHERE t.id = $1
      GROUP BY t.id
    `, [this.id]);

    const counts = result.rows[0];
    if (counts && (parseInt(counts.trips_count) > 0 || parseInt(counts.hotels_count) > 0)) {
      throw new Error('Cannot delete tag that is currently in use');
    }

    await query('UPDATE tags SET is_active = false WHERE id = $1', [this.id]);
    this.is_active = false;
    return this;
  }

  // Hard delete tag (admin only)
  async hardDelete() {
    // Remove all associations first
    await query('DELETE FROM trip_tags WHERE tag_id = $1', [this.id]);
    await query('DELETE FROM hotel_tags WHERE tag_id = $1', [this.id]);
    
    // Delete the tag
    await query('DELETE FROM tags WHERE id = $1', [this.id]);
    return true;
  }

  // Get tag statistics
  static async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_tags,
        COUNT(*) FILTER (WHERE is_active = true) as active_tags,
        COUNT(*) FILTER (WHERE type = 'location') as location_tags,
        COUNT(*) FILTER (WHERE type = 'feature') as feature_tags,
        COUNT(*) FILTER (WHERE type = 'activity') as activity_tags,
        COUNT(*) FILTER (WHERE type = 'amenity') as amenity_tags,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_tags_this_month
      FROM tags
    `);

    return result.rows[0];
  }

  // Get tag usage statistics
  async getUsageStats() {
    const result = await query(`
      SELECT 
        COUNT(DISTINCT tt.trip_id) as trips_count,
        COUNT(DISTINCT ht.hotel_id) as hotels_count,
        (COUNT(DISTINCT tt.trip_id) + COUNT(DISTINCT ht.hotel_id)) as total_usage
      FROM tags t
      LEFT JOIN trip_tags tt ON t.id = tt.tag_id
      LEFT JOIN hotel_tags ht ON t.id = ht.tag_id
      WHERE t.id = $1
      GROUP BY t.id
    `, [this.id]);

    return result.rows[0] || { trips_count: 0, hotels_count: 0, total_usage: 0 };
  }

  // Convert to JSON
  toJSON() {
    return {
      ...this,
      trips_count: parseInt(this.trips_count) || 0,
      hotels_count: parseInt(this.hotels_count) || 0,
      total_usage: parseInt(this.total_usage) || 0
    };
  }
}
