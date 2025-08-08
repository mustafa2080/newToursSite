import { query } from '../config/database.js';

export class Booking {
  constructor(data) {
    Object.assign(this, data);
  }

  // Create a new booking
  static async create(bookingData) {
    const {
      userId,
      tripId,
      hotelId,
      bookingType,
      guestName,
      guestEmail,
      guestPhone,
      numberOfGuests,
      departureDate,
      checkInDate,
      checkOutDate,
      numberOfNights,
      roomType,
      basePrice,
      totalPrice,
      specialRequests
    } = bookingData;

    const result = await query(`
      INSERT INTO bookings (
        user_id, trip_id, hotel_id, booking_type, guest_name, guest_email, guest_phone,
        number_of_guests, departure_date, check_in_date, check_out_date, 
        number_of_nights, room_type, base_price, total_price, special_requests
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      userId, tripId, hotelId, bookingType, guestName, guestEmail, guestPhone,
      numberOfGuests, departureDate, checkInDate, checkOutDate,
      numberOfNights, roomType, basePrice, totalPrice, specialRequests
    ]);

    return new Booking(result.rows[0]);
  }

  // Find booking by ID
  static async findById(id) {
    const result = await query(`
      SELECT b.*, 
             u.first_name, u.last_name, u.email as user_email,
             t.title as trip_title, t.slug as trip_slug, t.main_image as trip_image,
             h.name as hotel_name, h.slug as hotel_slug, h.main_image as hotel_image,
             c.name as category_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN trips t ON b.trip_id = t.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN categories c ON (t.category_id = c.id OR h.category_id = c.id)
      WHERE b.id = $1
    `, [id]);
    
    return result.rows[0] ? new Booking(result.rows[0]) : null;
  }

  // Find booking by reference
  static async findByReference(reference) {
    const result = await query(`
      SELECT b.*, 
             u.first_name, u.last_name, u.email as user_email,
             t.title as trip_title, t.slug as trip_slug, t.main_image as trip_image,
             h.name as hotel_name, h.slug as hotel_slug, h.main_image as hotel_image,
             c.name as category_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN trips t ON b.trip_id = t.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN categories c ON (t.category_id = c.id OR h.category_id = c.id)
      WHERE b.booking_reference = $1
    `, [reference]);
    
    return result.rows[0] ? new Booking(result.rows[0]) : null;
  }

  // Get user bookings
  static async findByUserId(userId, filters = {}) {
    const {
      status,
      bookingType,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    let whereConditions = ['b.user_id = $1'];
    let queryParams = [userId];
    let paramCount = 2;

    if (status) {
      whereConditions.push(`b.status = $${paramCount}`);
      queryParams.push(status);
      paramCount++;
    }

    if (bookingType) {
      whereConditions.push(`b.booking_type = $${paramCount}`);
      queryParams.push(bookingType);
      paramCount++;
    }

    const offset = (page - 1) * limit;
    queryParams.push(limit, offset);

    const baseQuery = `
      SELECT b.*, 
             t.title as trip_title, t.slug as trip_slug, t.main_image as trip_image,
             h.name as hotel_name, h.slug as hotel_slug, h.main_image as hotel_image,
             c.name as category_name
      FROM bookings b
      LEFT JOIN trips t ON b.trip_id = t.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN categories c ON (t.category_id = c.id OR h.category_id = c.id)
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      WHERE ${whereConditions.join(' AND ')}
    `;

    const [bookingsResult, countResult] = await Promise.all([
      query(baseQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2))
    ]);

    const bookings = bookingsResult.rows.map(row => new Booking(row));
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      bookings,
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

  // Get all bookings (admin)
  static async findAll(filters = {}) {
    const {
      status,
      bookingType,
      userId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`b.status = $${paramCount}`);
      queryParams.push(status);
      paramCount++;
    }

    if (bookingType) {
      whereConditions.push(`b.booking_type = $${paramCount}`);
      queryParams.push(bookingType);
      paramCount++;
    }

    if (userId) {
      whereConditions.push(`b.user_id = $${paramCount}`);
      queryParams.push(userId);
      paramCount++;
    }

    if (dateFrom) {
      whereConditions.push(`b.created_at >= $${paramCount}`);
      queryParams.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      whereConditions.push(`b.created_at <= $${paramCount}`);
      queryParams.push(dateTo);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    queryParams.push(limit, offset);

    const baseQuery = `
      SELECT b.*, 
             u.first_name, u.last_name, u.email as user_email,
             t.title as trip_title, t.slug as trip_slug,
             h.name as hotel_name, h.slug as hotel_slug,
             c.name as category_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN trips t ON b.trip_id = t.id
      LEFT JOIN hotels h ON b.hotel_id = h.id
      LEFT JOIN categories c ON (t.category_id = c.id OR h.category_id = c.id)
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      ${whereClause}
    `;

    const [bookingsResult, countResult] = await Promise.all([
      query(baseQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2))
    ]);

    const bookings = bookingsResult.rows.map(row => new Booking(row));
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    return {
      bookings,
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

  // Update booking status
  async updateStatus(newStatus) {
    const result = await query(`
      UPDATE bookings 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [newStatus, this.id]);

    if (result.rows[0]) {
      Object.assign(this, result.rows[0]);
    }
    return this;
  }

