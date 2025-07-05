import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection } from './database.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to initialize database
export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      try {
        await query(statement);
      } catch (error) {
        // Ignore errors for statements that might already exist
        if (!error.message.includes('already exists') && 
            !error.message.includes('duplicate key')) {
          console.warn('⚠️  SQL Warning:', error.message);
        }
      }
    }

    console.log('✅ Database schema created successfully');
    
    // Insert default data
    await insertDefaultData();
    
    console.log('🎉 Database initialization completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

// Function to insert default data
const insertDefaultData = async () => {
  try {
    console.log('📊 Inserting default data...');
    
    // Create default admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    await query(`
      INSERT INTO users (email, password, first_name, last_name, role, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@tours.com', adminPassword, 'Admin', 'User', 'admin', true]);

    // Create default categories (countries)
    const categories = [
      { name: 'Egypt', slug: 'egypt', description: 'Discover the wonders of ancient Egypt' },
      { name: 'Turkey', slug: 'turkey', description: 'Experience the beauty of Turkey' },
      { name: 'Greece', slug: 'greece', description: 'Explore the Greek islands and history' },
      { name: 'Italy', slug: 'italy', description: 'Journey through Italy\'s rich culture' },
      { name: 'Spain', slug: 'spain', description: 'Discover Spain\'s vibrant culture' },
      { name: 'France', slug: 'france', description: 'Experience the elegance of France' }
    ];

    for (const category of categories) {
      await query(`
        INSERT INTO categories (name, slug, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug) DO NOTHING
      `, [category.name, category.slug, category.description]);
    }

    // Create default content pages
    const contentPages = [
      {
        type: 'about',
        title: 'About Us',
        content: `<h2>Welcome to Tours</h2>
        <p>We are a leading tourism company dedicated to providing unforgettable travel experiences. With years of expertise in the travel industry, we specialize in creating customized tours and hotel bookings that cater to your unique preferences and budget.</p>
        <h3>Our Mission</h3>
        <p>To make travel accessible, enjoyable, and memorable for everyone by providing exceptional service and carefully curated experiences.</p>
        <h3>Why Choose Us?</h3>
        <ul>
          <li>Expert local guides</li>
          <li>Carefully selected accommodations</li>
          <li>24/7 customer support</li>
          <li>Best price guarantee</li>
          <li>Flexible booking options</li>
        </ul>`,
        meta_title: 'About Us - Tours',
        meta_description: 'Learn about our mission to provide exceptional travel experiences and why thousands of travelers choose us for their adventures.'
      },
      {
        type: 'contact',
        title: 'Contact Us',
        content: `<h2>Get in Touch</h2>
        <p>We'd love to hear from you! Whether you have questions about our tours, need help with booking, or want to share your travel experience, our team is here to help.</p>
        <div class="contact-info">
          <h3>Contact Information</h3>
          <p><strong>Phone:</strong> +1 (555) 123-4567</p>
          <p><strong>Email:</strong> info@tours.com</p>
          <p><strong>Address:</strong> 123 Travel Street, Adventure City, AC 12345</p>
          <h3>Business Hours</h3>
          <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
          <p>Saturday: 10:00 AM - 4:00 PM</p>
          <p>Sunday: Closed</p>
        </div>`,
        meta_title: 'Contact Us - Tours',
        meta_description: 'Get in touch with our travel experts. Contact us for bookings, questions, or travel advice.'
      }
    ];

    for (const page of contentPages) {
      await query(`
        INSERT INTO content_pages (type, title, content, meta_title, meta_description)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (type) DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          meta_title = EXCLUDED.meta_title,
          meta_description = EXCLUDED.meta_description,
          updated_at = CURRENT_TIMESTAMP
      `, [page.type, page.title, page.content, page.meta_title, page.meta_description]);
    }

    console.log('✅ Default data inserted successfully');
    
  } catch (error) {
    console.error('❌ Error inserting default data:', error);
    throw error;
  }
};

// Function to reset database (for development)
export const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting database...');
    
    // Drop all tables in reverse order of dependencies
    const dropStatements = [
      'DROP TABLE IF EXISTS admin_logs CASCADE',
      'DROP TABLE IF EXISTS content_pages CASCADE',
      'DROP TABLE IF EXISTS wishlist CASCADE',
      'DROP TABLE IF EXISTS reviews CASCADE',
      'DROP TABLE IF EXISTS bookings CASCADE',
      'DROP TABLE IF EXISTS hotels CASCADE',
      'DROP TABLE IF EXISTS trips CASCADE',
      'DROP TABLE IF EXISTS categories CASCADE',
      'DROP TABLE IF EXISTS users CASCADE',
      'DROP TYPE IF EXISTS content_type CASCADE',
      'DROP TYPE IF EXISTS booking_status CASCADE',
      'DROP TYPE IF EXISTS user_role CASCADE',
      'DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE'
    ];

    for (const statement of dropStatements) {
      try {
        await query(statement);
      } catch (error) {
        // Ignore errors for non-existent objects
        if (!error.message.includes('does not exist')) {
          console.warn('⚠️  Drop warning:', error.message);
        }
      }
    }

    console.log('✅ Database reset completed');
    
    // Reinitialize
    return await initializeDatabase();
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    return false;
  }
};

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
