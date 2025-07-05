-- Sample data for Tours Database
-- This file contains initial data for development and testing

-- Insert sample categories (countries)
INSERT INTO categories (id, name, slug, description, image, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Turkey', 'turkey', 'Discover the magical blend of European and Asian cultures in Turkey', '/images/categories/turkey.jpg', true),
('550e8400-e29b-41d4-a716-446655440002', 'Greece', 'greece', 'Explore ancient history and stunning islands in Greece', '/images/categories/greece.jpg', true),
('550e8400-e29b-41d4-a716-446655440003', 'Italy', 'italy', 'Experience art, culture, and cuisine in beautiful Italy', '/images/categories/italy.jpg', true),
('550e8400-e29b-41d4-a716-446655440004', 'Spain', 'spain', 'Discover vibrant culture and stunning architecture in Spain', '/images/categories/spain.jpg', true),
('550e8400-e29b-41d4-a716-446655440005', 'France', 'france', 'Romance, art, and gastronomy await in France', '/images/categories/france.jpg', true);

-- Insert sample tags
INSERT INTO tags (id, name, slug, type, description, color, is_active) VALUES
-- Location tags
('650e8400-e29b-41d4-a716-446655440001', 'Istanbul', 'istanbul', 'location', 'Historic city spanning Europe and Asia', '#3B82F6', true),
('650e8400-e29b-41d4-a716-446655440002', 'Cappadocia', 'cappadocia', 'location', 'Famous for hot air balloons and fairy chimneys', '#8B5CF6', true),
('650e8400-e29b-41d4-a716-446655440003', 'Santorini', 'santorini', 'location', 'Stunning Greek island with white buildings', '#06B6D4', true),
('650e8400-e29b-41d4-a716-446655440004', 'Rome', 'rome', 'location', 'The Eternal City with ancient history', '#EF4444', true),
-- Feature tags
('650e8400-e29b-41d4-a716-446655440005', 'Historical Sites', 'historical-sites', 'feature', 'Ancient monuments and historical locations', '#F59E0B', true),
('650e8400-e29b-41d4-a716-446655440006', 'Beach Access', 'beach-access', 'feature', 'Direct access to beautiful beaches', '#10B981', true),
('650e8400-e29b-41d4-a716-446655440007', 'Mountain Views', 'mountain-views', 'feature', 'Spectacular mountain scenery', '#6B7280', true),
-- Activity tags
('650e8400-e29b-41d4-a716-446655440008', 'Hot Air Balloon', 'hot-air-balloon', 'activity', 'Scenic balloon rides', '#F97316', true),
('650e8400-e29b-41d4-a716-446655440009', 'Scuba Diving', 'scuba-diving', 'activity', 'Underwater exploration', '#0EA5E9', true),
('650e8400-e29b-41d4-a716-446655440010', 'Wine Tasting', 'wine-tasting', 'activity', 'Local wine experiences', '#7C3AED', true);

-- Insert sample admin user (password: admin123)
INSERT INTO users (id, email, password, first_name, last_name, role, is_active, email_verified) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'admin@tours.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'Admin', 'User', 'admin', true, true);

-- Insert sample regular user (password: user123)
INSERT INTO users (id, email, password, first_name, last_name, phone, role, is_active, email_verified) VALUES
('750e8400-e29b-41d4-a716-446655440002', 'user@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', 'John', 'Doe', '+1234567890', 'user', true, true);

-- Insert sample trips
INSERT INTO trips (id, title, slug, description, short_description, main_image, gallery, price, duration_days, max_participants, difficulty_level, category_id, itinerary, included_services, excluded_services, departure_dates, is_active, featured, meta_title, meta_description) VALUES
('850e8400-e29b-41d4-a716-446655440001', 
 'Magical Cappadocia Adventure', 
 'magical-cappadocia-adventure',
 'Experience the otherworldly landscape of Cappadocia with hot air balloon rides, underground cities, and fairy chimney formations. This 4-day adventure includes luxury cave hotels and authentic Turkish cuisine.',
 'Hot air balloons, cave hotels, and fairy chimneys await in magical Cappadocia',
 '/images/trips/cappadocia-main.jpg',
 ARRAY['/images/trips/cappadocia-1.jpg', '/images/trips/cappadocia-2.jpg', '/images/trips/cappadocia-3.jpg'],
 899.00,
 4,
 12,
 'moderate',
 '550e8400-e29b-41d4-a716-446655440001',
 '{"day1": {"title": "Arrival & Sunset Tour", "activities": ["Airport pickup", "Hotel check-in", "Sunset valley tour", "Welcome dinner"]}, "day2": {"title": "Hot Air Balloon & Underground City", "activities": ["Early morning balloon ride", "Breakfast", "Underground city exploration", "Pottery workshop"]}, "day3": {"title": "Hiking & Cave Churches", "activities": ["Rose Valley hike", "Cave church visits", "Local lunch", "Free time"]}, "day4": {"title": "Departure", "activities": ["Hotel checkout", "Souvenir shopping", "Airport transfer"]}}',
 ARRAY['4-star cave hotel accommodation', 'Daily breakfast', 'Hot air balloon ride', 'All transfers', 'Professional guide', 'Entrance fees'],
 ARRAY['International flights', 'Lunch and dinner (except welcome dinner)', 'Personal expenses', 'Travel insurance'],
 ARRAY['2024-04-15', '2024-05-01', '2024-05-15', '2024-06-01'],
 true,
 true,
 'Magical Cappadocia Adventure - 4 Days Hot Air Balloon Tour',
 'Experience Cappadocia''s magic with hot air balloons, cave hotels, and fairy chimneys. Book your 4-day adventure now!'
);

-- Insert sample hotels
INSERT INTO hotels (id, name, slug, description, short_description, main_image, gallery, price_per_night, star_rating, address, city, category_id, amenities, room_types, policies, is_active, featured, meta_title, meta_description) VALUES
('950e8400-e29b-41d4-a716-446655440001',
 'Santorini Sunset Resort',
 'santorini-sunset-resort',
 'Perched on the cliffs of Oia, this luxury resort offers breathtaking sunset views, infinity pools, and world-class amenities. Each suite features traditional Cycladic architecture with modern luxury.',
 'Luxury cliffside resort with stunning sunset views in Oia, Santorini',
 '/images/hotels/santorini-main.jpg',
 ARRAY['/images/hotels/santorini-1.jpg', '/images/hotels/santorini-2.jpg', '/images/hotels/santorini-3.jpg'],
 450.00,
 5,
 'Oia Village, Santorini, Greece',
 'Santorini',
 '550e8400-e29b-41d4-a716-446655440002',
 ARRAY['Infinity Pool', 'Spa & Wellness Center', 'Fine Dining Restaurant', 'Concierge Service', 'Free WiFi', 'Airport Transfer', 'Private Beach Access'],
 '{"deluxe_suite": {"name": "Deluxe Suite", "size": "45 sqm", "occupancy": 2, "amenities": ["King bed", "Private terrace", "Sea view", "Marble bathroom"]}, "presidential_suite": {"name": "Presidential Suite", "size": "80 sqm", "occupancy": 4, "amenities": ["2 bedrooms", "Living room", "Private pool", "Butler service"]}}',
 '{"check_in": "15:00", "check_out": "11:00", "cancellation": "Free cancellation up to 48 hours before arrival", "pets": "Pets not allowed", "smoking": "Non-smoking property"}',
 true,
 true,
 'Santorini Sunset Resort - Luxury Hotel in Oia with Sunset Views',
 'Book Santorini Sunset Resort for luxury accommodation with stunning sunset views, infinity pools, and world-class amenities in Oia.'
);

-- Insert content pages
INSERT INTO content_pages (type, title, content, meta_title, meta_description, is_active) VALUES
('about', 'About Our Tours', 
 '<h2>Welcome to Premium Tours</h2><p>We are a leading travel company specializing in creating unforgettable experiences across the Mediterranean. With over 15 years of experience, we pride ourselves on delivering exceptional service and authentic cultural experiences.</p><h3>Our Mission</h3><p>To provide travelers with authentic, sustainable, and memorable experiences while supporting local communities and preserving cultural heritage.</p><h3>Why Choose Us</h3><ul><li>Expert local guides</li><li>Small group sizes</li><li>Sustainable tourism practices</li><li>24/7 customer support</li><li>Best price guarantee</li></ul>',
 'About Premium Tours - Your Mediterranean Travel Experts',
 'Learn about Premium Tours, your trusted Mediterranean travel experts with 15+ years of experience in creating unforgettable cultural experiences.',
 true),
('contact', 'Contact Us',
 '<h2>Get in Touch</h2><p>We''re here to help you plan your perfect getaway. Contact us through any of the following methods:</p><h3>Office Hours</h3><p>Monday - Friday: 9:00 AM - 6:00 PM<br>Saturday: 10:00 AM - 4:00 PM<br>Sunday: Closed</p><h3>Contact Information</h3><p><strong>Phone:</strong> +1 (555) 123-4567<br><strong>Email:</strong> info@premiumtours.com<br><strong>Address:</strong> 123 Travel Street, Tourism City, TC 12345</p>',
 'Contact Premium Tours - Get in Touch for Travel Planning',
 'Contact Premium Tours for personalized travel planning. Phone, email, and office hours available. Expert travel consultants ready to help.',
 true);

-- Insert email templates
INSERT INTO email_templates (name, subject, html_content, text_content, variables, is_active) VALUES
('booking_confirmation', 
 'Booking Confirmation - {{booking_reference}}',
 '<h1>Booking Confirmed!</h1><p>Dear {{guest_name}},</p><p>Your booking has been confirmed. Here are the details:</p><ul><li><strong>Booking Reference:</strong> {{booking_reference}}</li><li><strong>{{booking_type}}:</strong> {{item_name}}</li><li><strong>Date:</strong> {{booking_date}}</li><li><strong>Guests:</strong> {{number_of_guests}}</li><li><strong>Total Price:</strong> ${{total_price}}</li></ul><p>We look forward to providing you with an amazing experience!</p>',
 'Booking Confirmed! Dear {{guest_name}}, Your booking {{booking_reference}} has been confirmed for {{item_name}} on {{booking_date}}. Total: ${{total_price}}',
 '["guest_name", "booking_reference", "booking_type", "item_name", "booking_date", "number_of_guests", "total_price"]',
 true);

-- Insert trip tags relationships
INSERT INTO trip_tags (trip_id, tag_id) VALUES
('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002'), -- Cappadocia
('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440005'), -- Historical Sites
('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440008'); -- Hot Air Balloon

-- Insert hotel tags relationships
INSERT INTO hotel_tags (hotel_id, tag_id) VALUES
('950e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003'), -- Santorini
('950e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440006'); -- Beach Access

-- Insert sample availability data
INSERT INTO availability (trip_id, date, available_slots, booked_slots, is_available) VALUES
('850e8400-e29b-41d4-a716-446655440001', '2024-04-15', 12, 0, true),
('850e8400-e29b-41d4-a716-446655440001', '2024-05-01', 12, 3, true),
('850e8400-e29b-41d4-a716-446655440001', '2024-05-15', 12, 0, true),
('850e8400-e29b-41d4-a716-446655440001', '2024-06-01', 12, 0, true);

INSERT INTO availability (hotel_id, date, available_slots, booked_slots, is_available) VALUES
('950e8400-e29b-41d4-a716-446655440001', '2024-04-01', 20, 5, true),
('950e8400-e29b-41d4-a716-446655440001', '2024-04-02', 20, 8, true),
('950e8400-e29b-41d4-a716-446655440001', '2024-04-03', 20, 12, true);

-- Insert SEO metadata
INSERT INTO seo_metadata (resource_type, resource_id, title, description, keywords, canonical_url, og_title, og_description, schema_markup, is_active) VALUES
('trip', '850e8400-e29b-41d4-a716-446655440001',
 'Magical Cappadocia Adventure - 4 Days Hot Air Balloon Tour | Premium Tours',
 'Experience Cappadocia''s magic with hot air balloons, cave hotels, and fairy chimneys. Book your 4-day adventure with Premium Tours now!',
 ARRAY['cappadocia', 'hot air balloon', 'turkey tours', 'cave hotels', 'fairy chimneys'],
 'https://premiumtours.com/trips/magical-cappadocia-adventure',
 'Magical Cappadocia Adventure - Hot Air Balloon Tours',
 'Discover the otherworldly landscape of Cappadocia with luxury cave hotels and hot air balloon rides.',
 '{"@context": "https://schema.org", "@type": "TouristTrip", "name": "Magical Cappadocia Adventure", "description": "4-day Cappadocia tour with hot air balloon rides", "provider": {"@type": "TravelAgency", "name": "Premium Tours"}}',
 true),
('hotel', '950e8400-e29b-41d4-a716-446655440001',
 'Santorini Sunset Resort - Luxury Hotel in Oia with Sunset Views | Premium Tours',
 'Book Santorini Sunset Resort for luxury accommodation with stunning sunset views, infinity pools, and world-class amenities in Oia.',
 ARRAY['santorini hotel', 'oia accommodation', 'sunset views', 'luxury resort', 'greece hotels'],
 'https://premiumtours.com/hotels/santorini-sunset-resort',
 'Santorini Sunset Resort - Luxury Cliffside Hotel',
 'Luxury resort in Oia with breathtaking sunset views and infinity pools.',
 '{"@context": "https://schema.org", "@type": "Hotel", "name": "Santorini Sunset Resort", "starRating": {"@type": "Rating", "ratingValue": "5"}}',
 true);