  // Update booking
  async update(updateData) {
    const allowedFields = [
      'guest_name', 'guest_email', 'guest_phone', 'number_of_guests',
      'departure_date', 'check_in_date', 'check_out_date', 'number_of_nights',
      'room_type', 'special_requests', 'status'
    ];

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
      UPDATE bookings 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows[0]) {
      Object.assign(this, result.rows[0]);
    }
    return this;
  }

  // Cancel booking
  async cancel() {
    return await this.updateStatus('cancelled');
  }

  // Confirm booking
  async confirm() {
    return await this.updateStatus('confirmed');
  }

  // Complete booking
  async complete() {
    return await this.updateStatus('completed');
  }

  // Check availability for trip or hotel
  static async checkAvailability(type, resourceId, dates) {
    if (type === 'trip') {
      const { departureDate } = dates;
      const result = await query(`
        SELECT
          a.available_slots,
          a.booked_slots,
          (a.available_slots - a.booked_slots) as remaining_slots,
          a.is_available,
          t.max_participants
        FROM availability a
        JOIN trips t ON a.trip_id = t.id
        WHERE a.trip_id = $1 AND a.date = $2
      `, [resourceId, departureDate]);

      if (result.rows.length === 0) {
        return { available: false, message: 'No availability data found for this date' };
      }

      const availability = result.rows[0];
      return {
        available: availability.is_available && availability.remaining_slots > 0,
        remainingSlots: parseInt(availability.remaining_slots),
        maxParticipants: parseInt(availability.max_participants),
        message: availability.is_available
          ? `${availability.remaining_slots} slots available`
          : 'Not available for this date'
      };
    } else if (type === 'hotel') {
      const { checkInDate, checkOutDate } = dates;

      // Check availability for each night
      const result = await query(`
        SELECT
          a.date,
          a.available_slots,
          a.booked_slots,
          (a.available_slots - a.booked_slots) as remaining_slots,
          a.is_available
        FROM availability a
        WHERE a.hotel_id = $1
          AND a.date >= $2
          AND a.date < $3
        ORDER BY a.date
      `, [resourceId, checkInDate, checkOutDate]);

      if (result.rows.length === 0) {
        return { available: false, message: 'No availability data found for these dates' };
      }

      const unavailableDates = result.rows.filter(row =>
        !row.is_available || row.remaining_slots <= 0
      );

      if (unavailableDates.length > 0) {
        return {
          available: false,
          message: `Not available for dates: ${unavailableDates.map(d => d.date).join(', ')}`,
          unavailableDates: unavailableDates.map(d => d.date)
        };
      }

      const minAvailable = Math.min(...result.rows.map(row => parseInt(row.remaining_slots)));
      return {
        available: true,
        remainingSlots: minAvailable,
        message: `${minAvailable} rooms available for all nights`
      };
    }

    return { available: false, message: 'Invalid booking type' };
  }

  // Get booking statistics
  static async getStats(filters = {}) {
    const { dateFrom, dateTo } = filters;
    
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 1;

    if (dateFrom) {
      whereConditions.push(`created_at >= $${paramCount}`);
      queryParams.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      whereConditions.push(`created_at <= $${paramCount}`);
      queryParams.push(dateTo);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await query(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
        COUNT(*) FILTER (WHERE booking_type = 'trip') as trip_bookings,
        COUNT(*) FILTER (WHERE booking_type = 'hotel') as hotel_bookings,
        SUM(total_price) FILTER (WHERE status IN ('confirmed', 'completed')) as total_revenue,
        AVG(total_price) FILTER (WHERE status IN ('confirmed', 'completed')) as average_booking_value
      FROM bookings
      ${whereClause}
    `, queryParams);

    return result.rows[0];
  }

  // Convert to JSON
  toJSON() {
    return {
      ...this,
      base_price: parseFloat(this.base_price),
      total_price: parseFloat(this.total_price),
      number_of_guests: parseInt(this.number_of_guests),
      number_of_nights: parseInt(this.number_of_nights)
    };
  }
}
