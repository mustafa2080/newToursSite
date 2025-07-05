import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Sample hotel data for testing the rating system
const sampleHotel = {
  id: 'luxury-beach-resort',
  name: 'Luxury Beach Resort',
  slug: 'luxury-beach-resort',
  description: 'Experience ultimate luxury at our beachfront resort with stunning ocean views, world-class amenities, and exceptional service. Perfect for romantic getaways and family vacations.',
  location: 'Maldives',
  address: 'North Male Atoll, Maldives',
  pricePerNight: 850,
  price_per_night: 850,
  currency: 'USD',
  
  // Images
  mainImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  main_image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  images: [
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
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
  room_types: {
    'Beach Villa': {
      description: 'Spacious villa with direct beach access and private terrace',
      price: 850,
      features: ['Ocean View', 'Private Terrace', 'King Bed', 'Mini Bar', 'Beach Access']
    },
    'Overwater Bungalow': {
      description: 'Iconic overwater bungalow with glass floor and direct lagoon access',
      price: 1200,
      features: ['Glass Floor', 'Lagoon Access', 'Private Deck', 'Outdoor Shower', 'Snorkeling Gear']
    },
    'Presidential Suite': {
      description: 'Ultimate luxury suite with panoramic ocean views and private butler',
      price: 2500,
      features: ['Panoramic Views', 'Private Butler', 'Jacuzzi', 'Living Room', 'Dining Area']
    }
  },
  
  // Policies
  policies: {
    check_in: 'Check-in from 3:00 PM',
    check_out: 'Check-out until 12:00 PM',
    cancellation: 'Free cancellation up to 24 hours before arrival',
    children: 'Children of all ages are welcome',
    pets: 'Pets are not allowed',
    smoking: 'Non-smoking property'
  },
  
  // Status and metadata
  isActive: true,
  featured: true,
  category: 'luxury',
  tags: ['beach', 'luxury', 'overwater', 'spa', 'diving', 'honeymoon', 'romantic'],
  
  // Search optimization fields
  searchKeywords: [
    'luxury', 'beach', 'resort', 'maldives', 'overwater', 'villa', 'bungalow',
    'spa', 'diving', 'snorkeling', 'honeymoon', 'romantic', 'ocean', 'lagoon'
  ],
  searchText: 'luxury beach resort maldives overwater villa bungalow spa diving romantic honeymoon',
  
  // Timestamps
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date()
};

// Function to add the sample hotel data
export const addSampleHotelData = async () => {
  try {
    console.log('🏨 Adding sample hotel data...');
    
    // Add to hotels collection
    await setDoc(doc(db, 'hotels', sampleHotel.id), sampleHotel);
    
    console.log('✅ Sample hotel data added successfully!');
    console.log('Hotel ID:', sampleHotel.id);
    console.log('Hotel Name:', sampleHotel.name);
    
    return { success: true, hotel: sampleHotel };
  } catch (error) {
    console.error('❌ Error adding sample hotel data:', error);
    return { success: false, error: error.message };
  }
};

// Function to add sample ratings for testing
export const addSampleRatings = async () => {
  try {
    console.log('⭐ Adding sample ratings...');
    
    const sampleRatings = [
      {
        itemId: 'luxury-beach-resort',
        itemType: 'hotel',
        itemTitle: 'Luxury Beach Resort',
        userId: 'sample_user_1',
        userName: 'John Smith',
        userEmail: 'john@example.com',
        rating: 5,
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
        rating: 4,
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
        rating: 5,
        createdAt: new Date('2024-01-18T09:15:00Z'),
        updatedAt: new Date('2024-01-18T09:15:00Z')
      }
    ];
    
    // Add ratings to Firebase
    const ratingsRef = collection(db, 'ratings');
    for (const rating of sampleRatings) {
      await setDoc(doc(ratingsRef), rating);
    }
    
    console.log('✅ Sample ratings added successfully!');
    console.log(`Added ${sampleRatings.length} sample ratings`);
    
    return { success: true, ratingsCount: sampleRatings.length };
  } catch (error) {
    console.error('❌ Error adding sample ratings:', error);
    return { success: false, error: error.message };
  }
};

// Function to run both operations
export const setupSampleData = async () => {
  console.log('🚀 Setting up sample data for hotel...');
  
  const hotelResult = await addSampleHotelData();
  if (!hotelResult.success) {
    return hotelResult;
  }
  
  const ratingsResult = await addSampleRatings();
  if (!ratingsResult.success) {
    return ratingsResult;
  }
  
  console.log('🎉 All sample data setup completed!');
  return { 
    success: true, 
    message: 'Hotel and ratings data added successfully',
    hotel: hotelResult.hotel,
    ratingsCount: ratingsResult.ratingsCount
  };
};

export default { addSampleHotelData, addSampleRatings, setupSampleData };
