import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {
  constructor(data) {
    Object.assign(this, data);
  }

  // Create a new user
  static async create(userData) {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      role = 'user'
    } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await query(`
      INSERT INTO users (email, password, first_name, last_name, phone, date_of_birth, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [email, hashedPassword, firstName, lastName, phone, dateOfBirth, role]);

    return new User(result.rows[0]);
  }

  // Find user by email
  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  // Find user by ID
  static async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  // Find user by reset token
  static async findByResetToken(token) {
    const result = await query(`
      SELECT * FROM users
      WHERE password_reset_token = $1
      AND password_reset_expires > NOW()
    `, [token]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  // Get all users (admin only)
  static async findAll(limit = 50, offset = 0) {
    const result = await query(`
      SELECT id, email, first_name, last_name, phone, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    return result.rows.map(row => new User(row));
  }

  // Update user
  async update(updateData) {
    const allowedFields = ['first_name', 'last_name', 'phone', 'date_of_birth', 'profile_image'];
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
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows[0]) {
      Object.assign(this, result.rows[0]);
    }
    return this;
  }

  // Update password
  async updatePassword(newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await query(`
      UPDATE users 
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [hashedPassword, this.id]);
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Activate/Deactivate user
  async setActive(isActive) {
    const result = await query(`
      UPDATE users 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [isActive, this.id]);

    if (result.rows[0]) {
      Object.assign(this, result.rows[0]);
    }
    return this;
  }

  // Verify email
  async verifyEmail() {
    const result = await query(`
      UPDATE users 
      SET email_verified = true, email_verification_token = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [this.id]);

    if (result.rows[0]) {
      Object.assign(this, result.rows[0]);
    }
    return this;
  }

  // Set password reset token
  async setPasswordResetToken(token, expires) {
    await query(`
      UPDATE users 
      SET password_reset_token = $1, password_reset_expires = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [token, expires, this.id]);
  }

  // Clear password reset token
  async clearPasswordResetToken() {
    await query(`
      UPDATE users 
      SET password_reset_token = NULL, password_reset_expires = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [this.id]);
  }

  // Get user statistics
  static async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'user') as regular_users,
        COUNT(*) FILTER (WHERE role = 'admin') as admin_users,
        COUNT(*) FILTER (WHERE is_active = true) as active_users,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_this_month
      FROM users
    `);

    return result.rows[0];
  }

  // Delete user (soft delete by deactivating)
  async delete() {
    return await this.setActive(false);
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    const { password, email_verification_token, password_reset_token, ...publicData } = this;
    return publicData;
  }

  // Get public profile data
  getPublicProfile() {
    return {
      id: this.id,
      first_name: this.first_name,
      last_name: this.last_name,
      profile_image: this.profile_image,
      created_at: this.created_at
    };
  }
}
