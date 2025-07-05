import { Analytics } from '../models/Analytics.js';
import crypto from 'crypto';

// Generate session ID from IP and User Agent
const generateSessionId = (req) => {
  const identifier = `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
  return crypto.createHash('md5').update(identifier).digest('hex');
};

// Track page view
export const trackPageView = (resourceType = null) => {
  return async (req, res, next) => {
    try {
      // Skip tracking for certain routes
      const skipRoutes = ['/api/health', '/api/analytics'];
      if (skipRoutes.some(route => req.path.startsWith(route))) {
        return next();
      }

      const eventData = {
        userId: req.user?.id || null,
        eventType: 'page_view',
        resourceType: resourceType || extractResourceType(req.path),
        resourceId: req.params.id || req.params.slug || null,
        metadata: {
          path: req.path,
          method: req.method,
          query: req.query,
          referrer: req.get('Referrer') || null,
          source: req.query.source || null
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: generateSessionId(req)
      };

      // Track asynchronously to not block the request
      Analytics.trackEvent(eventData).catch(error => {
        console.error('Analytics tracking error:', error);
      });

    } catch (error) {
      console.error('Analytics middleware error:', error);
    }
    
    next();
  };
};

// Track search events
export const trackSearch = async (req, res, next) => {
  try {
    const searchTerm = req.query.q || req.query.search || req.body.query;
    
    if (searchTerm) {
      const eventData = {
        userId: req.user?.id || null,
        eventType: 'search',
        resourceType: 'search',
        resourceId: null,
        metadata: {
          search_term: searchTerm,
          filters: {
            category: req.query.category,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            rating: req.query.rating,
            tags: req.query.tags
          },
          results_count: null // Will be updated after search
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: generateSessionId(req)
      };

      // Store event data in request for later update
      req.analyticsEvent = eventData;

      // Track asynchronously
      Analytics.trackEvent(eventData).catch(error => {
        console.error('Search analytics tracking error:', error);
      });
    }
  } catch (error) {
    console.error('Search analytics middleware error:', error);
  }
  
  next();
};

// Track booking attempts
export const trackBookingAttempt = async (req, res, next) => {
  try {
    const eventData = {
      userId: req.user?.id || null,
      eventType: 'booking_attempt',
      resourceType: req.body.bookingType || 'unknown',
      resourceId: req.body.tripId || req.body.hotelId || null,
      metadata: {
        booking_type: req.body.bookingType,
        number_of_guests: req.body.numberOfGuests,
        total_price: req.body.totalPrice,
        departure_date: req.body.departureDate,
        check_in_date: req.body.checkInDate
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: generateSessionId(req)
    };

    // Store for potential completion tracking
    req.bookingAttemptEvent = eventData;

    // Track asynchronously
    Analytics.trackEvent(eventData).catch(error => {
      console.error('Booking attempt analytics tracking error:', error);
    });

  } catch (error) {
    console.error('Booking attempt analytics middleware error:', error);
  }
  
  next();
};

// Track booking completion
export const trackBookingCompletion = (booking) => {
  try {
    const eventData = {
      userId: booking.user_id,
      eventType: 'booking_completed',
      resourceType: booking.booking_type,
      resourceId: booking.trip_id || booking.hotel_id,
      metadata: {
        booking_id: booking.id,
        booking_reference: booking.booking_reference,
        booking_type: booking.booking_type,
        number_of_guests: booking.number_of_guests,
        total_price: booking.total_price,
        departure_date: booking.departure_date,
        check_in_date: booking.check_in_date
      },
      ipAddress: null, // Not available in this context
      userAgent: null,
      sessionId: null
    };

    // Track asynchronously
    Analytics.trackEvent(eventData).catch(error => {
      console.error('Booking completion analytics tracking error:', error);
    });

  } catch (error) {
    console.error('Booking completion analytics error:', error);
  }
};

// Track user registration
export const trackUserRegistration = (user) => {
  try {
    const eventData = {
      userId: user.id,
      eventType: 'user_registration',
      resourceType: 'user',
      resourceId: user.id,
      metadata: {
        user_role: user.role,
        registration_method: 'email' // Could be extended for social login
      },
      ipAddress: null,
      userAgent: null,
      sessionId: null
    };

    // Track asynchronously
    Analytics.trackEvent(eventData).catch(error => {
      console.error('User registration analytics tracking error:', error);
    });

  } catch (error) {
    console.error('User registration analytics error:', error);
  }
};

// Track user login
export const trackUserLogin = (user, req) => {
  try {
    const eventData = {
      userId: user.id,
      eventType: 'user_login',
      resourceType: 'user',
      resourceId: user.id,
      metadata: {
        user_role: user.role,
        login_method: 'email'
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: generateSessionId(req)
    };

    // Track asynchronously
    Analytics.trackEvent(eventData).catch(error => {
      console.error('User login analytics tracking error:', error);
    });

  } catch (error) {
    console.error('User login analytics error:', error);
  }
};

// Track review submission
export const trackReviewSubmission = (review, req) => {
  try {
    const eventData = {
      userId: review.user_id,
      eventType: 'review_submitted',
      resourceType: review.trip_id ? 'trip' : 'hotel',
      resourceId: review.trip_id || review.hotel_id,
      metadata: {
        review_id: review.id,
        rating: review.rating,
        has_comment: !!review.comment,
        booking_id: review.booking_id
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: generateSessionId(req)
    };

    // Track asynchronously
    Analytics.trackEvent(eventData).catch(error => {
      console.error('Review submission analytics tracking error:', error);
    });

  } catch (error) {
    console.error('Review submission analytics error:', error);
  }
};

// Track wishlist actions
export const trackWishlistAction = (action, item, req) => {
  try {
    const eventData = {
      userId: req.user?.id || null,
      eventType: `wishlist_${action}`, // 'wishlist_add' or 'wishlist_remove'
      resourceType: item.trip_id ? 'trip' : 'hotel',
      resourceId: item.trip_id || item.hotel_id,
      metadata: {
        action: action,
        item_type: item.trip_id ? 'trip' : 'hotel'
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: generateSessionId(req)
    };

    // Track asynchronously
    Analytics.trackEvent(eventData).catch(error => {
      console.error('Wishlist analytics tracking error:', error);
    });

  } catch (error) {
    console.error('Wishlist analytics error:', error);
  }
};

// Extract resource type from URL path
const extractResourceType = (path) => {
  if (path.includes('/trips')) return 'trip';
  if (path.includes('/hotels')) return 'hotel';
  if (path.includes('/categories')) return 'category';
  if (path.includes('/users')) return 'user';
  if (path.includes('/bookings')) return 'booking';
  if (path.includes('/reviews')) return 'review';
  return 'page';
};

// Middleware to update search results count
export const updateSearchResultsCount = (count) => {
  return (req, res, next) => {
    if (req.analyticsEvent && req.analyticsEvent.eventType === 'search') {
      req.analyticsEvent.metadata.results_count = count;
      
      // Update the analytics record if needed
      // This could be implemented as a separate update operation
    }
    next();
  };
};

// Middleware for API endpoint analytics
export const trackAPIUsage = (endpoint) => {
  return async (req, res, next) => {
    try {
      const eventData = {
        userId: req.user?.id || null,
        eventType: 'api_call',
        resourceType: 'api',
        resourceId: endpoint,
        metadata: {
          endpoint: endpoint,
          method: req.method,
          status_code: null, // Will be updated after response
          response_time: Date.now() // Start time
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        sessionId: generateSessionId(req)
      };

      req.apiAnalyticsEvent = eventData;

      // Override res.end to capture response details
      const originalEnd = res.end;
      res.end = function(...args) {
        eventData.metadata.status_code = res.statusCode;
        eventData.metadata.response_time = Date.now() - eventData.metadata.response_time;
        
        // Track asynchronously
        Analytics.trackEvent(eventData).catch(error => {
          console.error('API analytics tracking error:', error);
        });
        
        originalEnd.apply(this, args);
      };

    } catch (error) {
      console.error('API analytics middleware error:', error);
    }
    
    next();
  };
};

export default {
  trackPageView,
  trackSearch,
  trackBookingAttempt,
  trackBookingCompletion,
  trackUserRegistration,
  trackUserLogin,
  trackReviewSubmission,
  trackWishlistAction,
  updateSearchResultsCount,
  trackAPIUsage
};
