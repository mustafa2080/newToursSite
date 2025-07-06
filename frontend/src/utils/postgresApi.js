// PostgreSQL API service for the tourism application
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  getProfile: () => apiRequest('/auth/profile'),

  updateProfile: (profileData) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),

  refreshToken: () => apiRequest('/auth/refresh-token', {
    method: 'POST'
  }),

  logout: () => apiRequest('/auth/logout', {
    method: 'POST'
  })
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => apiRequest('/admin/dashboard/stats'),

  // User Management
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },

  updateUserStatus: (userId, isActive) => apiRequest(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive })
  }),

  // Booking Management
  getBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/bookings${queryString ? `?${queryString}` : ''}`);
  },

  updateBookingStatus: (bookingId, status) => apiRequest(`/admin/bookings/${bookingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  // Content Management
  getContentPages: () => apiRequest('/admin/content-pages'),

  updateContentPage: (type, content) => apiRequest(`/admin/content-pages/${type}`, {
    method: 'PUT',
    body: JSON.stringify(content)
  }),

  // Review Management
  getReviews: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/reviews${queryString ? `?${queryString}` : ''}`);
  },

  approveReview: (reviewId) => apiRequest(`/admin/reviews/${reviewId}/approve`, {
    method: 'PATCH'
  }),

  // Admin Logs
  getAdminLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/logs${queryString ? `?${queryString}` : ''}`);
  }
};

// Trips API
export const tripsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/trips${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiRequest(`/trips/${id}`),

  getBySlug: (slug) => apiRequest(`/trips/slug/${slug}`),

  create: (tripData) => apiRequest('/trips', {
    method: 'POST',
    body: JSON.stringify(tripData)
  }),

  update: (id, tripData) => apiRequest(`/trips/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tripData)
  }),

  delete: (id) => apiRequest(`/trips/${id}`, {
    method: 'DELETE'
  }),

  search: (query, filters = {}) => {
    const params = { q: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/trips/search?${queryString}`);
  }
};

// Hotels API
export const hotelsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/hotels${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiRequest(`/hotels/${id}`),

  getBySlug: (slug) => apiRequest(`/hotels/slug/${slug}`),

  create: (hotelData) => apiRequest('/hotels', {
    method: 'POST',
    body: JSON.stringify(hotelData)
  }),

  update: (id, hotelData) => apiRequest(`/hotels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(hotelData)
  }),

  delete: (id) => apiRequest(`/hotels/${id}`, {
    method: 'DELETE'
  }),

  search: (query, filters = {}) => {
    const params = { q: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/hotels/search?${queryString}`);
  }
};

// Bookings API
export const bookingsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/bookings/my-bookings${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiRequest(`/bookings/${id}`),

  create: (bookingData) => apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  }),

  update: (id, bookingData) => apiRequest(`/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookingData)
  }),

  cancel: (id) => apiRequest(`/bookings/${id}/cancel`, {
    method: 'PATCH'
  }),

  checkAvailability: (type, id, dates) => apiRequest('/bookings/check-availability', {
    method: 'POST',
    body: JSON.stringify({ type, id, dates })
  })
};

// Categories API
export const categoriesAPI = {
  getAll: () => apiRequest('/categories'),

  getById: (id) => apiRequest(`/categories/${id}`),

  create: (categoryData) => apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData)
  }),

  update: (id, categoryData) => apiRequest(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData)
  }),

  delete: (id) => apiRequest(`/categories/${id}`, {
    method: 'DELETE'
  })
};

// Reviews API
export const reviewsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reviews${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiRequest(`/reviews/${id}`),

  create: (reviewData) => apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
  }),

  update: (id, reviewData) => apiRequest(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reviewData)
  }),

  delete: (id) => apiRequest(`/reviews/${id}`, {
    method: 'DELETE'
  })
};

// Utility functions
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
