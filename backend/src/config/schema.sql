-- Tours Database Schema
-- PostgreSQL Database Schema for Tourism Website

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'refunded');
CREATE TYPE content_type AS ENUM ('about', 'contact', 'terms', 'privacy', 'faq', 'help');
CREATE TYPE media_type AS ENUM ('image', 'video', 'document', 'audio');
CREATE TYPE tag_type AS ENUM ('location', 'feature', 'activity', 'amenity', 'cuisine', 'transport');
CREATE TYPE difficulty_level AS ENUM ('easy', 'moderate', 'hard', 'extreme');
CREATE TYPE notification_type AS ENUM ('booking_confirmation', 'booking_reminder', 'review_request', 'admin_alert', 'system_update', 'promotion');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    profile_image VARCHAR(255),
    role user_role DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table (Countries)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips table
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    main_image VARCHAR(255) NOT NULL,
    gallery TEXT[], -- Array of image URLs
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    max_participants INTEGER NOT NULL,
    difficulty_level difficulty_level DEFAULT 'easy',
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    itinerary JSONB, -- Detailed day-by-day itinerary
    included_services TEXT[],
    excluded_services TEXT[],
    departure_dates DATE[],
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hotels table
CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    main_image VARCHAR(255) NOT NULL,
    gallery TEXT[], -- Array of image URLs
    price_per_night DECIMAL(10,2) NOT NULL,
    star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amenities TEXT[],
    room_types JSONB, -- Different room types and their details
    policies JSONB, -- Check-in/out times, cancellation policy, etc.
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL,
    booking_type VARCHAR(20) NOT NULL CHECK (booking_type IN ('trip', 'hotel')),
    status booking_status DEFAULT 'pending',
    
    -- Guest information
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    number_of_guests INTEGER NOT NULL DEFAULT 1,
    
    -- Trip specific fields
    departure_date DATE,
    
    -- Hotel specific fields
    check_in_date DATE,
    check_out_date DATE,
    number_of_nights INTEGER,
    room_type VARCHAR(100),
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Additional information
    special_requests TEXT,
    booking_reference VARCHAR(50) UNIQUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure either trip_id or hotel_id is set, but not both
    CONSTRAINT check_booking_type CHECK (
        (booking_type = 'trip' AND trip_id IS NOT NULL AND hotel_id IS NULL) OR
        (booking_type = 'hotel' AND hotel_id IS NOT NULL AND trip_id IS NULL)
    )
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure either trip_id or hotel_id is set, but not both
    CONSTRAINT check_review_target CHECK (
        (trip_id IS NOT NULL AND hotel_id IS NULL) OR
        (hotel_id IS NOT NULL AND trip_id IS NULL)
    )
);

-- Wishlist table
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure either trip_id or hotel_id is set, but not both
    CONSTRAINT check_wishlist_item CHECK (
        (trip_id IS NOT NULL AND hotel_id IS NULL) OR
        (hotel_id IS NOT NULL AND trip_id IS NULL)
    ),
    
    -- Prevent duplicate wishlist items
    UNIQUE(user_id, trip_id),
    UNIQUE(user_id, hotel_id)
);

-- Content pages table (for About, Contact, etc.)
CREATE TABLE content_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type content_type UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin logs table
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media table for centralized file management
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    media_type media_type NOT NULL,
    alt_text VARCHAR(255),
    caption TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags table for searchable tagging system
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type tag_type NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trip tags junction table
CREATE TABLE trip_tags (
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (trip_id, tag_id)
);

-- Hotel tags junction table
CREATE TABLE hotel_tags (
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (hotel_id, tag_id)
);

-- Analytics table for tracking user behavior
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- 'page_view', 'search', 'booking_attempt', etc.
    resource_type VARCHAR(50), -- 'trip', 'hotel', 'category'
    resource_id UUID,
    metadata JSONB, -- Additional event data
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Availability table for real-time booking management
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available_slots INTEGER NOT NULL DEFAULT 0,
    booked_slots INTEGER NOT NULL DEFAULT 0,
    price_override DECIMAL(10,2), -- Optional price override for specific dates
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure either trip_id or hotel_id is set, but not both
    CONSTRAINT check_availability_target CHECK (
        (trip_id IS NOT NULL AND hotel_id IS NULL) OR
        (hotel_id IS NOT NULL AND trip_id IS NULL)
    ),

    -- Unique constraint for date and resource
    UNIQUE(trip_id, date),
    UNIQUE(hotel_id, date)
);

