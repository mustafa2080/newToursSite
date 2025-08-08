// Firebase Firestore Search-Optimized Structure
// This file defines the database structure optimized for search functionality

/**
 * TRIPS COLLECTION
 * Path: /trips/{tripId}
 */
const tripDocument = {
  id: "trip_123",
  title: "Amazing Safari Adventure in Kenya",
  description: "Experience the wildlife of Africa in this incredible safari adventure...",
  location: "Kenya, Africa",
  destination: "Maasai Mara National Reserve",
  category: "safari",
  tags: ["safari", "wildlife", "africa", "adventure", "nature"],
  price: 2499,
  duration: 7,
  maxGroupSize: 12,
  difficulty: "moderate",
  highlights: [
    "Big Five wildlife viewing",
    "Professional safari guide",
    "Luxury tented camps"
  ],
  images: ["url1", "url2"],
  
  // Search-optimized fields
  searchKeywords: [
    "safari", "kenya", "africa", "wildlife", "adventure", "maasai", "mara",
    "lions", "elephants", "big five", "nature", "photography"
  ],
  searchText: "amazing safari adventure kenya africa wildlife maasai mara",
  popularity: 95, // For ranking
  averageRating: 4.8,
  reviewCount: 156,
  
  // Metadata
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-20T15:30:00Z",
  isActive: true,
  featured: true
};

/**
 * HOTELS COLLECTION
 * Path: /hotels/{hotelId}
 */
const hotelDocument = {
  id: "hotel_456",
  name: "Luxury Beach Resort Maldives",
  description: "A stunning overwater villa resort with crystal clear waters...",
  location: "Maldives",
  city: "Male",
  country: "Maldives",
  category: "luxury",
  tags: ["beach", "luxury", "overwater", "spa", "diving"],
  pricePerNight: 850,
  starRating: 5,
  amenities: [
    "Private beach",
    "Infinity pool",
    "Spa services",
    "Water sports"
  ],
  
  // Search-optimized fields
  searchKeywords: [
    "maldives", "beach", "resort", "luxury", "overwater", "villa",
    "spa", "diving", "snorkeling", "honeymoon", "romantic"
  ],
  searchText: "luxury beach resort maldives overwater villa spa diving",
  popularity: 88,
  averageRating: 4.9,
  reviewCount: 203,
  
  // Metadata
  createdAt: "2024-01-10T08:00:00Z",
  updatedAt: "2024-01-18T12:00:00Z",
  isActive: true,
  featured: true
};

/**
 * REVIEWS COLLECTION
 * Path: /reviews/{reviewId}
 */
const reviewDocument = {
  id: "review_789",
  itemType: "trip", // or "hotel"
  itemId: "trip_123",
  itemTitle: "Amazing Safari Adventure in Kenya",
  userId: "user_abc",
  userName: "John Smith",
  rating: 5,
  title: "Incredible wildlife experience!",
  comment: "This safari exceeded all expectations. The guide was knowledgeable...",
  
  // Search-optimized fields
  searchKeywords: [
    "safari", "wildlife", "guide", "experience", "kenya", "amazing",
    "exceeded", "expectations", "knowledgeable"
  ],
  searchText: "incredible wildlife experience safari exceeded expectations guide knowledgeable",
  helpfulVotes: 12,
  
  // Metadata
  createdAt: "2024-01-16T14:30:00Z",
  updatedAt: "2024-01-16T14:30:00Z",
  isReported: false,
  isApproved: true
};

/**
 * PAGES COLLECTION (Static Content)
 * Path: /pages/{pageId}
 */
const pageDocument = {
  id: "about_page",
  title: "About Our Travel Company",
  slug: "about",
  content: "We are a leading travel company specializing in adventure tourism...",
  excerpt: "Learn about our mission to provide unforgettable travel experiences",
  category: "company",
  tags: ["about", "company", "mission", "travel", "adventure"],
  
  // Search-optimized fields
  searchKeywords: [
    "about", "company", "travel", "adventure", "tourism", "mission",
    "experience", "team", "values", "history"
  ],
  searchText: "about travel company adventure tourism mission experience team",
  
  // Metadata
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
  isPublished: true,
  priority: 1 // For ranking static pages
};

/**
 * UNIFIED SEARCH INDEX COLLECTION
 * Path: /searchIndex/{indexId}
 * This collection aggregates all searchable content for faster queries
 */
const searchIndexDocument = {
  id: "index_trip_123",
  type: "trip", // trip, hotel, review, page
  refId: "trip_123", // Reference to original document
  title: "Amazing Safari Adventure in Kenya",
  description: "Experience the wildlife of Africa in this incredible safari adventure...",
  excerpt: "Amazing safari adventure with Big Five wildlife viewing in Kenya's Maasai Mara",
  
  // Unified search fields
  searchKeywords: [
    "safari", "kenya", "africa", "wildlife", "adventure", "maasai", "mara",
    "lions", "elephants", "big five", "nature", "photography"
  ],
  searchText: "amazing safari adventure kenya africa wildlife maasai mara big five",
  
  // Ranking factors
  popularity: 95,
  rating: 4.8,
  reviewCount: 156,
  boost: 1.2, // Manual boost for featured content
  
  // Display data
  image: "https://example.com/safari-image.jpg",
  price: 2499,
  location: "Kenya, Africa",
  category: "safari",
  link: "/trips/trip_123",
  
  // Metadata
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-20T15:30:00Z",
  isActive: true
};

/**
 * SEARCH LOGS COLLECTION
 * Path: /searchLogs/{logId}
 * Track search analytics and popular terms
 */
const searchLogDocument = {
  id: "log_xyz",
  query: "safari kenya",
  userId: "user_abc", // Optional, for logged-in users
  sessionId: "session_123",
  resultsCount: 15,
  clickedResult: {
    type: "trip",
    refId: "trip_123",
    position: 1
  },
  filters: {
    type: ["trip"],
    location: "africa",
    priceRange: [1000, 3000]
  },
  timestamp: "2024-01-20T16:45:00Z",
  userAgent: "Mozilla/5.0...",
  ipAddress: "192.168.1.1" // Hashed for privacy
};

/**
 * SEARCH SUGGESTIONS COLLECTION
 * Path: /searchSuggestions/{suggestionId}
 * Popular and trending search terms
 */
const searchSuggestionDocument = {
  id: "suggestion_safari",
  term: "safari",
  category: "activity",
  popularity: 1250, // Search frequency
  trending: true,
  relatedTerms: ["wildlife", "kenya", "africa", "adventure"],
  lastUpdated: "2024-01-20T12:00:00Z"
};

// Export the structure for reference
module.exports = {
  tripDocument,
  hotelDocument,
  reviewDocument,
  pageDocument,
  searchIndexDocument,
  searchLogDocument,
  searchSuggestionDocument
};

/**
 * FIRESTORE INDEXES REQUIRED
 * Create these composite indexes in Firebase Console:
 * 
 * Collection: searchIndex
 * - isActive (Ascending), popularity (Descending)
 * - type (Ascending), isActive (Ascending), popularity (Descending)
 * - searchKeywords (Array), isActive (Ascending)
 * 
 * Collection: trips
 * - isActive (Ascending), popularity (Descending)
 * - searchKeywords (Array), isActive (Ascending)
 * 
 * Collection: hotels
 * - isActive (Ascending), popularity (Descending)
 * - searchKeywords (Array), isActive (Ascending)
 * 
 * Collection: reviews
 * - isApproved (Ascending), helpfulVotes (Descending)
 * - itemType (Ascending), isApproved (Ascending)
 */
