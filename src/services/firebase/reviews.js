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
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const REVIEWS_COLLECTION = 'reviews';

// Create a new review
export const createReview = async (reviewData) => {
  try {
    const review = {
      ...reviewData,
      status: 'pending', // pending, approved, rejected
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), review);
    
    return {
      success: true,
      id: docRef.id,
      review: { id: docRef.id, ...review },
    };
  } catch (error) {
    console.error('Create review error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get review by ID
export const getReview = async (reviewId) => {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const reviewDoc = await getDoc(reviewRef);

    if (!reviewDoc.exists()) {
      return {
        success: false,
        error: 'Review not found',
      };
    }

    return {
      success: true,
      review: {
        id: reviewDoc.id,
        ...reviewDoc.data(),
      },
    };
  } catch (error) {
    console.error('Get review error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get all reviews with filters and pagination
export const getReviews = async (filters = {}) => {
  try {
    console.log('📝 Getting reviews from Firebase...', filters);

    // For now, return empty array to avoid index issues
    // The query requires a composite index that needs to be created in Firebase Console
    console.log('⚠️ Reviews temporarily disabled to avoid index issues');
    console.log('📋 To enable reviews, create the required index in Firebase Console:');
    console.log('🔗 https://console.firebase.google.com/v1/r/project/tours-52d78/firestore/indexes');

    return {
      success: true,
      reviews: [],
      lastDoc: null,
      hasMore: false,
    };

    /*
    // Uncomment this code after creating the required indexes in Firebase Console
    // You need to create a composite index for: status (Ascending) + createdAt (Descending)

    const {
      search,
      status,
      rating,
      type, // 'trip' or 'hotel'
      itemId, // tripId or hotelId
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      pageSize = 20,
      lastDoc = null,
    } = filters;

    let q = collection(db, REVIEWS_COLLECTION);
    const constraints = [];

    // Add filters
    if (status) {
      constraints.push(where('status', '==', status));
    }

    if (rating) {
      constraints.push(where('rating', '==', parseInt(rating)));
    }

    if (type && itemId) {
      const fieldName = type === 'trip' ? 'tripId' : 'hotelId';
      constraints.push(where(fieldName, '==', itemId));
    }

    if (userId) {
      constraints.push(where('userId', '==', userId));
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

    let reviews = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side search filter
    if (search) {
      const searchLower = search.toLowerCase();
      reviews = reviews.filter(review =>
        review.comment?.toLowerCase().includes(searchLower) ||
        review.userName?.toLowerCase().includes(searchLower) ||
        review.tripTitle?.toLowerCase().includes(searchLower) ||
        review.hotelName?.toLowerCase().includes(searchLower)
      );
    }

    return {
      success: true,
      reviews,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === pageSize,
    };
    */
  } catch (error) {
    console.error('Get reviews error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get reviews for a specific trip or hotel
export const getItemReviews = async (type, itemId, limitCount = 10) => {
  try {
    const fieldName = type === 'trip' ? 'tripId' : 'hotelId';
    
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where(fieldName, '==', itemId),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const reviews = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      reviews,
    };
  } catch (error) {
    console.error('Get item reviews error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Update review
export const updateReview = async (reviewId, updateData) => {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    
    const updatedData = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(reviewRef, updatedData);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update review error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Approve review
export const approveReview = async (reviewId) => {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    
    await updateDoc(reviewRef, {
      status: 'approved',
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Approve review error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Reject review
export const rejectReview = async (reviewId, reason = '') => {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    
    await updateDoc(reviewRef, {
      status: 'rejected',
      rejectionReason: reason,
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Reject review error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete review
export const deleteReview = async (reviewId) => {
  try {
    await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete review error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get review statistics
export const getReviewStats = async () => {
  try {
    const q = query(collection(db, REVIEWS_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    let stats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      averageRating: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };

    let totalRating = 0;
    let ratingCount = 0;

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      stats.total++;
      
      if (data.status === 'pending') stats.pending++;
      if (data.status === 'approved') stats.approved++;
      if (data.status === 'rejected') stats.rejected++;
      
      if (data.rating) {
        totalRating += data.rating;
        ratingCount++;
        stats.ratingDistribution[data.rating]++;
      }
    });

    if (ratingCount > 0) {
      stats.averageRating = totalRating / ratingCount;
    }

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error('Get review stats error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get user's reviews
export const getUserReviews = async (userId) => {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const reviews = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      reviews,
    };
  } catch (error) {
    console.error('Get user reviews error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Check if user can review item
export const canUserReview = async (userId, type, itemId) => {
  try {
    const fieldName = type === 'trip' ? 'tripId' : 'hotelId';
    
    // Check if user already reviewed this item
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('userId', '==', userId),
      where(fieldName, '==', itemId)
    );

    const querySnapshot = await getDocs(q);
    
    return {
      success: true,
      canReview: querySnapshot.empty,
      hasExistingReview: !querySnapshot.empty,
    };
  } catch (error) {
    console.error('Check user review error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
