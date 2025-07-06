// Firebase API wrapper to maintain compatibility with existing code
import * as authService from '../services/firebase/auth';
import * as tripsService from '../services/firebase/trips';
import * as hotelsService from '../services/firebase/hotels';
import * as reviewsService from '../services/firebase/reviews';
import * as bookingsService from '../services/firebase/bookings';
// mockDataStore removed - using Firebase only
import * as contentService from '../services/firebase/content';

// Transform Firebase responses to match expected API format
const transformResponse = (data, success = true) => ({
  data: {
    success,
    data,
    message: success ? 'Success' : 'Error',
  },
});

const transformError = (error) => ({
  response: {
    data: {
      success: false,
      message: error.message || 'An error occurred',
    },
  },
});

// Auth API
export const authAPI = {
  async login(credentials) {
    try {
      const result = await authService.loginUser(credentials.email, credentials.password);
      if (result.success) {
        return transformResponse({ user: result.user, token: 'firebase-token' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async register(userData) {
    try {
      const result = await authService.registerUser(userData);
      if (result.success) {
        return transformResponse({ user: result.user, token: 'firebase-token' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async logout() {
    try {
      await authService.logoutUser();
      return transformResponse({});
    } catch (error) {
      throw transformError(error);
    }
  },

  async getProfile() {
    try {
      const user = await authService.getCurrentUserData();
      if (user) {
        return transformResponse({ user });
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async updateProfile(profileData) {
    try {
      const result = await authService.updateUserProfile(profileData);
      if (result.success) {
        const user = await authService.getCurrentUserData();
        return transformResponse({ user });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async forgotPassword(email) {
    try {
      const result = await authService.resetPassword(email);
      if (result.success) {
        return transformResponse({});
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async resetPassword(token, password) {
    try {
      const result = await authService.changePassword(password);
      if (result.success) {
        return transformResponse({});
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },
};

// Trips API
export const tripsAPI = {
  async getAll(params = {}) {
    try {
      console.log('🗺️ Getting trips from Firebase...', params);

      const result = await tripsService.getTrips(params);

      if (result.success) {
        console.log('✅ Trips loaded from Firebase:', result.trips.length);
        return transformResponse({
          data: result.trips,
          meta: {
            pagination: {
              page: params.page || 1,
              limit: params.limit || 20,
              total: result.trips.length,
              hasNext: result.hasMore || false,
              hasPrev: false,
            },
          },
        });
      } else {
        console.log('⚠️ No trips found in Firebase, returning empty array');
        return transformResponse({
          data: [],
          meta: {
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      }
    } catch (error) {
      console.error('❌ Error getting trips from Firebase:', error);
      // Return empty array instead of throwing error
      return transformResponse({
        data: [],
        meta: {
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      });
    }
  },

  async getById(id) {
    try {
      console.log('🗺️ Getting trip by ID from Firebase:', id);

      const result = await tripsService.getTrip(id);

      if (result.success) {
        console.log('✅ Trip found in Firebase');
        return transformResponse(result.trip);
      } else {
        throw new Error(result.error || 'Trip not found');
      }
    } catch (error) {
      console.error('❌ Error getting trip by ID:', error);
      throw transformError(error);
    }
  },

  async getBySlug(slug) {
    try {
      console.log('🗺️ Getting trip by slug from Firebase:', slug);

      const result = await tripsService.getTripBySlug(slug);

      if (result.success) {
        console.log('✅ Trip found in Firebase');
        return transformResponse(result.trip);
      } else {
        throw new Error(result.error || 'Trip not found');
      }
    } catch (error) {
      console.error('❌ Error getting trip by slug:', error);
      throw transformError(error);
    }
  },

  async create(tripData) {
    try {
      console.log('📝 Creating trip with data:', tripData);

      // Create trip in Firebase
      const firebaseResult = await tripsService.createTrip(tripData);
      if (firebaseResult.success) {
        console.log('✅ Trip saved to Firebase:', firebaseResult.trip.id);
        return transformResponse(firebaseResult.trip);
      } else {
        throw new Error(firebaseResult.error || 'Failed to create trip');
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async update(id, tripData) {
    try {
      const result = await tripsService.updateTrip(id, tripData);
      if (result.success) {
        return transformResponse({});
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async delete(id) {
    try {
      const result = await tripsService.deleteTrip(id);
      if (result.success) {
        return transformResponse({});
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async toggleFeatured(id) {
    try {
      const result = await tripsService.toggleTripFeatured(id);
      if (result.success) {
        return transformResponse({ featured: result.featured });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async getStats() {
    try {
      const result = await tripsService.getTripStats();
      if (result.success) {
        return transformResponse(result.stats);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async getFeatured(limit = 6) {
    try {
      const result = await tripsService.getFeaturedTrips(limit);
      if (result.success) {
        return transformResponse(result.trips);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },
};

// Hotels API
export const hotelsAPI = {
  async getAll(params = {}) {
    try {
      console.log('🏨 Getting hotels from Firebase...', params);

      // Get hotels from Firebase
      const result = await hotelsService.getHotels(params);

      if (result.success) {
        console.log('✅ Hotels loaded from Firebase:', result.hotels.length);
        return transformResponse({
          data: result.hotels,
          meta: {
            pagination: {
              page: params.page || 1,
              limit: params.limit || 20,
              total: result.hotels.length,
              hasNext: result.hasMore || false,
              hasPrev: false,
            },
          },
        });
      } else {
        console.log('⚠️ No hotels found in Firebase, returning empty array');
        return transformResponse({
          data: [],
          meta: {
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      }
    } catch (error) {
      console.error('❌ Error getting hotels from Firebase:', error);
      // Return empty array instead of throwing error
      return transformResponse({
        data: [],
        meta: {
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      });
    }
  },

  async getById(id) {
    try {
      console.log('🏨 Getting hotel by ID from Firebase:', id);

      const result = await hotelsService.getHotel(id);

      if (result.success) {
        console.log('✅ Hotel found in Firebase');
        return transformResponse(result.hotel);
      } else {
        throw new Error(result.error || 'Hotel not found');
      }
    } catch (error) {
      console.error('❌ Error getting hotel by ID:', error);
      throw transformError(error);
    }
  },

  async getBySlug(slug) {
    try {
      console.log('🏨 Getting hotel by slug from Firebase:', slug);

      const result = await hotelsService.getHotelBySlug(slug);

      if (result.success) {
        console.log('✅ Hotel found in Firebase');
        return transformResponse(result.hotel);
      } else {
        throw new Error(result.error || 'Hotel not found');
      }
    } catch (error) {
      console.error('❌ Error getting hotel by slug:', error);
      throw transformError(error);
    }
  },

  async create(hotelData) {
    try {
      console.log('Creating hotel with data:', hotelData);

      // Create hotel in Firebase
      const firebaseResult = await hotelsService.createHotel(hotelData);
      if (firebaseResult.success) {
        console.log('✅ Hotel saved to Firebase:', firebaseResult.hotel.id);
        return transformResponse(firebaseResult.hotel);
      } else {
        throw new Error(firebaseResult.error || 'Failed to create hotel');
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async update(id, hotelData) {
    try {
      const result = await hotelsService.updateHotel(id, hotelData);
      if (result.success) {
        return transformResponse({});
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async delete(id) {
    try {
      const result = await hotelsService.deleteHotel(id);
      if (result.success) {
        return transformResponse({});
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async toggleFeatured(id) {
    try {
      const result = await hotelsService.toggleHotelFeatured(id);
      if (result.success) {
        return transformResponse({ featured: result.featured });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async getStats() {
    try {
      const result = await hotelsService.getHotelStats();
      if (result.success) {
        return transformResponse(result.stats);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async getFeatured(limit = 6) {
    try {
      const result = await hotelsService.getFeaturedHotels(limit);
      if (result.success) {
        return transformResponse(result.hotels);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },
};

// Reviews API
export const reviewsAPI = {
  async getAll(params = {}) {
    try {
      const result = await reviewsService.getReviews(params);
      if (result.success) {
        return transformResponse({
          data: result.reviews,
          meta: {
            pagination: {
              page: params.page || 1,
              limit: params.pageSize || 20,
              total: result.reviews.length,
              hasNext: result.hasMore,
              hasPrev: (params.page || 1) > 1,
            },
          },
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async create(reviewData) {
    try {
      const result = await reviewsService.createReview(reviewData);
      if (result.success) {
        return transformResponse(result.review);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async approve(id) {
    try {
      const result = await reviewsService.approveReview(id);
      if (result.success) {
        return transformResponse({});
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async reject(id) {
    try {
      const result = await reviewsService.rejectReview(id);
      if (result.success) {
        return transformResponse({});
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async delete(id) {
    try {
      const result = await reviewsService.deleteReview(id);
      if (result.success) {
        return transformResponse({});
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },
};

// Content API
export const contentAPI = {
  async getContent(page) {
    try {
      const result = await contentService.getContent(page);
      if (result.success) {
        return transformResponse(result.content);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async updateContent(page, contentData) {
    try {
      const result = await contentService.updateContent(page, contentData);
      if (result.success) {
        return transformResponse({});
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw transformError(error);
    }
  },
};

// Categories API (placeholder - implement based on your needs)
export const categoriesAPI = {
  async getAll() {
    try {
      // This would be implemented based on your category structure
      const mockCategories = [
        { id: '1', name: 'Beach Destinations', slug: 'beach', image: 'https://picsum.photos/500/300?random=301', trips_count: 25, hotels_count: 15 },
        { id: '2', name: 'Mountain Adventures', slug: 'mountain', image: 'https://picsum.photos/500/300?random=302', trips_count: 18, hotels_count: 12 },
        { id: '3', name: 'City Tours', slug: 'city', image: 'https://picsum.photos/500/300?random=303', trips_count: 32, hotels_count: 28 },
        { id: '4', name: 'Cultural Experiences', slug: 'cultural', image: 'https://picsum.photos/500/300?random=304', trips_count: 22, hotels_count: 8 },
        { id: '5', name: 'Desert Safari', slug: 'desert', image: 'https://picsum.photos/500/300?random=305', trips_count: 14, hotels_count: 6 },
        { id: '6', name: 'Island Paradise', slug: 'island', image: 'https://picsum.photos/500/300?random=506', trips_count: 19, hotels_count: 11 },
        { id: '7', name: 'Wildlife Safari', slug: 'wildlife', image: 'https://picsum.photos/500/300?random=507', trips_count: 16, hotels_count: 7 },
        { id: '8', name: 'Winter Sports', slug: 'winter', image: 'https://picsum.photos/500/300?random=508', trips_count: 12, hotels_count: 9 },
      ];
      return transformResponse(mockCategories);
    } catch (error) {
      throw transformError(error);
    }
  },

  async getPopular(limit = 8) {
    try {
      const allCategories = [
        { id: '1', name: 'Beach Destinations', slug: 'beach', image: 'https://picsum.photos/500/300?random=601', trips_count: 25, hotels_count: 15 },
        { id: '2', name: 'Mountain Adventures', slug: 'mountain', image: 'https://picsum.photos/500/300?random=602', trips_count: 18, hotels_count: 12 },
        { id: '3', name: 'City Tours', slug: 'city', image: 'https://picsum.photos/500/300?random=603', trips_count: 32, hotels_count: 28 },
        { id: '4', name: 'Cultural Experiences', slug: 'cultural', image: 'https://picsum.photos/500/300?random=404', trips_count: 22, hotels_count: 8 },
        { id: '5', name: 'Desert Safari', slug: 'desert', image: 'https://picsum.photos/500/300?random=405', trips_count: 14, hotels_count: 6 },
        { id: '6', name: 'Island Paradise', slug: 'island', image: 'https://picsum.photos/500/300?random=406', trips_count: 19, hotels_count: 11 },
        { id: '7', name: 'Wildlife Safari', slug: 'wildlife', image: 'https://picsum.photos/500/300?random=607', trips_count: 16, hotels_count: 7 },
        { id: '8', name: 'Winter Sports', slug: 'winter', image: 'https://picsum.photos/500/300?random=608', trips_count: 12, hotels_count: 9 },
      ];

      // Sort by total count and take the limit
      const popularCategories = allCategories
        .sort((a, b) => (b.trips_count + b.hotels_count) - (a.trips_count + a.hotels_count))
        .slice(0, limit);

      return transformResponse(popularCategories);
    } catch (error) {
      throw transformError(error);
    }
  },
};

// Analytics API (placeholder)
export const analyticsAPI = {
  async getDashboard() {
    try {
      // Mock analytics data
      const mockData = {
        revenue: { total: 125000, current: 15000, previous: 12000 },
        bookings: { total: 450, current: 45, previous: 38 },
        users: { active: 1250, current: 150, previous: 120 },
        pageViews: { total: 25000, current: 3500, previous: 3200 },
      };
      return transformResponse(mockData);
    } catch (error) {
      throw transformError(error);
    }
  },
};

// Bookings API
export const bookingsAPI = {
  async getAll(params = {}) {
    try {
      console.log('📋 Getting bookings from Firebase...', params);

      // Get bookings from Firebase
      const result = await bookingsService.getBookings(params);

      if (result.success) {
        console.log('✅ Bookings loaded from Firebase:', result.bookings.length);
        return transformResponse({
          data: result.bookings,
          meta: {
            pagination: {
              page: params.page || 1,
              limit: params.limit || 20,
              total: result.bookings.length,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      } else {
        console.log('⚠️ No bookings found in Firebase, returning empty array');
        return transformResponse({
          data: [],
          meta: {
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      }
    } catch (error) {
      console.error('❌ Error getting bookings from Firebase:', error);
      // Return empty array instead of throwing error
      return transformResponse({
        data: [],
        meta: {
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      });
    }
  },

  async create(bookingData) {
    try {
      console.log('📝 Creating booking with data:', bookingData);

      // Create booking in Firebase
      const firebaseResult = await bookingsService.createBooking(bookingData);
      if (firebaseResult.success) {
        console.log('✅ Booking saved to Firebase:', firebaseResult.booking.id);
        return transformResponse(firebaseResult.booking);
      } else {
        throw new Error(firebaseResult.error || 'Failed to create booking');
      }
    } catch (error) {
      throw transformError(error);
    }
  },

  async getById(id) {
    try {
      console.log('📋 Getting booking by ID from Firebase:', id);

      const result = await bookingsService.getBookingById(id);

      if (result.success) {
        console.log('✅ Booking found in Firebase');
        return transformResponse(result.booking);
      } else {
        throw new Error(result.error || 'Booking not found');
      }
    } catch (error) {
      console.error('❌ Error getting booking by ID:', error);
      throw transformError(error);
    }
  },

  async update(id, updateData) {
    try {
      console.log('📝 Updating booking in Firebase:', id, updateData);

      const result = await bookingsService.updateBooking(id, updateData);

      if (result.success) {
        console.log('✅ Booking updated in Firebase');
        return transformResponse(result.booking);
      } else {
        throw new Error(result.error || 'Failed to update booking');
      }
    } catch (error) {
      console.error('❌ Error updating booking:', error);
      throw transformError(error);
    }
  },

  async cancel(id) {
    try {
      console.log('🚫 Cancelling booking in Firebase:', id);

      const result = await bookingsService.cancelBooking(id);

      if (result.success) {
        console.log('✅ Booking cancelled in Firebase');
        return transformResponse(result.booking);
      } else {
        throw new Error(result.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      throw transformError(error);
    }
  },
};

// Wishlist API (placeholder)
export const wishlistAPI = {
  async checkItem(type, itemId) {
    try {
      return transformResponse({ isInWishlist: false });
    } catch (error) {
      throw transformError(error);
    }
  },

  async addItem(itemData) {
    try {
      return transformResponse({});
    } catch (error) {
      throw transformError(error);
    }
  },

  async removeItem(itemId) {
    try {
      return transformResponse({});
    } catch (error) {
      throw transformError(error);
    }
  },
};

// Sync API removed - using Firebase directly
