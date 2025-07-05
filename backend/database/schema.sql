-- Tourism Platform Review System Database Schema

-- Users table (assuming it exists)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items table to reference trips and hotels
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('trip', 'hotel')),
    item_id INTEGER NOT NULL, -- References trips.id or hotels.id
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_type, item_id)
);

-- Ratings table - ONE rating per user per item
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('trip', 'hotel')),
    item_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Composite unique constraint: one rating per user per item
    UNIQUE(user_id, item_type, item_id)
);

-- Reviews table - MULTIPLE comments per user per item
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('trip', 'hotel')),
    item_id INTEGER NOT NULL,
    comment TEXT NOT NULL CHECK (LENGTH(comment) >= 10 AND LENGTH(comment) <= 2000),
    rating_id INTEGER REFERENCES ratings(id) ON DELETE SET NULL, -- Optional link to rating
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_ratings_item ON ratings(item_type, item_id);
CREATE INDEX idx_reviews_item ON reviews(item_type, item_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- View for aggregated rating statistics
CREATE OR REPLACE VIEW rating_stats AS
SELECT 
    item_type,
    item_id,
    COUNT(*) as total_ratings,
    AVG(rating::DECIMAL) as average_rating,
    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
    COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
    COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
    COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
    COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count
FROM ratings 
GROUP BY item_type, item_id;

-- View for review counts
CREATE OR REPLACE VIEW review_stats AS
SELECT 
    item_type,
    item_id,
    COUNT(*) as total_reviews,
    COUNT(DISTINCT user_id) as unique_reviewers
FROM reviews 
WHERE is_deleted = FALSE
GROUP BY item_type, item_id;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO users (email, username, password_hash) VALUES 
('john@example.com', 'john_doe', '$2b$10$example_hash_1'),
('jane@example.com', 'jane_smith', '$2b$10$example_hash_2'),
('bob@example.com', 'bob_wilson', '$2b$10$example_hash_3')
ON CONFLICT (email) DO NOTHING;

-- Sample items
INSERT INTO items (item_type, item_id, title) VALUES 
('trip', 1, 'Amazing Safari Adventure'),
('trip', 2, 'City Walking Tour'),
('hotel', 1, 'Luxury Beach Resort'),
('hotel', 2, 'Downtown Business Hotel')
ON CONFLICT (item_type, item_id) DO NOTHING;
