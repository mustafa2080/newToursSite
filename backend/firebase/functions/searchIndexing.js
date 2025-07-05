const functions = require('firebase-functions');
const admin = require('firebase-admin');
const algoliasearch = require('algoliasearch');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Initialize Algolia (optional)
const algoliaClient = functions.config().algolia ? 
  algoliasearch(
    functions.config().algolia.app_id,
    functions.config().algolia.admin_key
  ) : null;

const searchIndex = algoliaClient ? algoliaClient.initIndex('tourism_search') : null;

/**
 * Generate search keywords from text
 */
const generateSearchKeywords = (text) => {
  if (!text) return [];
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'will'].includes(word));
  
  // Remove duplicates and return
  return [...new Set(words)];
};

/**
 * Create search text from multiple fields
 */
const createSearchText = (fields) => {
  return Object.values(fields)
    .filter(value => value && typeof value === 'string')
    .join(' ')
    .toLowerCase();
};

/**
 * Index trip document for search
 */
exports.indexTripForSearch = functions.firestore
  .document('trips/{tripId}')
  .onWrite(async (change, context) => {
    const tripId = context.params.tripId;
    
    try {
      // Handle deletion
      if (!change.after.exists) {
        await deleteFromSearchIndex('trip', tripId);
        return;
      }

      const tripData = change.after.data();
      
      // Skip if not active
      if (!tripData.isActive) {
        await deleteFromSearchIndex('trip', tripId);
        return;
      }

      const searchData = {
        id: `trip_${tripId}`,
        type: 'trip',
        refId: tripId,
        title: tripData.title,
        description: tripData.description,
        excerpt: tripData.description ? tripData.description.substring(0, 150) + '...' : '',
        location: tripData.location,
        category: tripData.category,
        price: tripData.price,
        rating: tripData.averageRating || 0,
        reviewCount: tripData.reviewCount || 0,
        popularity: tripData.popularity || 0,
        image: tripData.images && tripData.images[0] ? tripData.images[0] : null,
        link: `/trips/${tripId}`,
        
        // Search-optimized fields
        searchKeywords: generateSearchKeywords(`${tripData.title} ${tripData.description} ${tripData.location} ${tripData.category} ${(tripData.tags || []).join(' ')}`),
        searchText: createSearchText({
          title: tripData.title,
          description: tripData.description,
          location: tripData.location,
          category: tripData.category,
          tags: (tripData.tags || []).join(' ')
        }),
        
        // Metadata
        createdAt: tripData.createdAt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true
      };

      // Update Firestore search index
      await db.collection('searchIndex').doc(`trip_${tripId}`).set(searchData);

      // Update Algolia index if available
      if (searchIndex) {
        await searchIndex.saveObject({
          objectID: `trip_${tripId}`,
          ...searchData
        });
      }

      console.log(`Trip ${tripId} indexed for search`);
    } catch (error) {
      console.error(`Error indexing trip ${tripId}:`, error);
    }
  });

/**
 * Index hotel document for search
 */
