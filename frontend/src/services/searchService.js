import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import algoliasearch from 'algoliasearch';

// Initialize Algolia client (optional - fallback to Firestore if not configured)
const algoliaClient = import.meta.env.VITE_ALGOLIA_APP_ID && import.meta.env.VITE_ALGOLIA_SEARCH_KEY
  ? algoliasearch(
      import.meta.env.VITE_ALGOLIA_APP_ID,
      import.meta.env.VITE_ALGOLIA_SEARCH_KEY
    )
  : null;

const searchIndex = algoliaClient?.initIndex('tourism_search');

class SearchService {
  constructor() {
    this.searchCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Main search function - uses Algolia if available, falls back to Firestore
   */
  async search(query, options = {}) {
    const {
      types = ['trip', 'hotel', 'review', 'page'],
      limit: resultLimit = 20,
      filters = {},
      useCache = true
    } = options;

    // Input validation and sanitization
    const sanitizedQuery = this.sanitizeQuery(query);
    if (!sanitizedQuery || sanitizedQuery.length < 2) {
      return { results: [], totalHits: 0, processingTime: 0 };
    }

    // Check cache first
    const cacheKey = this.getCacheKey(sanitizedQuery, options);
    if (useCache && this.searchCache.has(cacheKey)) {
      const cached = this.searchCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const startTime = Date.now();
    let results;

    try {
      // Use Algolia if available, otherwise fallback to Firestore
      if (algoliaClient && searchIndex) {
        results = await this.searchWithAlgolia(sanitizedQuery, options);
      } else {
        results = await this.searchWithFirestore(sanitizedQuery, options);
      }

      // Log search for analytics
      this.logSearch(sanitizedQuery, results.totalHits, filters);

      // Cache results
      if (useCache) {
        this.searchCache.set(cacheKey, {
          data: results,
          timestamp: Date.now()
        });
      }

      results.processingTime = Date.now() - startTime;
      return results;

    } catch (error) {
      console.error('Search error:', error);
      return { results: [], totalHits: 0, processingTime: Date.now() - startTime, error: error.message };
    }
  }

  /**
   * Search using Algolia for advanced full-text search
   */
  async searchWithAlgolia(query, options) {
    const { types, limit: resultLimit, filters } = options;

    const searchOptions = {
      hitsPerPage: resultLimit,
      attributesToRetrieve: [
        'objectID', 'type', 'title', 'description', 'excerpt', 'image',
        'location', 'price', 'rating', 'reviewCount', 'link', 'category'
      ],
      attributesToHighlight: ['title', 'description', 'excerpt'],
      typoTolerance: true,
      ignorePlurals: true,
      removeStopWords: true
    };

    // Add filters
    const algoliaFilters = [];
    if (types.length < 4) {
      algoliaFilters.push(`type:${types.join(' OR type:')}`);
    }
    if (filters.category) {
      algoliaFilters.push(`category:${filters.category}`);
    }
    if (filters.location) {
      algoliaFilters.push(`location:${filters.location}`);
    }
    if (filters.priceRange) {
      algoliaFilters.push(`price:${filters.priceRange[0]} TO ${filters.priceRange[1]}`);
    }

    if (algoliaFilters.length > 0) {
      searchOptions.filters = algoliaFilters.join(' AND ');
    }

    const response = await searchIndex.search(query, searchOptions);

    return {
      results: this.groupResultsByType(response.hits.map(hit => ({
        id: hit.objectID,
        type: hit.type,
        title: hit.title,
        description: hit.description,
        excerpt: hit.excerpt,
        image: hit.image,
        location: hit.location,
        price: hit.price,
        rating: hit.rating,
        reviewCount: hit.reviewCount,
        link: hit.link,
        category: hit.category,
        highlights: hit._highlightResult
      }))),
      totalHits: response.nbHits,
      processingTime: response.processingTimeMS
    };
  }

  /**
   * Fallback search using Firestore (basic but functional)
   */
  async searchWithFirestore(query, options) {
    const { types, limit: resultLimit } = options;
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 1);
    
    const allResults = [];

    // Search in each collection type
    for (const type of types) {
      try {
        const results = await this.searchInCollection(type, keywords, Math.ceil(resultLimit / types.length));
        allResults.push(...results);
      } catch (error) {
        console.error(`Error searching ${type}:`, error);
      }
    }

    // Sort by relevance (basic scoring)
    const scoredResults = allResults.map(result => ({
      ...result,
      score: this.calculateRelevanceScore(result, keywords)
    })).sort((a, b) => b.score - a.score);

    return {
      results: this.groupResultsByType(scoredResults.slice(0, resultLimit)),
      totalHits: scoredResults.length,
      processingTime: 0
    };
  }

  /**
   * Generate appropriate link for search result based on type and id
   */
  generateResultLink(type, id, data) {
    switch (type) {
      case 'trip':
        return `/trips/${id}`;
      case 'hotel':
        return `/book/hotel/${id}`;
      case 'review':
        // Link to the parent item (trip or hotel) that the review belongs to
        if (data.tripId) return `/trips/${data.tripId}`;
        if (data.hotelId) return `/book/hotel/${data.hotelId}`;
        return `/search?q=${encodeURIComponent(data.title || 'review')}`;
      case 'page':
        return data.path || `/${id}`;
      default:
        return `/search?q=${encodeURIComponent(data.title || data.name || id)}`;
    }
  }

  /**
   * Search within a specific Firestore collection
   */
  async searchInCollection(type, keywords, limitCount) {
    const collectionName = type === 'page' ? 'pages' : `${type}s`;
    const collectionRef = collection(db, collectionName);

    console.log(`🔍 Searching in ${collectionName} for keywords:`, keywords);

    try {
      // First, try to get all documents and filter client-side (more flexible)
      const allDocsQuery = query(collectionRef, limit(100));
      const snapshot = await getDocs(allDocsQuery);

      console.log(`📊 Found ${snapshot.size} documents in ${collectionName}`);

      const results = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`📄 Document ${doc.id}:`, {
          title: data.title || data.name,
          description: data.description,
          hasSearchKeywords: !!data.searchKeywords,
          searchKeywords: data.searchKeywords
        });

        // Check if document matches any keyword
        const matchesKeyword = keywords.some(keyword => {
          const title = (data.title || data.name || '').toLowerCase();
          const description = (data.description || data.short_description || '').toLowerCase();
          const location = (data.location || data.destination || '').toLowerCase();

          return title.includes(keyword) ||
                 description.includes(keyword) ||
                 location.includes(keyword) ||
                 (data.searchKeywords && data.searchKeywords.some(sk => sk.toLowerCase().includes(keyword)));
        });

        if (matchesKeyword) {
          const result = {
            id: doc.id,
            type,
            ...data,
            // Ensure consistent field names
            title: data.title || data.name,
            description: data.description || data.short_description,
            image: data.image || data.images?.[0] || data.thumbnail,
            location: data.location || data.destination,
            // Generate appropriate link for navigation
            link: this.generateResultLink(type, doc.id, data)
          };
          results.push(result);
        }
      });

