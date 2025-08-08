import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  startAfter,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { notificationService } from '../notificationService';

const COLLECTION_NAME = 'bookings';

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    console.log('Creating booking in Firebase:', bookingData);
    
    const bookingToSave = {
      ...bookingData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: bookingData.status || 'pending',
      paymentStatus: bookingData.paymentStatus || 'pending',
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), bookingToSave);

    console.log('Booking created with ID:', docRef.id);

    const booking = {
      id: docRef.id,
      ...bookingToSave,
    };

    // Create notification for the booking
    try {
      await notificationService.createBookingNotification(bookingData.userId, booking);
      console.log('✅ Booking notification created');
    } catch (notificationError) {
      console.error('❌ Failed to create booking notification:', notificationError);
      // Don't fail the booking if notification fails
    }



    return {
      success: true,
      booking,
      message: 'Booking created successfully'
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to create booking'
    };
  }
};

// Get all bookings with optional filters
export const getBookings = async (filters = {}) => {
  try {
    console.log('Fetching bookings from Firebase with filters:', filters);
    
    let q = collection(db, COLLECTION_NAME);
    
    // Apply filters
    const conditions = [];
    
    if (filters.userId) {
      conditions.push(where('userId', '==', filters.userId));
    }
    
    if (filters.status) {
      conditions.push(where('status', '==', filters.status));
    }
    
    if (filters.type) {
      conditions.push(where('type', '==', filters.type));
    }
    
    // Add conditions to query
    if (conditions.length > 0) {
      q = query(q, ...conditions);
    }
    
    // Add ordering - removed to avoid index requirement
    // Note: Results will be sorted in JavaScript instead
    // q = query(q, orderBy('createdAt', 'desc'));
    
    // Add limit
    if (filters.limit) {
      q = query(q, firestoreLimit(filters.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const bookings = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookings.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        bookingDate: data.bookingDate || data.createdAt?.toDate?.()?.toISOString(),
      });
    });

    // Sort by createdAt in JavaScript to avoid Firestore index requirement
    bookings.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB - dateA; // Descending order (newest first)
    });

    console.log(`Found ${bookings.length} bookings`);
    
    return {
      success: true,
      bookings,
      count: bookings.length,
      message: 'Bookings retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {
      success: false,
      error: error.message,
      bookings: [],
      message: 'Failed to fetch bookings'
    };
  }
};

// Get a single booking by ID
export const getBookingById = async (bookingId) => {
  try {
    console.log('Fetching booking by ID:', bookingId);
    
    const docRef = doc(db, COLLECTION_NAME, bookingId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const booking = {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        bookingDate: data.bookingDate || data.createdAt?.toDate?.()?.toISOString(),
      };
      
      return {
        success: true,
        booking,
        message: 'Booking retrieved successfully'
      };
    } else {
      return {
        success: false,
        error: 'Booking not found',
        message: 'Booking not found'
      };
    }
  } catch (error) {
    console.error('Error fetching booking:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch booking'
    };
  }
};

// Update a booking
export const updateBooking = async (bookingId, updateData) => {
  try {
    console.log('Updating booking:', bookingId, updateData);
    
    const docRef = doc(db, COLLECTION_NAME, bookingId);
    
    const dataToUpdate = {
      ...updateData,
      updatedAt: Timestamp.now(),
    };
    
    await updateDoc(docRef, dataToUpdate);
    
    // Get the updated booking
    const updatedBooking = await getBookingById(bookingId);
    
    return {
      success: true,
      booking: updatedBooking.booking,
      message: 'Booking updated successfully'
    };
  } catch (error) {
    console.error('Error updating booking:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to update booking'
    };
  }
};

// Cancel a booking
export const cancelBooking = async (bookingId) => {
  try {
    console.log('Cancelling booking:', bookingId);

    // Get booking details first
    const bookingResult = await getBookingById(bookingId);
    if (!bookingResult.success) {
      throw new Error('Booking not found');
    }

    const result = await updateBooking(bookingId, {
      status: 'cancelled',
      cancelledAt: Timestamp.now(),
    });

    // Create cancellation notification
    if (result.success && bookingResult.booking) {
      try {
        await notificationService.createBookingCancellationNotification(
          bookingResult.booking.userId,
          bookingResult.booking
        );
        console.log('✅ Booking cancellation notification created');
      } catch (notificationError) {
        console.error('❌ Failed to create cancellation notification:', notificationError);
        // Don't fail the cancellation if notification fails
      }
    }

    return result;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to cancel booking'
    };
  }
};

// Delete a booking (admin only)
export const deleteBooking = async (bookingId) => {
  try {
    console.log('Deleting booking:', bookingId);
    
    const docRef = doc(db, COLLECTION_NAME, bookingId);
    await deleteDoc(docRef);
    
    return {
      success: true,
      message: 'Booking deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting booking:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to delete booking'
    };
  }
};

// Get booking statistics
export const getBookingStats = async (filters = {}) => {
  try {
    console.log('Fetching booking statistics');
    
    const bookingsResult = await getBookings(filters);
    
    if (!bookingsResult.success) {
      throw new Error(bookingsResult.error);
    }
    
    const bookings = bookingsResult.bookings;
    
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      totalRevenue: bookings
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
      tripBookings: bookings.filter(b => !b.type || b.type === 'trip').length,
      hotelBookings: bookings.filter(b => b.type === 'hotel').length,
    };
    
    return {
      success: true,
      stats,
      message: 'Statistics retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching booking statistics:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to fetch statistics'
    };
  }
};

// Export all functions
export default {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  deleteBooking,
  getBookingStats,
};