-- Notifications table for user and admin notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email templates table for automated communications
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB, -- Available template variables
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table for enhanced security
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO metadata table for dynamic SEO management
CREATE TABLE seo_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type VARCHAR(50) NOT NULL, -- 'trip', 'hotel', 'category', 'page'
    resource_id UUID,
    page_slug VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    keywords TEXT[],
    canonical_url VARCHAR(500),
    og_title VARCHAR(255),
    og_description VARCHAR(500),
    og_image VARCHAR(500),
    twitter_title VARCHAR(255),
    twitter_description VARCHAR(500),
    twitter_image VARCHAR(500),
    schema_markup JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Ensure unique SEO data per resource
    UNIQUE(resource_type, resource_id),
    UNIQUE(page_slug)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_trips_slug ON trips(slug);
CREATE INDEX idx_trips_category ON trips(category_id);
CREATE INDEX idx_trips_featured ON trips(featured);
CREATE INDEX idx_trips_active ON trips(is_active);
CREATE INDEX idx_trips_price ON trips(price);
CREATE INDEX idx_hotels_slug ON hotels(slug);
CREATE INDEX idx_hotels_category ON hotels(category_id);
CREATE INDEX idx_hotels_featured ON hotels(featured);
CREATE INDEX idx_hotels_active ON hotels(is_active);
CREATE INDEX idx_hotels_price ON hotels(price_per_night);
CREATE INDEX idx_hotels_rating ON hotels(star_rating);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_type ON bookings(booking_type);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_reviews_trip ON reviews(trip_id);
CREATE INDEX idx_reviews_hotel ON reviews(hotel_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at);

-- New table indexes
CREATE INDEX idx_media_type ON media(media_type);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX idx_tags_type ON tags(type);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_user ON analytics(user_id);
CREATE INDEX idx_analytics_created ON analytics(created_at);
CREATE INDEX idx_availability_date ON availability(date);
CREATE INDEX idx_availability_trip ON availability(trip_id);
CREATE INDEX idx_availability_hotel ON availability(hotel_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_seo_metadata_resource ON seo_metadata(resource_type, resource_id);
CREATE INDEX idx_seo_metadata_slug ON seo_metadata(page_slug);

-- Full-text search indexes
CREATE INDEX idx_trips_search ON trips USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_hotels_search ON hotels USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_categories_search ON categories USING gin(to_tsvector('english', name || ' ' || description));

-- Trigram indexes for fuzzy search
CREATE INDEX idx_trips_title_trgm ON trips USING gin(title gin_trgm_ops);
CREATE INDEX idx_hotels_name_trgm ON hotels USING gin(name gin_trgm_ops);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_pages_updated_at BEFORE UPDATE ON content_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_metadata_updated_at BEFORE UPDATE ON seo_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_reference IS NULL THEN
        NEW.booking_reference := 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::text, 1, 8));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-generate booking reference
CREATE TRIGGER generate_booking_reference_trigger
    BEFORE INSERT ON bookings
    FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

-- Function to update availability after booking
CREATE OR REPLACE FUNCTION update_availability_after_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
        -- Increase booked slots
        IF NEW.trip_id IS NOT NULL THEN
            UPDATE availability
            SET booked_slots = booked_slots + NEW.number_of_guests
            WHERE trip_id = NEW.trip_id AND date = NEW.departure_date;
        ELSIF NEW.hotel_id IS NOT NULL THEN
            -- Update hotel availability for each night
            FOR i IN 0..(NEW.number_of_nights - 1) LOOP
                UPDATE availability
                SET booked_slots = booked_slots + 1
                WHERE hotel_id = NEW.hotel_id AND date = NEW.check_in_date + i;
            END LOOP;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
            -- Booking confirmed, increase booked slots
            IF NEW.trip_id IS NOT NULL THEN
                UPDATE availability
                SET booked_slots = booked_slots + NEW.number_of_guests
                WHERE trip_id = NEW.trip_id AND date = NEW.departure_date;
            END IF;
        ELSIF OLD.status = 'confirmed' AND NEW.status IN ('cancelled', 'pending') THEN
            -- Booking cancelled/changed, decrease booked slots
            IF NEW.trip_id IS NOT NULL THEN
                UPDATE availability
                SET booked_slots = booked_slots - NEW.number_of_guests
                WHERE trip_id = NEW.trip_id AND date = NEW.departure_date;
            END IF;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger to update availability
CREATE TRIGGER update_availability_trigger
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_availability_after_booking();