exports.indexHotelForSearch = functions.firestore
  .document('hotels/{hotelId}')
  .onWrite(async (change, context) => {
    const hotelId = context.params.hotelId;
    
    try {
      // Handle deletion
      if (!change.after.exists) {
        await deleteFromSearchIndex('hotel', hotelId);
        return;
      }

      const hotelData = change.after.data();
      
      // Skip if not active
      if (!hotelData.isActive) {
        await deleteFromSearchIndex('hotel', hotelId);
        return;
      }

      const searchData = {
        id: `hotel_${hotelId}`,
        type: 'hotel',
        refId: hotelId,
        title: hotelData.name,
        description: hotelData.description,
        excerpt: hotelData.description ? hotelData.description.substring(0, 150) + '...' : '',
        location: hotelData.location,
        category: hotelData.category,
        price: hotelData.pricePerNight,
        rating: hotelData.averageRating || 0,
        reviewCount: hotelData.reviewCount || 0,
        popularity: hotelData.popularity || 0,
        image: hotelData.images && hotelData.images[0] ? hotelData.images[0] : null,
        link: `/hotels/${hotelId}`,
        
        // Search-optimized fields
        searchKeywords: generateSearchKeywords(`${hotelData.name} ${hotelData.description} ${hotelData.location} ${hotelData.category} ${(hotelData.amenities || []).join(' ')}`),
        searchText: createSearchText({
          name: hotelData.name,
          description: hotelData.description,
          location: hotelData.location,
          category: hotelData.category,
          amenities: (hotelData.amenities || []).join(' ')
        }),
        
        // Metadata
        createdAt: hotelData.createdAt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true
      };

      // Update Firestore search index
      await db.collection('searchIndex').doc(`hotel_${hotelId}`).set(searchData);

      // Update Algolia index if available
      if (searchIndex) {
        await searchIndex.saveObject({
          objectID: `hotel_${hotelId}`,
          ...searchData
        });
      }

      console.log(`Hotel ${hotelId} indexed for search`);
    } catch (error) {
      console.error(`Error indexing hotel ${hotelId}:`, error);
    }
  });

/**
 * Index review document for search
 */
exports.indexReviewForSearch = functions.firestore
  .document('reviews/{reviewId}')
  .onWrite(async (change, context) => {
    const reviewId = context.params.reviewId;
    
    try {
      // Handle deletion
      if (!change.after.exists) {
        await deleteFromSearchIndex('review', reviewId);
        return;
      }

      const reviewData = change.after.data();
      
      // Skip if not approved or reported
      if (!reviewData.isApproved || reviewData.isReported) {
        await deleteFromSearchIndex('review', reviewId);
        return;
      }

      const searchData = {
        id: `review_${reviewId}`,
        type: 'review',
        refId: reviewId,
        title: reviewData.title || `Review by ${reviewData.userName}`,
        description: reviewData.comment,
        excerpt: reviewData.comment ? reviewData.comment.substring(0, 150) + '...' : '',
        location: null,
        category: 'review',
        price: null,
        rating: reviewData.rating || 0,
        reviewCount: 0,
        popularity: reviewData.helpfulVotes || 0,
        image: null,
        link: `/reviews/${reviewId}`,
        
        // Additional review fields
        itemType: reviewData.itemType,
        itemId: reviewData.itemId,
        itemTitle: reviewData.itemTitle,
        userName: reviewData.userName,
        
        // Search-optimized fields
        searchKeywords: generateSearchKeywords(`${reviewData.title || ''} ${reviewData.comment} ${reviewData.itemTitle} ${reviewData.userName}`),
        searchText: createSearchText({
          title: reviewData.title,
          comment: reviewData.comment,
          itemTitle: reviewData.itemTitle,
          userName: reviewData.userName
        }),
        
        // Metadata
        createdAt: reviewData.createdAt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true
      };

      // Update Firestore search index
      await db.collection('searchIndex').doc(`review_${reviewId}`).set(searchData);

      // Update Algolia index if available
      if (searchIndex) {
        await searchIndex.saveObject({
          objectID: `review_${reviewId}`,
          ...searchData
        });
      }

      console.log(`Review ${reviewId} indexed for search`);
    } catch (error) {
      console.error(`Error indexing review ${reviewId}:`, error);
    }
  });

/**
 * Index page document for search
 */
