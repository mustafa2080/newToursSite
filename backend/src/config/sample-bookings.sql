-- Sample bookings for testing user profile page
-- This script adds sample booking data for the test user

-- Insert sample bookings for user@example.com (user ID: 750e8400-e29b-41d4-a716-446655440002)
INSERT INTO bookings (
  id, 
  user_id, 
  booking_type, 
  trip_id, 
  hotel_id,
  guest_name, 
  guest_email, 
  guest_phone,
  number_of_guests,
  departure_date,
  return_date,
  check_in_date,
  check_out_date,
  number_of_nights,
  room_type,
  base_price,
  total_price,
  status,
  payment_status,
  special_requests,
  created_at,
  updated_at
) VALUES 

-- Trip Booking 1 - Upcoming Cappadocia Trip
(
  '950e8400-e29b-41d4-a716-446655440001',
  '750e8400-e29b-41d4-a716-446655440002',
  'trip',
  '850e8400-e29b-41d4-a716-446655440001', -- Cappadocia trip
  NULL,
  'John Doe',
  'user@example.com',
  '+1234567890',
  2,
  '2024-05-15',
  '2024-05-19',
  NULL,
  NULL,
  NULL,
  NULL,
  899.00,
  1798.00,
  'confirmed',
  'paid',
  'Honeymoon trip, prefer balloon ride at sunrise',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '10 days'
),

-- Hotel Booking 1 - Upcoming Hotel Stay
(
  '950e8400-e29b-41d4-a716-446655440002',
  '750e8400-e29b-41d4-a716-446655440002',
  'hotel',
  NULL,
  '950e8400-e29b-41d4-a716-446655440001', -- Luxury Resort
  'John Doe',
  'user@example.com',
  '+1234567890',
  2,
  NULL,
  NULL,
  '2024-06-10',
  '2024-06-15',
  5,
  'Ocean View Suite',
  450.00,
  2250.00,
  'confirmed',
  'paid',
  'Anniversary celebration, late checkout preferred',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),

-- Trip Booking 2 - Past Trip (Completed)
(
  '950e8400-e29b-41d4-a716-446655440003',
  '750e8400-e29b-41d4-a716-446655440002',
  'trip',
  '850e8400-e29b-41d4-a716-446655440002', -- Santorini trip
  NULL,
  'John Doe',
  'user@example.com',
  '+1234567890',
  2,
  '2024-02-10',
  '2024-02-17',
  NULL,
  NULL,
  NULL,
  NULL,
  1299.00,
  2598.00,
  'completed',
  'paid',
  'Photography tour, sunset viewing preferred',
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '30 days'
),

-- Hotel Booking 2 - Cancelled
(
  '950e8400-e29b-41d4-a716-446655440004',
  '750e8400-e29b-41d4-a716-446655440002',
  'hotel',
  NULL,
  '950e8400-e29b-41d4-a716-446655440002', -- City Hotel
  'John Doe',
  'user@example.com',
  '+1234567890',
  1,
  NULL,
  NULL,
  '2024-07-20',
  '2024-07-25',
  5,
  'Standard Room',
  200.00,
  1000.00,
  'cancelled',
  'refunded',
  'Business trip, early check-in needed',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '10 days'
),

-- Trip Booking 3 - Pending
(
  '950e8400-e29b-41d4-a716-446655440005',
  '750e8400-e29b-41d4-a716-446655440002',
  'trip',
  '850e8400-e29b-41d4-a716-446655440003', -- Bali trip
  NULL,
  'John Doe',
  'user@example.com',
  '+1234567890',
  2,
  '2024-08-15',
  '2024-08-25',
  NULL,
  NULL,
  NULL,
  NULL,
  1599.00,
  3198.00,
  'pending',
  'pending',
  'Cultural tour, vegetarian meals required',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- Update trips table to include trip titles for easier reference
UPDATE trips SET 
  title = 'Magical Cappadocia Adventure',
  short_description = 'Hot air balloons, cave hotels, and fairy chimneys await'
WHERE id = '850e8400-e29b-41d4-a716-446655440001';

-- Add more sample trips if they don't exist
INSERT INTO trips (id, title, slug, description, short_description, main_image, price, duration_days, max_participants, difficulty_level, category_id, is_active, featured) VALUES
('850e8400-e29b-41d4-a716-446655440002', 
 'Romantic Santorini Getaway', 
 'romantic-santorini-getaway',
 'Experience the breathtaking sunsets and white-washed villages of Santorini',
 'Stunning sunsets and romantic villages in the Greek islands',
 '/images/trips/santorini-main.jpg',
 1299.00,
 7,
 8,
 'easy',
 '550e8400-e29b-41d4-a716-446655440002',
 true,
 true
),
('850e8400-e29b-41d4-a716-446655440003', 
 'Bali Cultural Discovery', 
 'bali-cultural-discovery',
 'Immerse yourself in Balinese culture, temples, and natural beauty',
 'Temples, rice terraces, and cultural experiences in Bali',
 '/images/trips/bali-main.jpg',
 1599.00,
 10,
 12,
 'moderate',
 '550e8400-e29b-41d4-a716-446655440003',
 true,
 true
)
ON CONFLICT (id) DO NOTHING;

-- Add sample hotels if they don't exist
INSERT INTO hotels (id, name, slug, description, short_description, main_image, price_per_night, star_rating, location, amenities, is_active, featured) VALUES
('950e8400-e29b-41d4-a716-446655440001',
 'Luxury Beach Resort & Spa',
 'luxury-beach-resort-spa',
 'A premium beachfront resort with world-class amenities and stunning ocean views',
 'Premium beachfront resort with spa and ocean views',
 '/images/hotels/luxury-resort-main.jpg',
 450.00,
 5,
 'Maldives',
 ARRAY['Ocean View', 'Spa', 'Pool', 'Restaurant', 'WiFi', 'Room Service'],
 true,
 true
),
('950e8400-e29b-41d4-a716-446655440002',
 'Grand City Center Hotel',
 'grand-city-center-hotel',
 'Modern hotel in the heart of the city with excellent business facilities',
 'Modern city center hotel with business facilities',
 '/images/hotels/city-hotel-main.jpg',
 200.00,
 4,
 'Paris, France',
 ARRAY['City View', 'Business Center', 'Gym', 'Restaurant', 'WiFi', 'Conference Rooms'],
 true,
 false
)
ON CONFLICT (id) DO NOTHING;
