// Initialize Firebase Collections with sample data
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc,
  serverTimestamp,
  writeBatch 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Sample data for all collections
const sampleData = {
  // Categories for trips and hotels
  categories: [
    {
      id: 'beach',
      name: 'Beach',
      description: 'Beautiful beach destinations',
      type: 'trip',
      icon: '🏖️',
      status: 'active'
    },
    {
      id: 'mountain',
      name: 'Mountain',
      description: 'Mountain adventures and hiking',
      type: 'trip',
      icon: '🏔️',
      status: 'active'
    },
    {
      id: 'cultural',
      name: 'Cultural',
      description: 'Cultural and historical tours',
      type: 'trip',
      icon: '🏛️',
      status: 'active'
    },
    {
      id: 'adventure',
      name: 'Adventure',
      description: 'Thrilling adventure activities',
      type: 'trip',
      icon: '🎯',
      status: 'active'
    },
    {
      id: 'luxury',
      name: 'Luxury',
      description: 'Luxury hotels and resorts',
      type: 'hotel',
      icon: '⭐',
      status: 'active'
    },
    {
      id: 'budget',
      name: 'Budget',
      description: 'Budget-friendly accommodations',
      type: 'hotel',
      icon: '💰',
      status: 'active'
    }
  ],

  // Sample trips
  trips: [
    {
      title: 'Amazing Beach Adventure',
      slug: 'amazing-beach-adventure',
      description: 'Experience the most beautiful beaches with crystal clear waters and white sand. This unforgettable journey will take you to pristine locations where you can relax, swim, and enjoy water sports.',
      short_description: 'Beautiful beaches with crystal clear waters',
      price: 599,
      duration_days: 7,
      max_participants: 20,
      status: 'active',
      main_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      gallery: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      location: 'Maldives',
      category_id: 'beach',
      category_name: 'Beach',
      difficulty_level: 'easy',
      featured: true,
      average_rating: 0,
      review_count: 0,
      view_count: 0,
      booking_count: 0
    },
    {
      title: 'Mountain Hiking Expedition',
      slug: 'mountain-hiking-expedition',
      description: 'Challenge yourself with breathtaking mountain trails and stunning panoramic views. This expedition will test your limits while rewarding you with unforgettable scenery.',
      short_description: 'Breathtaking mountain trails and stunning views',
      price: 799,
      duration_days: 5,
      max_participants: 15,
      status: 'active',
      main_image: 'https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      gallery: [
        'https://images.unsplash.com/photo-1464822759844-d150baec0494?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      location: 'Swiss Alps',
      category_id: 'mountain',
      category_name: 'Mountain',
      difficulty_level: 'hard',
      featured: true,
      average_rating: 0,
      review_count: 0,
      view_count: 0,
      booking_count: 0
    },
    {
      title: 'Cultural Heritage Tour',
      slug: 'cultural-heritage-tour',
      description: 'Immerse yourself in rich history and vibrant culture of ancient cities. Discover architectural marvels, local traditions, and historical significance.',
      short_description: 'Rich history and vibrant culture exploration',
      price: 449,
      duration_days: 4,
      max_participants: 25,
      status: 'active',
      main_image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      gallery: [
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      location: 'Rome, Italy',
      category_id: 'cultural',
      category_name: 'Cultural',
      difficulty_level: 'easy',
      featured: false,
      average_rating: 0,
      review_count: 0,
      view_count: 0,
      booking_count: 0
    },
    {
      title: 'Discover the Wonders of Petra',
      slug: 'discover-the-wonders-of-petra',
      description: 'Journey through time as you explore the ancient city of Petra, one of the New Seven Wonders of the World. Walk through the narrow Siq canyon, marvel at the Treasury facade, and discover the rich history of the Nabataean civilization. This unforgettable adventure combines archaeology, history, and breathtaking landscapes in Jordan\'s most famous archaeological site.',
      short_description: 'Explore the ancient city of Petra, one of the New Seven Wonders',
      price: 899,
      duration_days: 6,
      max_participants: 18,
      status: 'active',
      main_image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80'
      ],
      gallery: [
        'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80'
      ],
      location: 'Petra, Jordan',
      category_id: 'cultural',
      category_name: 'Cultural',
      difficulty_level: 'moderate',
      featured: true,
      average_rating: 0,
      review_count: 0,
      view_count: 0,
      booking_count: 0,
      itinerary: [
        {
          title: 'Arrival in Amman',
          description: 'Arrive at Queen Alia International Airport and transfer to your hotel in Amman. Evening orientation and welcome dinner.',
          activities: ['Airport transfer', 'Hotel check-in', 'Welcome dinner', 'Trip briefing']
        },
        {
          title: 'Amman to Petra',
          description: 'Morning drive to Petra via the Desert Highway. Check into your hotel and enjoy a traditional Jordanian lunch.',
          activities: ['Desert Highway drive', 'Hotel check-in', 'Traditional lunch', 'Rest and preparation']
        },
        {
          title: 'Petra Full Day Exploration',
          description: 'Full day exploring Petra including the Siq, Treasury, Royal Tombs, and Monastery. Professional guide included.',
          activities: ['Siq canyon walk', 'Treasury visit', 'Royal Tombs exploration', 'Monastery hike']
        },
        {
          title: 'Petra by Night & Little Petra',
          description: 'Experience the magical Petra by Night show and visit Little Petra (Siq al-Barid) in the afternoon.',
          activities: ['Little Petra visit', 'Petra by Night experience', 'Candlelit Treasury', 'Traditional music']
        },
        {
          title: 'Wadi Rum Desert',
          description: 'Day trip to Wadi Rum desert for jeep safari and Bedouin camp experience with traditional dinner.',
          activities: ['Wadi Rum jeep safari', 'Desert landscapes', 'Bedouin camp', 'Traditional dinner']
        },
        {
          title: 'Departure',
          description: 'Morning at leisure, then transfer to Amman airport for departure or extend your stay.',
          activities: ['Free time', 'Souvenir shopping', 'Airport transfer', 'Departure']
        }
      ],
      included_services: [
        'Professional English-speaking guide',
        '5 nights accommodation (4-star hotels)',
        'All transfers and transportation',
        'Daily breakfast and 3 dinners',
        'Petra entrance fees (2 days)',
        'Petra by Night ticket',
        'Wadi Rum jeep safari',
        'All taxes and service charges'
      ],
      excluded_services: [
        'International flights',
        'Travel insurance',
        'Lunches (except mentioned)',
        'Personal expenses',
        'Tips and gratuities',
        'Optional activities',
        'Visa fees',
        'Alcoholic beverages'
      ],
      departure_dates: [
        '2024-03-15',
        '2024-03-29',
        '2024-04-12',
        '2024-04-26',
        '2024-05-10',
        '2024-05-24',
        '2024-06-07',
        '2024-06-21'
      ]
    }
  ],

  // Sample hotels
  hotels: [
    {
      name: 'Luxury Beach Resort',
      slug: 'luxury-beach-resort',
      location: 'Miami Beach, FL',
      address: '123 Ocean Drive, Miami Beach, FL 33139',
      price_per_night: 299,
      star_rating: 5,
      status: 'active',
      rooms_available: 45,
      total_rooms: 120,
      average_rating: 0,
      review_count: 0,
      main_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      gallery: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Beach Access'],
      description: 'Experience luxury at its finest with our beachfront resort featuring world-class amenities and stunning ocean views.',
      short_description: 'Luxury beachfront resort with world-class amenities.',
      category_id: 'luxury',
      category_name: 'Luxury',
      featured: true,
      view_count: 0,
      booking_count: 0
    },
    {
      name: 'Mountain View Lodge',
      slug: 'mountain-view-lodge',
      location: 'Aspen, CO',
      address: '456 Mountain Road, Aspen, CO 81611',
      price_per_night: 189,
      star_rating: 4,
      status: 'active',
      rooms_available: 12,
      total_rooms: 80,
      average_rating: 0,
      review_count: 0,
      main_image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      gallery: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      amenities: ['WiFi', 'Fireplace', 'Restaurant', 'Ski Storage', 'Mountain Views'],
      description: 'Cozy mountain lodge with breathtaking views and rustic charm, perfect for winter getaways.',
      short_description: 'Cozy mountain lodge with breathtaking views.',
      category_id: 'budget',
      category_name: 'Budget',
      featured: true,
      view_count: 0,
      booking_count: 0
    }
  ]
};

