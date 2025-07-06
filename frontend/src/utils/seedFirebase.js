// Seed Firebase with sample data for testing
import { tripsAPI, hotelsAPI, bookingsAPI } from './firebaseApi';

const sampleTrips = [
  {
    title: 'Amazing Beach Adventure',
    slug: 'amazing-beach-adventure',
    description: 'Experience the most beautiful beaches with crystal clear waters and white sand.',
    short_description: 'Beautiful beaches with crystal clear waters',
    price: 599,
    duration_days: 7,
    max_participants: 20,
    status: 'active',
    main_image: 'https://picsum.photos/500/300?random=1',
    images: [
      'https://picsum.photos/500/300?random=1',
      'https://picsum.photos/500/300?random=2'
    ],
    location: 'Maldives',
    category_name: 'Beach',
    difficulty_level: 'easy',
    featured: true,
    average_rating: 4.8,
    review_count: 124,
  },
  {
    title: 'Mountain Hiking Expedition',
    slug: 'mountain-hiking-expedition',
    description: 'Challenge yourself with breathtaking mountain trails and stunning panoramic views.',
    short_description: 'Breathtaking mountain trails and stunning views',
    price: 799,
    duration_days: 5,
    max_participants: 15,
    status: 'active',
    main_image: 'https://picsum.photos/500/300?random=3',
    images: [
      'https://picsum.photos/500/300?random=3',
      'https://picsum.photos/500/300?random=4'
    ],
    location: 'Swiss Alps',
    category_name: 'Adventure',
    difficulty_level: 'hard',
    featured: true,
    average_rating: 4.9,
    review_count: 89,
  },
];

const sampleHotels = [
  {
    name: 'Luxury Beach Resort',
    slug: 'luxury-beach-resort',
    location: 'Miami Beach, FL',
    price_per_night: 299,
    star_rating: 5,
    status: 'active',
    rooms_available: 45,
    total_rooms: 120,
    average_rating: 4.8,
    review_count: 234,
    main_image: 'https://picsum.photos/500/300?random=10',
    images: [
      'https://picsum.photos/500/300?random=10',
      'https://picsum.photos/500/300?random=11'
    ],
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
    description: 'Experience luxury at its finest with our beachfront resort.',
    short_description: 'Luxury beachfront resort with world-class amenities.',
  },
  {
    name: 'Mountain View Lodge',
    slug: 'mountain-view-lodge',
    location: 'Aspen, CO',
    price_per_night: 189,
    star_rating: 4,
    status: 'active',
    rooms_available: 12,
    total_rooms: 80,
    average_rating: 4.6,
    review_count: 156,
    main_image: 'https://picsum.photos/500/300?random=12',
    images: [
      'https://picsum.photos/500/300?random=12',
      'https://picsum.photos/500/300?random=13'
    ],
    amenities: ['WiFi', 'Fireplace', 'Restaurant', 'Ski Storage'],
    description: 'Cozy mountain lodge with breathtaking views.',
    short_description: 'Cozy mountain lodge with breathtaking views.',
  },
];

const sampleBookings = [
  {
    type: 'trip',
    tripTitle: 'Amazing Beach Adventure',
    tripId: 'trip-1',
    userId: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    selectedDate: '2024-07-15',
    numberOfParticipants: 2,
    totalPrice: 1198,
    status: 'pending',
    paymentStatus: 'pending',
  },
  {
    type: 'hotel',
    hotelName: 'Luxury Beach Resort',
    hotelId: 'hotel-1',
    userId: 'user-2',
    firstName: 'Sarah',
    lastName: 'Smith',
    email: 'sarah.smith@example.com',
    phone: '+1-555-0125',
    checkInDate: '2024-08-10',
    checkOutDate: '2024-08-15',
    numberOfGuests: 2,
    numberOfRooms: 1,
    numberOfNights: 5,
    totalPrice: 1495,
    status: 'confirmed',
    paymentStatus: 'paid',
  },
];

export const seedFirebase = async () => {
  try {
    console.log('🌱 Starting Firebase seeding...');

    // Seed trips
    console.log('📍 Seeding trips...');
    for (const trip of sampleTrips) {
      try {
        const result = await tripsAPI.create(trip);
        console.log('✅ Trip created:', trip.title);
      } catch (error) {
        console.error('❌ Error creating trip:', trip.title, error);
      }
    }

    // Seed hotels
    console.log('🏨 Seeding hotels...');
    for (const hotel of sampleHotels) {
      try {
        const result = await hotelsAPI.create(hotel);
        console.log('✅ Hotel created:', hotel.name);
      } catch (error) {
        console.error('❌ Error creating hotel:', hotel.name, error);
      }
    }

    // Seed bookings
    console.log('📋 Seeding bookings...');
    for (const booking of sampleBookings) {
      try {
        const result = await bookingsAPI.create(booking);
        console.log('✅ Booking created:', booking.email);
      } catch (error) {
        console.error('❌ Error creating booking:', booking.email, error);
      }
    }

    console.log('🎉 Firebase seeding completed!');
    return { success: true, message: 'Firebase seeded successfully' };
  } catch (error) {
    console.error('❌ Firebase seeding failed:', error);
    return { success: false, error: error.message };
  }
};

// Function to clear all data (for testing)
export const clearFirebase = async () => {
  try {
    console.log('🗑️ Clearing Firebase data...');
    // Note: This would require admin functions to delete collections
    // For now, just log the intent
    console.log('⚠️ Clear function not implemented - requires admin functions');
    return { success: false, message: 'Clear function not implemented' };
  } catch (error) {
    console.error('❌ Error clearing Firebase:', error);
    return { success: false, error: error.message };
  }
};

export default { seedFirebase, clearFirebase };
