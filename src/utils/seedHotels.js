// Seed Firebase with sample hotels for testing
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const sampleHotels = [
  {
    name: 'Luxury Beach Resort',
    slug: 'luxury-beach-resort',
    description: 'Experience ultimate luxury at our beachfront resort with stunning ocean views, world-class amenities, and exceptional service. Perfect for romantic getaways and family vacations.',
    shortDescription: 'Luxury beachfront resort with stunning ocean views',
    location: 'Maldives',
    address: 'North Male Atoll, Maldives',
    pricePerNight: 450,
    price_per_night: 450,
    starRating: 5,
    star_rating: 5,
    status: 'active',
    featured: true,
    mainImage: 'https://picsum.photos/800/500?random=100',
    main_image: 'https://picsum.photos/800/500?random=100',
    images: [
      'https://picsum.photos/800/500?random=100',
      'https://picsum.photos/800/500?random=101',
      'https://picsum.photos/800/500?random=102',
      'https://picsum.photos/800/500?random=103'
    ],
    gallery: [
      'https://picsum.photos/800/500?random=100',
      'https://picsum.photos/800/500?random=101',
      'https://picsum.photos/800/500?random=102',
      'https://picsum.photos/800/500?random=103'
    ],
    totalRooms: 120,
    total_rooms: 120,
    roomsAvailable: 85,
    rooms_available: 85,
    checkInTime: '15:00',
    check_in_time: '15:00',
    checkOutTime: '11:00',
    check_out_time: '11:00',
    amenities: [
      'Free WiFi',
      'Swimming Pool',
      'Spa & Wellness Center',
      'Private Beach',
      'Restaurant',
      'Bar',
      'Room Service',
      'Fitness Center',
      'Water Sports',
      'Airport Transfer'
    ],
    room_types: {
      'standard': {
        name: 'Standard Ocean View',
        price: 450,
        description: 'Comfortable room with ocean view',
        amenities: ['Ocean View', 'King Bed', 'Private Balcony', 'Mini Bar']
      },
      'deluxe': {
        name: 'Deluxe Suite',
        price: 650,
        description: 'Spacious suite with premium amenities',
        amenities: ['Ocean View', 'King Bed', 'Living Area', 'Private Balcony', 'Mini Bar', 'Butler Service']
      },
      'villa': {
        name: 'Private Villa',
        price: 1200,
        description: 'Exclusive villa with private pool',
        amenities: ['Ocean View', 'King Bed', 'Private Pool', 'Living Area', 'Kitchen', 'Butler Service']
      }
    },
    policies: {
      cancellation: 'Free cancellation up to 24 hours before check-in',
      pets: 'Pets not allowed',
      smoking: 'Non-smoking property',
      children: 'Children of all ages welcome'
    }
  },
  {
    name: 'Mountain View Lodge',
    slug: 'mountain-view-lodge',
    description: 'Cozy mountain lodge nestled in the Swiss Alps, offering breathtaking mountain views, hiking trails, and authentic alpine experience. Perfect for adventure seekers and nature lovers.',
    shortDescription: 'Cozy alpine lodge with stunning mountain views',
    location: 'Swiss Alps, Switzerland',
    address: 'Zermatt, Switzerland',
    pricePerNight: 280,
    price_per_night: 280,
    starRating: 4,
    star_rating: 4,
    status: 'active',
    featured: false,
    mainImage: 'https://picsum.photos/800/500?random=200',
    main_image: 'https://picsum.photos/800/500?random=200',
    images: [
      'https://picsum.photos/800/500?random=200',
      'https://picsum.photos/800/500?random=201',
      'https://picsum.photos/800/500?random=202',
      'https://picsum.photos/800/500?random=203'
    ],
    gallery: [
      'https://picsum.photos/800/500?random=200',
      'https://picsum.photos/800/500?random=201',
      'https://picsum.photos/800/500?random=202',
      'https://picsum.photos/800/500?random=203'
    ],
    totalRooms: 45,
    total_rooms: 45,
    roomsAvailable: 32,
    rooms_available: 32,
    checkInTime: '14:00',
    check_in_time: '14:00',
    checkOutTime: '10:00',
    check_out_time: '10:00',
    amenities: [
      'Free WiFi',
      'Restaurant',
      'Bar',
      'Ski Storage',
      'Hiking Trails',
      'Mountain Bike Rental',
      'Fireplace Lounge',
      'Spa Services',
      'Parking',
      'Pet Friendly'
    ],
    room_types: {
      'standard': {
        name: 'Standard Mountain Room',
        price: 280,
        description: 'Comfortable room with mountain view',
        amenities: ['Mountain View', 'Queen Bed', 'Balcony', 'Heating']
      },
      'suite': {
        name: 'Alpine Suite',
        price: 420,
        description: 'Spacious suite with panoramic mountain views',
        amenities: ['Panoramic View', 'King Bed', 'Living Area', 'Fireplace', 'Balcony']
      }
    },
    policies: {
      cancellation: 'Free cancellation up to 48 hours before check-in',
      pets: 'Pets allowed with additional fee',
      smoking: 'Designated smoking areas',
      children: 'Children welcome, cribs available'
    }
  },
  {
    name: 'City Center Business Hotel',
    slug: 'city-center-business-hotel',
    description: 'Modern business hotel in the heart of the city, featuring state-of-the-art conference facilities, high-speed internet, and convenient access to business districts and attractions.',
    shortDescription: 'Modern business hotel in city center',
    location: 'New York City, USA',
    address: 'Manhattan, New York, NY',
    pricePerNight: 320,
    price_per_night: 320,
    starRating: 4,
    star_rating: 4,
    status: 'active',
    featured: true,
    mainImage: 'https://picsum.photos/800/500?random=300',
    main_image: 'https://picsum.photos/800/500?random=300',
    images: [
      'https://picsum.photos/800/500?random=300',
      'https://picsum.photos/800/500?random=301',
      'https://picsum.photos/800/500?random=302',
      'https://picsum.photos/800/500?random=303'
    ],
    gallery: [
      'https://picsum.photos/800/500?random=300',
      'https://picsum.photos/800/500?random=301',
      'https://picsum.photos/800/500?random=302',
      'https://picsum.photos/800/500?random=303'
    ],
    totalRooms: 200,
    total_rooms: 200,
    roomsAvailable: 156,
    rooms_available: 156,
    checkInTime: '15:00',
    check_in_time: '15:00',
    checkOutTime: '12:00',
    check_out_time: '12:00',
    amenities: [
      'Free WiFi',
      'Business Center',
      'Conference Rooms',
      'Fitness Center',
      'Restaurant',
      'Bar',
      'Room Service',
      'Concierge',
      'Valet Parking',
      'Airport Shuttle'
    ],
    room_types: {
      'standard': {
        name: 'Business Room',
        price: 320,
        description: 'Modern room with business amenities',
        amenities: ['City View', 'King Bed', 'Work Desk', 'High-Speed WiFi', 'Coffee Machine']
      },
      'executive': {
        name: 'Executive Suite',
        price: 480,
        description: 'Premium suite with executive lounge access',
        amenities: ['City View', 'King Bed', 'Living Area', 'Executive Lounge Access', 'Work Desk']
      },
      'penthouse': {
        name: 'Penthouse Suite',
        price: 850,
        description: 'Luxury penthouse with panoramic city views',
        amenities: ['Panoramic View', 'King Bed', 'Living Room', 'Kitchen', 'Private Terrace']
      }
    },
    policies: {
      cancellation: 'Free cancellation up to 6 hours before check-in',
      pets: 'Service animals only',
      smoking: 'Non-smoking property',
      children: 'Children welcome, connecting rooms available'
    }
  }
];

export const seedHotels = async () => {
  try {
    console.log('🌱 Starting to seed hotels...');
    
    const hotelsCollection = collection(db, 'hotels');
    const results = [];
    
    for (const hotelData of sampleHotels) {
      const hotelWithTimestamp = {
        ...hotelData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        averageRating: 0,
        average_rating: 0,
        reviewCount: 0,
        review_count: 0,
        bookingCount: 0,
        booking_count: 0,
        viewCount: 0,
        view_count: 0
      };
      
      const docRef = await addDoc(hotelsCollection, hotelWithTimestamp);
      results.push({
        id: docRef.id,
        name: hotelData.name,
        slug: hotelData.slug
      });
      
      console.log(`✅ Added hotel: ${hotelData.name} (ID: ${docRef.id})`);
    }
    
    console.log('🎉 Successfully seeded all hotels!');
    console.log('📋 Created hotels:', results);
    
    return {
      success: true,
      hotels: results
    };
  } catch (error) {
    console.error('❌ Error seeding hotels:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to run seeding from browser console
window.seedHotels = seedHotels;