// Initialize all Firebase collections
export const initializeFirebaseCollections = async () => {
  try {
    console.log('🔥 Initializing Firebase collections...');
    
    const batch = writeBatch(db);
    let operationCount = 0;

    // Create categories
    console.log('📂 Creating categories...');
    for (const category of sampleData.categories) {
      const categoryRef = doc(db, 'categories', category.id);
      batch.set(categoryRef, {
        ...category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      operationCount++;
    }

    // Commit categories first
    if (operationCount > 0) {
      await batch.commit();
      console.log(`✅ Created ${operationCount} categories`);
    }

    // Create trips
    console.log('🗺️ Creating trips...');
    for (const trip of sampleData.trips) {
      const tripRef = await addDoc(collection(db, 'trips'), {
        ...trip,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Created trip: ${trip.title} (${tripRef.id})`);
    }

    // Create hotels
    console.log('🏨 Creating hotels...');
    for (const hotel of sampleData.hotels) {
      const hotelRef = await addDoc(collection(db, 'hotels'), {
        ...hotel,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Created hotel: ${hotel.name} (${hotelRef.id})`);
    }

    console.log('🎉 All Firebase collections initialized successfully!');
    return { success: true, message: 'Firebase collections initialized' };

  } catch (error) {
    console.error('❌ Error initializing Firebase collections:', error);
    return { success: false, error: error.message };
  }
};

export default { initializeFirebaseCollections };
