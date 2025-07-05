import { collection, doc, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Sample hotel data
const sampleHotel = {
  id: 'luxury-beach-resort',
  name: 'Luxury Beach Resort',
  slug: 'luxury-beach-resort',
  description: 'Experience ultimate luxury at our beachfront resort with stunning ocean views, world-class amenities, and exceptional service. Perfect for romantic getaways and family vacations.',
  location: 'Maldives',
  address: 'North Male Atoll, Maldives',
  pricePerNight: 850,
  currency: 'USD',
  
  // Images
  mainImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  images: [
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
  ],
  
  // Amenities
  amenities: [
    'Free WiFi',
    'Private Beach',
    'Infinity Pool',
    'Spa & Wellness Center',
    'Fine Dining Restaurant',
    'Water Sports',
    'Fitness Center',
    'Room Service',
    'Airport Transfer',
    'Concierge Service'
  ],
  
  // Room Types
  roomTypes: {
    'Beach Villa': {
      description: 'Spacious villa with direct beach access and private terrace',
      price: 850,
      features: ['Ocean View', 'Private Terrace', 'King Bed', 'Mini Bar', 'Beach Access']
    },
    'Overwater Bungalow': {
      description: 'Iconic overwater bungalow with glass floor and direct lagoon access',
      price: 1200,
      features: ['Glass Floor', 'Lagoon Access', 'Private Deck', 'Outdoor Shower', 'Snorkeling Gear']
    }
  },
  
  // Status and metadata
  isActive: true,
  featured: true,
  category: 'luxury',
  tags: ['beach', 'luxury', 'overwater', 'spa', 'diving', 'honeymoon', 'romantic'],
  
  // Timestamps
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date()
};

// Sample trip data
const sampleTrip = {
  id: 'amazing-safari-adventure',
  title: 'Amazing Safari Adventure in Kenya',
  slug: 'amazing-safari-adventure',
  description: 'Discover African wildlife in this amazing adventure. See lions, elephants, and more in their natural habitat with professional guides.',
  location: 'Kenya, Africa',
  destination: 'Masai Mara National Reserve',
  price: 2499,
  duration: 7,
  maxGroupSize: 12,
  difficulty: 'متوسط',
  
  // Images
  mainImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  images: [
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
  ],
  
  highlights: [
    'Big Five wildlife viewing',
    'Professional safari guide',
    'Luxury camping',
    'All meals included',
    'Airport transfers'
  ],
  
  // Status and metadata
  isActive: true,
  featured: true,
  category: 'safari',
  tags: ['safari', 'wildlife', 'africa', 'adventure', 'nature', 'photography'],
  
  // Timestamps
  createdAt: new Date('2024-01-10T08:00:00Z'),
  updatedAt: new Date()
};

// Sample reviews data
const sampleReviews = [
  {
    itemId: 'luxury-beach-resort',
    itemType: 'hotel',
    itemTitle: 'Luxury Beach Resort',
    userId: 'sample_user_1',
    userName: 'John Smith',
    userEmail: 'john@example.com',
    userPhoto: null,
    rating: 5,
    title: 'Unforgettable Experience',
    comment: 'Amazing resort in every way! Excellent service and stunning location. Highly recommend for honeymoons.',
    helpful: 5,
    reported: false,
    createdAt: new Date('2024-01-16T10:00:00Z'),
    updatedAt: new Date('2024-01-16T10:00:00Z')
  },
  {
    itemId: 'luxury-beach-resort',
    itemType: 'hotel',
    itemTitle: 'Luxury Beach Resort',
    userId: 'sample_user_2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah@example.com',
    userPhoto: null,
    rating: 4,
    title: 'Beautiful Stay',
    comment: 'Really enjoyed our stay. Delicious food and excellent facilities. Only downside was the WiFi was a bit slow.',
    helpful: 3,
    reported: false,
    createdAt: new Date('2024-01-17T14:30:00Z'),
    updatedAt: new Date('2024-01-17T14:30:00Z')
  },
  {
    itemId: 'luxury-beach-resort',
    itemType: 'hotel',
    itemTitle: 'Luxury Beach Resort',
    userId: 'sample_user_3',
    userName: 'Mike Wilson',
    userEmail: 'mike@example.com',
    userPhoto: null,
    rating: 5,
    title: 'True Luxury',
    comment: 'Resort worth every penny spent. The overwater bungalow was a real dream. Thanks to the amazing team.',
    helpful: 8,
    reported: false,
    createdAt: new Date('2024-01-18T09:15:00Z'),
    updatedAt: new Date('2024-01-18T09:15:00Z')
  },
  {
    itemId: 'amazing-safari-adventure',
    itemType: 'trip',
    itemTitle: 'Amazing Safari Adventure in Kenya',
    userId: 'sample_user_4',
    userName: 'Emma Davis',
    userEmail: 'emma@example.com',
    userPhoto: null,
    rating: 5,
    title: 'Adventure of a Lifetime',
    comment: 'Unforgettable safari trip! We saw lions and elephants up close. The guide was expert and enthusiastic. Recommend this experience to everyone.',
    helpful: 12,
    reported: false,
    createdAt: new Date('2024-01-19T16:45:00Z'),
    updatedAt: new Date('2024-01-19T16:45:00Z')
  },
  {
    itemId: 'amazing-safari-adventure',
    itemType: 'trip',
    itemTitle: 'Amazing Safari Adventure in Kenya',
    userId: 'sample_user_5',
    userName: 'David Brown',
    userEmail: 'david@example.com',
    userPhoto: null,
    rating: 4,
    title: 'Amazing Experience',
    comment: 'Very enjoyable safari with stunning natural scenery. Food at the camp was good and accommodation comfortable. Just needed more time!',
    helpful: 6,
    reported: false,
    createdAt: new Date('2024-01-20T11:20:00Z'),
    updatedAt: new Date('2024-01-20T11:20:00Z')
  }
];

// Function to add sample hotel data
export const addSampleHotelData = async () => {
  try {
    console.log('🏨 Adding sample hotel data...');
    await setDoc(doc(db, 'hotels', sampleHotel.id), sampleHotel);
    console.log('✅ Sample hotel data added successfully!');
    return { success: true, hotel: sampleHotel };
  } catch (error) {
    console.error('❌ Error adding sample hotel data:', error);
    return { success: false, error: error.message };
  }
};

// Function to add sample trip data
export const addSampleTripData = async () => {
  try {
    console.log('🗺️ Adding sample trip data...');
    await setDoc(doc(db, 'trips', sampleTrip.id), sampleTrip);
    console.log('✅ Sample trip data added successfully!');
    return { success: true, trip: sampleTrip };
  } catch (error) {
    console.error('❌ Error adding sample trip data:', error);
    return { success: false, error: error.message };
  }
};

// Function to add sample reviews
export const addSampleReviews = async () => {
  try {
    console.log('⭐ Adding sample reviews...');
    
    const reviewsRef = collection(db, 'reviews');
    for (const review of sampleReviews) {
      await addDoc(reviewsRef, review);
    }
    
    console.log('✅ Sample reviews added successfully!');
    return { success: true, reviewsCount: sampleReviews.length };
  } catch (error) {
    console.error('❌ Error adding sample reviews:', error);
    return { success: false, error: error.message };
  }
};

// Function to setup all sample data
export const setupAllSampleData = async () => {
  console.log('🚀 Setting up all sample data...');
  
  try {
    // Add hotel data
    const hotelResult = await addSampleHotelData();
    if (!hotelResult.success) {
      return hotelResult;
    }
    
    // Add trip data
    const tripResult = await addSampleTripData();
    if (!tripResult.success) {
      return tripResult;
    }
    
    // Add reviews
    const reviewsResult = await addSampleReviews();
    if (!reviewsResult.success) {
      return reviewsResult;
    }
    
    console.log('🎉 All sample data setup completed!');
    return {
      success: true,
      message: 'All sample data added successfully',
      hotel: hotelResult.hotel,
      trip: tripResult.trip,
      reviewsCount: reviewsResult.reviewsCount
    };
  } catch (error) {
    console.error('❌ Error setting up sample data:', error);
    return { success: false, error: error.message };
  }
};

export default { 
  addSampleHotelData, 
  addSampleTripData, 
  addSampleReviews, 
  setupAllSampleData 
};
