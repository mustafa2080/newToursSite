import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test 1: Check if db is initialized
    if (!db) {
      throw new Error('Firestore is not initialized');
    }
    console.log('✅ Firestore instance exists');
    
    // Test 2: Try to read from a collection (this will create it if it doesn't exist)
    console.log('📖 Testing read operation...');
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    console.log('✅ Read operation successful. Documents found:', snapshot.size);
    
    // Test 3: Try to write to the collection
    console.log('✍️ Testing write operation...');
    const testDoc = {
      message: 'Firebase connection test',
      timestamp: serverTimestamp(),
      testId: Math.random().toString(36).substr(2, 9)
    };
    
    const docRef = await addDoc(testCollection, testDoc);
    console.log('✅ Write operation successful. Document ID:', docRef.id);
    
    // Test 4: Read again to confirm write
    console.log('🔄 Testing read after write...');
    const newSnapshot = await getDocs(testCollection);
    console.log('✅ Read after write successful. Documents found:', newSnapshot.size);
    
    return {
      success: true,
      message: 'Firebase connection is working perfectly!',
      details: {
        canRead: true,
        canWrite: true,
        documentsFound: newSnapshot.size,
        lastTestDocId: docRef.id
      }
    };
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return {
      success: false,
      message: 'Firebase connection failed',
      error: error.message,
      details: {
        canRead: false,
        canWrite: false,
        errorCode: error.code || 'unknown'
      }
    };
  }
};

// Add sample data directly
export const addSampleDataDirect = async () => {
  try {
    console.log('🌱 Adding sample data directly to Firebase...');
    
    // Add a trip
    const tripData = {
      title: 'Amazing Beach Adventure',
      slug: 'amazing-beach-adventure',
      description: 'Experience the most beautiful beaches with crystal clear waters and white sand. This amazing adventure will take you to pristine locations where you can relax, swim, and enjoy water sports.',
      shortDescription: 'Beautiful beaches with crystal clear waters',
      price: 599,
      durationDays: 7,
      maxParticipants: 20,
      status: 'active',
      mainImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      location: 'Maldives',
      categoryId: 'beach',
      categoryName: 'Beach',
      difficultyLevel: 'easy',
      featured: true,
      averageRating: 4.8,
      reviewCount: 124,
      viewCount: 0,
      bookingCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const tripRef = await addDoc(collection(db, 'trips'), tripData);
    console.log('✅ Trip added with ID:', tripRef.id);

    // Add a hotel
    const hotelData = {
      name: 'Luxury Beach Resort',
      slug: 'luxury-beach-resort',
      location: 'Miami Beach, FL',
      address: '123 Ocean Drive, Miami Beach, FL 33139',
      pricePerNight: 299,
      starRating: 5,
      status: 'active',
      roomsAvailable: 45,
      totalRooms: 120,
      averageRating: 4.8,
      reviewCount: 234,
      mainImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Beach Access'],
      description: 'Experience luxury at its finest with our beachfront resort featuring world-class amenities and stunning ocean views.',
      shortDescription: 'Luxury beachfront resort with world-class amenities.',
      categoryId: 'luxury',
      categoryName: 'Luxury',
      featured: true,
      viewCount: 0,
      bookingCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const hotelRef = await addDoc(collection(db, 'hotels'), hotelData);
    console.log('✅ Hotel added with ID:', hotelRef.id);

    // Add a category
    const categoryData = {
      name: 'Beach',
      slug: 'beach',
      description: 'Relaxing coastal getaways',
      icon: '🏖️',
      type: 'trip',
      status: 'active',
      tripCount: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const categoryRef = await addDoc(collection(db, 'categories'), categoryData);
    console.log('✅ Category added with ID:', categoryRef.id);

    // Add a booking
    const bookingData = {
      tripId: tripRef.id,
      tripTitle: 'Amazing Beach Adventure',
      userId: 'user123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      totalAmount: 599,
      status: 'confirmed',
      bookingDate: new Date('2024-03-15'),
      participants: 2,
      specialRequests: 'Vegetarian meals',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);
    console.log('✅ Booking added with ID:', bookingRef.id);

    return {
      success: true,
      message: 'Sample data added successfully!',
      data: {
        tripId: tripRef.id,
        hotelId: hotelRef.id,
        categoryId: categoryRef.id,
        bookingId: bookingRef.id
      }
    };

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    return {
      success: false,
      message: 'Failed to add sample data',
      error: error.message
    };
  }
};

// Check collections
export const checkCollections = async () => {
  try {
    console.log('📊 Checking Firebase collections...');
    
    const collections = ['trips', 'hotels', 'categories', 'bookings', 'reviews', 'users'];
    const results = {};
    
    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        results[collectionName] = {
          exists: true,
          count: snapshot.size,
          documents: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        };
        console.log(`✅ ${collectionName}: ${snapshot.size} documents`);
      } catch (error) {
        results[collectionName] = {
          exists: false,
          count: 0,
          error: error.message
        };
        console.log(`❌ ${collectionName}: Error - ${error.message}`);
      }
    }
    
    return {
      success: true,
      collections: results,
      totalCollections: Object.keys(results).length,
      totalDocuments: Object.values(results).reduce((sum, col) => sum + (col.count || 0), 0)
    };
    
  } catch (error) {
    console.error('❌ Error checking collections:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
