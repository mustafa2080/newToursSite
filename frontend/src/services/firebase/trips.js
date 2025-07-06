import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const TRIPS_COLLECTION = 'trips';

// Create a new trip
export const createTrip = async (tripData) => {
  try {
    const trip = {
      ...tripData,
      slug: generateSlug(tripData.title),
      featured: tripData.featured || false,
      status: tripData.status || 'active',
      averageRating: 0,
      reviewCount: 0,
      bookingCount: 0,
      viewCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, TRIPS_COLLECTION), trip);
    
    return {
      success: true,
      id: docRef.id,
      trip: { id: docRef.id, ...trip },
    };
  } catch (error) {
    console.error('Create trip error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get trip by ID or slug
export const getTrip = async (identifier) => {
  try {
    let tripDoc;
    
    // Check if identifier is a document ID (length check for Firestore ID)
    if (identifier.length === 20) {
      const tripRef = doc(db, TRIPS_COLLECTION, identifier);
      tripDoc = await getDoc(tripRef);
    } else {
      // Search by slug
      const q = query(
        collection(db, TRIPS_COLLECTION),
        where('slug', '==', identifier),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      tripDoc = querySnapshot.docs[0];
    }

    if (!tripDoc || !tripDoc.exists()) {
      return {
        success: false,
        error: 'Trip not found',
      };
    }

    // Increment view count
    await updateDoc(tripDoc.ref, {
      viewCount: increment(1),
    });

    return {
      success: true,
      trip: {
        id: tripDoc.id,
        ...tripDoc.data(),
      },
    };
  } catch (error) {
    console.error('Get trip error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get all trips with filters and pagination
export const getTrips = async (filters = {}) => {
  try {
    console.log('🗺️ Getting trips from Firebase...', filters);

    let q = collection(db, TRIPS_COLLECTION);
    const constraints = [];

    // Very simple query without any complex filters to avoid index issues
    const { pageSize = 50 } = filters;

    // Only use simple limit without any where clauses or orderBy
    constraints.push(limit(pageSize));

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const querySnapshot = await getDocs(q);

    let trips = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    }));

    // Client-side filters for all filtering (no Firebase indexes needed)
    const { search, category, minPrice, maxPrice, difficulty, status, featured } = filters;

    // Filter by status (only if explicitly provided)
    if (status && status !== '') {
      trips = trips.filter(trip => trip.status === status);
    }

    // Filter by featured
    if (featured !== undefined) {
      const isFeatured = featured === 'true' || featured === true;
      trips = trips.filter(trip => trip.featured === isFeatured);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      trips = trips.filter(trip =>
        trip.title?.toLowerCase().includes(searchLower) ||
        trip.description?.toLowerCase().includes(searchLower) ||
        trip.location?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (category) {
      trips = trips.filter(trip => trip.category_id === category);
    }

    // Filter by price range
    if (minPrice) {
      trips = trips.filter(trip => trip.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      trips = trips.filter(trip => trip.price <= parseFloat(maxPrice));
    }

    // Filter by difficulty
    if (difficulty) {
      trips = trips.filter(trip => trip.difficulty_level === difficulty);
    }

    // Sort by title (client-side)
    trips.sort((a, b) => a.title?.localeCompare(b.title) || 0);

    console.log(`✅ Found ${trips.length} trips`);

    return {
      success: true,
      trips,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === pageSize,
    };

    /*
    // Uncomment this code after creating the required indexes in Firebase Console
    // You need to create a composite index for: status (Ascending) + createdAt (Descending)

    const {
      search,
      category,
      minPrice,
      maxPrice,
      difficulty,
      featured,
      status = 'active',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      pageSize = 20,
      lastDoc = null,
    } = filters;

    let q = collection(db, TRIPS_COLLECTION);
    const constraints = [];

    // Add filters
    if (status) {
      constraints.push(where('status', '==', status));
    }

    if (category) {
      constraints.push(where('categoryId', '==', category));
    }

    if (difficulty) {
      constraints.push(where('difficultyLevel', '==', difficulty));
    }

    if (featured !== undefined) {
      constraints.push(where('featured', '==', featured === 'true'));
    }

    if (minPrice) {
      constraints.push(where('price', '>=', parseFloat(minPrice)));
    }

    if (maxPrice) {
      constraints.push(where('price', '<=', parseFloat(maxPrice)));
    }

    // Add sorting
    constraints.push(orderBy(sortBy, sortOrder));

    // Add pagination
    constraints.push(limit(pageSize));

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);

    let trips = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side search filter (Firestore doesn't support full-text search)
    if (search) {
      const searchLower = search.toLowerCase();
      trips = trips.filter(trip =>
        trip.title?.toLowerCase().includes(searchLower) ||
        trip.description?.toLowerCase().includes(searchLower) ||
        trip.shortDescription?.toLowerCase().includes(searchLower)
      );
    }

    return {
      success: true,
      trips,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === pageSize,
    };
    */
  } catch (error) {
    console.error('Get trips error:', error);
    return {
      success: false,
      error: error.message,
      trips: [], // Always return empty array
    };
  }
};

// Get featured trips
export const getFeaturedTrips = async (limitCount = 6) => {
  try {
    console.log('🌟 Getting featured trips from Firebase...');

    // Get all trips first (simple query without indexes)
    const q = query(collection(db, TRIPS_COLLECTION), limit(50));
    const querySnapshot = await getDocs(q);

    let trips = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    }));

    // Client-side filtering for featured trips
    const featuredTrips = trips.filter(trip =>
      trip.featured === true && trip.status === 'active'
    );

    // Sort by creation date (newest first)
    featuredTrips.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB - dateA;
    });

    console.log(`✅ Found ${featuredTrips.length} featured trips`);

    return {
      success: true,
      trips: featuredTrips.slice(0, limitCount),
    };
  } catch (error) {
    console.error('Get featured trips error:', error);
    return {
      success: false,
      error: error.message,
      trips: [], // Return empty array on error
    };
  }
};

// Update trip
export const updateTrip = async (tripId, updateData) => {
  try {
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    
    const updatedData = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };

    // Update slug if title changed
    if (updateData.title) {
      updatedData.slug = generateSlug(updateData.title);
    }

    await updateDoc(tripRef, updatedData);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update trip error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete trip
export const deleteTrip = async (tripId) => {
  try {
    await deleteDoc(doc(db, TRIPS_COLLECTION, tripId));
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete trip error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Toggle featured status
export const toggleTripFeatured = async (tripId) => {
  try {
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    const tripDoc = await getDoc(tripRef);
    
    if (!tripDoc.exists()) {
      throw new Error('Trip not found');
    }

    const currentFeatured = tripDoc.data().featured || false;
    
    await updateDoc(tripRef, {
      featured: !currentFeatured,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      featured: !currentFeatured,
    };
  } catch (error) {
    console.error('Toggle featured error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Add review to trip
export const addTripReview = async (tripId, reviewData) => {
  try {
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    
    // Add review to reviews collection
    const reviewDoc = {
      tripId,
      ...reviewData,
      createdAt: serverTimestamp(),
    };
    
    const reviewRef = await addDoc(collection(db, 'reviews'), reviewDoc);
    
    // Update trip rating and review count
    const tripDoc = await getDoc(tripRef);
    const tripData = tripDoc.data();
    
    const currentRating = tripData.averageRating || 0;
    const currentCount = tripData.reviewCount || 0;
    const newCount = currentCount + 1;
    const newRating = ((currentRating * currentCount) + reviewData.rating) / newCount;
    
    await updateDoc(tripRef, {
      averageRating: newRating,
      reviewCount: newCount,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      reviewId: reviewRef.id,
    };
  } catch (error) {
    console.error('Add review error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get trip statistics
export const getTripStats = async () => {
  try {
    const q = query(collection(db, TRIPS_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    let stats = {
      total: 0,
      active: 0,
      featured: 0,
      draft: 0,
      totalViews: 0,
      totalBookings: 0,
    };

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      stats.total++;
      
      if (data.status === 'active') stats.active++;
      if (data.featured) stats.featured++;
      if (data.status === 'draft') stats.draft++;
      
      stats.totalViews += data.viewCount || 0;
      stats.totalBookings += data.bookingCount || 0;
    });

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error('Get trip stats error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};