      console.log(`✅ Found ${results.length} matching results in ${collectionName}`);
      return results.slice(0, limitCount);

    } catch (error) {
      console.error(`❌ Error searching in ${collectionName}:`, error);
      return [];
    }
  }

  /**
   * Calculate enhanced relevance score for search results
   */
  calculateRelevanceScore(result, keywords) {
    let score = 0;
    const title = (result.title || result.name || '').toLowerCase();
    const description = (result.description || result.short_description || '').toLowerCase();
    const location = (result.location || result.destination || '').toLowerCase();

    keywords.forEach(keyword => {
      // Title matches are worth more
      if (title.includes(keyword)) {
        if (title === keyword) score += 50;
        else if (title.startsWith(keyword)) score += 30;
        else score += 20;
      }

      // Description matches
      if (description.includes(keyword)) {
        if (description.startsWith(keyword)) score += 15;
        else score += 10;
      }

      // Location matches
      if (location.includes(keyword)) {
        if (location === keyword) score += 25;
        else score += 15;
      }

      // Search keywords array matches
      if (result.searchKeywords && result.searchKeywords.some(sk =>
        sk.toLowerCase().includes(keyword))) {
        score += 8;
      }
    });

    // Boost by various factors
    if (result.popularity) score += Math.min(result.popularity, 10);
    if (result.rating || result.averageRating) score += Math.min(result.rating || result.averageRating, 5);
    if (result.featured) score += 15;
    if (result.reviewCount) score += Math.min(result.reviewCount * 0.1, 5);

    return score;
  }

  /**
   * Group search results by type for organized display
   */
  groupResultsByType(results) {
    const grouped = {
      trip: [],
      hotel: [],
      review: [],
      page: []
    };

    results.forEach(result => {
      if (grouped[result.type]) {
        grouped[result.type].push(result);
      }
    });

    return grouped;
  }

  /**
   * Generate appropriate link for each content type
   */
  generateLink(type, id, slug) {
    switch (type) {
      case 'trip':
        return `/trips/${id}`;
      case 'hotel':
        return `/hotels/${id}`;
      case 'review':
        return `/reviews/${id}`;
      case 'page':
        return `/${slug || id}`;
      default:
        return `/${type}s/${id}`;
    }
  }

  /**
   * Get search suggestions based on popular terms
   */
  async getSearchSuggestions(partialQuery, limit = 5) {
    try {
      const suggestionsRef = collection(db, 'searchSuggestions');
      const q = query(
        suggestionsRef,
        where('term', '>=', partialQuery.toLowerCase()),
        where('term', '<=', partialQuery.toLowerCase() + '\uf8ff'),
        orderBy('term'),
        orderBy('popularity', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }

  /**
   * Log search for analytics
   */
  async logSearch(query, resultsCount, filters = {}) {
    try {
      const searchLogsRef = collection(db, 'searchLogs');
      await addDoc(searchLogsRef, {
        query: query.toLowerCase(),
        resultsCount,
        filters,
        timestamp: serverTimestamp(),
        sessionId: this.getSessionId(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging search:', error);
    }
  }

  /**
   * Utility functions
   */
  sanitizeQuery(query) {
    return query
      .trim()
      .replace(/[<>\"'%;()&+]/g, '') // Remove potentially harmful characters
      .substring(0, 100); // Limit length
  }

  getCacheKey(query, options) {
    return `${query}_${JSON.stringify(options)}`;
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('searchSessionId');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('searchSessionId', sessionId);
    }
    return sessionId;
  }

  /**
   * Clear search cache
   */
  clearCache() {
    this.searchCache.clear();
  }
}

// Export singleton instance
export default new SearchService();
