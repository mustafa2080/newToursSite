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
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const HOTELS_COLLECTION = 'hotels';

// Create a new hotel
export const createHotel = async (hotelData) => {
  try {
    const hotel = {
      ...hotelData,
      slug: generateSlug(hotelData.name),
      featured: hotelData.featured || false,
      status: hotelData.status || 'active',
      averageRating: 0,
      reviewCount: 0,
      bookingCount: 0,
      viewCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, HOTELS_COLLECTION), hotel);
    
    return {
      success: true,
      id: docRef.id,
      hotel: { id: docRef.id, ...hotel },
    };
  } catch (error) {
    console.error('Create hotel error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get hotel by ID or slug
export const getHotel = async (identifier) => {
  try {
    let hotelDoc;
    
    // Check if identifier is a document ID
    if (identifier.length === 20) {
      const hotelRef = doc(db, HOTELS_COLLECTION, identifier);
      hotelDoc = await getDoc(hotelRef);
    } else {
      // Search by slug
      const q = query(
        collection(db, HOTELS_COLLECTION),
        where('slug', '==', identifier),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      hotelDoc = querySnapshot.docs[0];
    }

    if (!hotelDoc || !hotelDoc.exists()) {
      return {
        success: false,
        error: 'Hotel not found',
      };
    }

    // Increment view count
    await updateDoc(hotelDoc.ref, {
      viewCount: increment(1),
    });

    return {
      success: true,
      hotel: {
        id: hotelDoc.id,
        ...hotelDoc.data(),
      },
    };
  } catch (error) {
    console.error('Get hotel error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get all hotels with filters and pagination
export const getHotels = async (filters = {}) => {
  try {
    console.log('🏨 Getting hotels from Firebase...', filters);

    let q = collection(db, HOTELS_COLLECTION);
    const constraints = [];

    // Very simple query without any complex filters to avoid index issues
    const { pageSize = 50 } = filters;

    // Only use simple limit without any where clauses or orderBy
    constraints.push(limit(pageSize));

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const querySnapshot = await getDocs(q);

    let hotels = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    }));

    // Filter for active hotels (include hotels without status)
    hotels = hotels.filter(hotel => hotel.status === 'active' || !hotel.status);

    console.log('🏨 Raw hotels from Firebase:', hotels.map(h => ({
      id: h.id,
      name: h.name,
      status: h.status,
      featured: h.featured
    })));

    // Client-side filters for all filtering (no Firebase indexes needed)
    const { search, category, minPrice, maxPrice, starRating, amenities, status, featured } = filters;

    console.log('🏨 Total hotels from Firebase:', hotels.length);
    console.log('🏨 Filters applied:', { search, category, minPrice, maxPrice, starRating, amenities, status, featured });

    // Filter by status (only if specified)
    if (status) {
      hotels = hotels.filter(hotel => hotel.status === status);
      console.log('🏨 After status filter:', hotels.length);
    }

    // Filter by featured
    if (featured !== undefined && featured !== '') {
      const isFeatured = featured === 'true' || featured === true;
      hotels = hotels.filter(hotel => hotel.featured === isFeatured);
      console.log('🏨 After featured filter:', hotels.length, 'Featured:', isFeatured);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      hotels = hotels.filter(hotel =>
        hotel.name?.toLowerCase().includes(searchLower) ||
        hotel.description?.toLowerCase().includes(searchLower) ||
        hotel.location?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (category) {
      hotels = hotels.filter(hotel => hotel.category_id === category);
    }

    // Filter by price range
    if (minPrice) {
      hotels = hotels.filter(hotel => {
        const price = hotel.pricePerNight || hotel.price_per_night || 0;
        return price >= parseFloat(minPrice);
      });
    }

    if (maxPrice) {
      hotels = hotels.filter(hotel => {
        const price = hotel.pricePerNight || hotel.price_per_night || 0;
        return price <= parseFloat(maxPrice);
      });
    }

    // Filter by star rating
    if (starRating) {
      hotels = hotels.filter(hotel => {
        const rating = hotel.starRating || hotel.star_rating || 0;
        return rating >= parseInt(starRating);
      });
    }

    // Filter by amenities
    if (amenities) {
      const amenityList = amenities.split(',').filter(a => a.trim());
      hotels = hotels.filter(hotel =>
        amenityList.every(amenity =>
          hotel.amenities?.some(hotelAmenity =>
            hotelAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        )
      );
    }

    // Sort by name (client-side)
    hotels.sort((a, b) => a.name?.localeCompare(b.name) || 0);

    console.log(`✅ Found ${hotels.length} hotels after all filters`);
    console.log('🏨 Final hotels:', hotels.map(h => ({
      id: h.id,
      name: h.name,
      status: h.status,
      featured: h.featured
    })));

    return {
      success: true,
      hotels,
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
      starRating,
      amenities,
      featured,
      status = 'active',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      pageSize = 20,
      lastDoc = null,
    } = filters;

    let q = collection(db, HOTELS_COLLECTION);
    const constraints = [];

    // Add filters
    if (status) {
      constraints.push(where('status', '==', status));
    }

    if (category) {
      constraints.push(where('categoryId', '==', category));
    }

    if (starRating) {
      constraints.push(where('starRating', '==', parseInt(starRating)));
    }

    if (featured !== undefined) {
      constraints.push(where('featured', '==', featured === 'true'));
    }

    if (minPrice) {
      constraints.push(where('pricePerNight', '>=', parseFloat(minPrice)));
    }

    if (maxPrice) {
      constraints.push(where('pricePerNight', '<=', parseFloat(maxPrice)));
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

    let hotels = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side filters
    if (search) {
      const searchLower = search.toLowerCase();
      hotels = hotels.filter(hotel =>
        hotel.name?.toLowerCase().includes(searchLower) ||
        hotel.description?.toLowerCase().includes(searchLower) ||
        hotel.city?.toLowerCase().includes(searchLower) ||
        hotel.address?.toLowerCase().includes(searchLower)
      );
    }

    if (amenities) {
      const amenityList = amenities.split(',').filter(a => a.trim());
      hotels = hotels.filter(hotel =>
        amenityList.every(amenity =>
          hotel.amenities?.some(hotelAmenity =>
            hotelAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        )
      );
    }

    return {
      success: true,
      hotels,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === pageSize,
    };
    */
  } catch (error) {
    console.error('Get hotels error:', error);
    return {
      success: false,
      error: error.message,
      hotels: [], // Always return empty array
    };
  }
};

// Get featured hotels
export const getFeaturedHotels = async (limitCount = 6) => {
  try {
    console.log('🏨 Getting featured hotels from Firebase...', limitCount);

    // Get all hotels and filter for featured ones
    let q = collection(db, HOTELS_COLLECTION);

    // Simple query without complex filters
    q = query(q, limit(50)); // Get more hotels to filter from

    const querySnapshot = await getDocs(q);

    let hotels = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    }));

    // Filter for active hotels first (include hotels without status)
    hotels = hotels.filter(hotel => hotel.status === 'active' || !hotel.status);

    // Sort featured hotels first, then by creation date
    hotels.sort((a, b) => {
      // Featured hotels come first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;

      // Then sort by creation date (newest first)
      const dateA = a.createdAt || new Date(0);
      const dateB = b.createdAt || new Date(0);
      return dateB - dateA;
    });

    // Limit results
    const featuredHotels = hotels.slice(0, limitCount);

    console.log(`✅ Found ${featuredHotels.length} hotels (${hotels.filter(h => h.featured).length} featured, ${hotels.length} total active)`);

    return {
      success: true,
      hotels: featuredHotels,
    };
  } catch (error) {
    console.error('Get featured hotels error:', error);
    return {
      success: false,
      error: error.message,
      hotels: [], // Return empty array on error
    };
  }
};

// Update hotel
export const updateHotel = async (hotelId, updateData) => {
  try {
    const hotelRef = doc(db, HOTELS_COLLECTION, hotelId);
    
    const updatedData = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };

    // Update slug if name changed
    if (updateData.name) {
      updatedData.slug = generateSlug(updateData.name);
    }

    await updateDoc(hotelRef, updatedData);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update hotel error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete hotel
export const deleteHotel = async (hotelId) => {
  try {
    await deleteDoc(doc(db, HOTELS_COLLECTION, hotelId));
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete hotel error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Toggle featured status
export const toggleHotelFeatured = async (hotelId) => {
  try {
    const hotelRef = doc(db, HOTELS_COLLECTION, hotelId);
    const hotelDoc = await getDoc(hotelRef);
    
    if (!hotelDoc.exists()) {
      throw new Error('Hotel not found');
    }

    const currentFeatured = hotelDoc.data().featured || false;
    
    await updateDoc(hotelRef, {
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

// Add review to hotel
export const addHotelReview = async (hotelId, reviewData) => {
  try {
    const hotelRef = doc(db, HOTELS_COLLECTION, hotelId);
    
    // Add review to reviews collection
    const reviewDoc = {
      hotelId,
      ...reviewData,
      createdAt: serverTimestamp(),
    };
    
    const reviewRef = await addDoc(collection(db, 'reviews'), reviewDoc);
    
    // Update hotel rating and review count
    const hotelDoc = await getDoc(hotelRef);
    const hotelData = hotelDoc.data();
    
    const currentRating = hotelData.averageRating || 0;
    const currentCount = hotelData.reviewCount || 0;
    const newCount = currentCount + 1;
    const newRating = ((currentRating * currentCount) + reviewData.rating) / newCount;
    
    await updateDoc(hotelRef, {
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

// Get hotel statistics
export const getHotelStats = async () => {
  try {
    const q = query(collection(db, HOTELS_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    let stats = {
      total: 0,
      active: 0,
      featured: 0,
      draft: 0,
      totalViews: 0,
      totalBookings: 0,
      averageStarRating: 0,
    };

    let totalStarRating = 0;
    let hotelCount = 0;

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      stats.total++;
      
      if (data.status === 'active') stats.active++;
      if (data.featured) stats.featured++;
      if (data.status === 'draft') stats.draft++;
      
      stats.totalViews += data.viewCount || 0;
      stats.totalBookings += data.bookingCount || 0;
      
      if (data.starRating) {
        totalStarRating += data.starRating;
        hotelCount++;
      }
    });

    if (hotelCount > 0) {
      stats.averageStarRating = totalStarRating / hotelCount;
    }

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error('Get hotel stats error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};