exports.indexPageForSearch = functions.firestore
  .document('pages/{pageId}')
  .onWrite(async (change, context) => {
    const pageId = context.params.pageId;
    
    try {
      // Handle deletion
      if (!change.after.exists) {
        await deleteFromSearchIndex('page', pageId);
        return;
      }

      const pageData = change.after.data();
      
      // Skip if not published
      if (!pageData.isPublished) {
        await deleteFromSearchIndex('page', pageId);
        return;
      }

      const searchData = {
        id: `page_${pageId}`,
        type: 'page',
        refId: pageId,
        title: pageData.title,
        description: pageData.content,
        excerpt: pageData.excerpt || (pageData.content ? pageData.content.substring(0, 150) + '...' : ''),
        location: null,
        category: pageData.category || 'page',
        price: null,
        rating: 0,
        reviewCount: 0,
        popularity: pageData.priority || 0,
        image: pageData.image || null,
        link: `/${pageData.slug || pageId}`,
        
        // Search-optimized fields
        searchKeywords: generateSearchKeywords(`${pageData.title} ${pageData.content} ${pageData.category} ${(pageData.tags || []).join(' ')}`),
        searchText: createSearchText({
          title: pageData.title,
          content: pageData.content,
          category: pageData.category,
          tags: (pageData.tags || []).join(' ')
        }),
        
        // Metadata
        createdAt: pageData.createdAt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true
      };

      // Update Firestore search index
      await db.collection('searchIndex').doc(`page_${pageId}`).set(searchData);

      // Update Algolia index if available
      if (searchIndex) {
        await searchIndex.saveObject({
          objectID: `page_${pageId}`,
          ...searchData
        });
      }

      console.log(`Page ${pageId} indexed for search`);
    } catch (error) {
      console.error(`Error indexing page ${pageId}:`, error);
    }
  });

/**
 * Delete from search index
 */
const deleteFromSearchIndex = async (type, id) => {
  try {
    const indexId = `${type}_${id}`;
    
    // Delete from Firestore search index
    await db.collection('searchIndex').doc(indexId).delete();
    
    // Delete from Algolia index if available
    if (searchIndex) {
      await searchIndex.deleteObject(indexId);
    }
    
    console.log(`Deleted ${indexId} from search index`);
  } catch (error) {
    console.error(`Error deleting ${type} ${id} from search index:`, error);
  }
};

/**
 * Bulk reindex all content (callable function for admin use)
 */
exports.reindexAllContent = functions.https.onCall(async (data, context) => {
  // Verify admin access
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  try {
    const collections = ['trips', 'hotels', 'reviews', 'pages'];
    let totalIndexed = 0;

    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const type = collectionName.slice(0, -1); // Remove 's' from collection name
        
        // Check if document should be indexed
        const shouldIndex = 
          (type === 'trip' && data.isActive) ||
          (type === 'hotel' && data.isActive) ||
          (type === 'review' && data.isApproved && !data.isReported) ||
          (type === 'page' && data.isPublished);

        if (shouldIndex) {
          // Trigger the indexing function manually
          await indexDocumentForSearch(type, doc.id, data);
          totalIndexed++;
        }
      }
    }

    return { success: true, totalIndexed };
  } catch (error) {
    console.error('Error reindexing content:', error);
    throw new functions.https.HttpsError('internal', 'Reindexing failed');
  }
});

/**
 * Update search suggestions based on popular search terms
 */
exports.updateSearchSuggestions = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      // Get search logs from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const searchLogsSnapshot = await db.collection('searchLogs')
        .where('timestamp', '>=', thirtyDaysAgo)
        .get();

      // Count search term frequency
      const termCounts = {};
      searchLogsSnapshot.forEach(doc => {
        const query = doc.data().query;
        if (query && query.length >= 2) {
          termCounts[query] = (termCounts[query] || 0) + 1;
        }
      });

      // Update suggestions collection
      const suggestions = Object.entries(termCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 100) // Top 100 terms
        .map(([term, count]) => ({
          term,
          popularity: count,
          trending: count > 10, // Mark as trending if searched more than 10 times
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }));

      // Batch update suggestions
      const batch = db.batch();
      suggestions.forEach((suggestion, index) => {
        const docRef = db.collection('searchSuggestions').doc(`suggestion_${index}`);
        batch.set(docRef, suggestion);
      });

      await batch.commit();
      console.log(`Updated ${suggestions.length} search suggestions`);
    } catch (error) {
      console.error('Error updating search suggestions:', error);
    }
  });
